import { getPrisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import type { Context } from "@/lib/contracts";

export async function resolveOwner(ownerId?: string) {
  if (ownerId) return ownerId;
  const profiles = await getPrisma().profile.findMany({
    select: { userId: true },
    take: 2,
  });
  if (profiles.length !== 1)
    throw new AppError(
      "configuration_error",
      profiles.length
        ? "Hay varios perfiles. Configurá NANI_OWNER_USER_ID en .env."
        : "No hay un perfil inicial en Supabase.",
    );
  return profiles[0]!.userId;
}

export function approvedFilter(
  project: string,
  deviceId: string,
  model: string,
) {
  const filter = memoryFilter(project, deviceId, new Date());
  return {
    ...filter,
    currentRevision: {
      ...filter.currentRevision,
      sensitivity: { in: ["PUBLIC" as const, "INTERNAL" as const] },
      exposure: { has: model },
    },
  };
}

export type MemoryAccess = {
  ownerId: string;
  project: string;
  deviceId: string;
  model: string;
};

/** Searches the database, not the bounded bootstrap snapshot. No model-supplied owner/scope. */
export async function searchMemories(
  access: MemoryAccess,
  query: string,
  offset = 0,
) {
  const terms =
    query
      .toLowerCase()
      .match(/[\p{L}\p{N}]+/gu)
      ?.filter((t) => t.length > 2)
      .slice(0, 12) || [];
  const families: string[] = [];
  if (
    /trabaj|empleo|laboral|entrevist|sagan|naya|carrera/.test(
      query.toLowerCase(),
    )
  )
    families.push("career/");
  if (/proyect|constru|desarroll/.test(query.toLowerCase()))
    families.push("projects/");
  if (/prefer|forma|estilo/.test(query.toLowerCase()))
    families.push("preferences/");
  if (/gust|personal|cine|música|fútbol|carro|aveo/.test(query.toLowerCase()))
    families.push("personal/");
  if (/estudi|académ|univers|posgrado/.test(query.toLowerCase()))
    families.push("education/");
  if (!terms.length) return [];
  const records = await getPrisma().personalMemory.findMany({
    where: {
      userId: access.ownerId,
      ...approvedFilter(access.project, access.deviceId, access.model),
      AND: [
        {
          OR: [
            ...terms.flatMap((term) => [
              { subject: { contains: term, mode: "insensitive" as const } },
              { topicKey: { contains: term, mode: "insensitive" as const } },
              {
                currentRevision: {
                  content: { contains: term, mode: "insensitive" as const },
                },
              },
            ]),
            ...families.map((prefix) => ({ topicKey: { startsWith: prefix } })),
          ],
        },
      ],
    },
    include: { currentRevision: { include: { evidence: { take: 3 } } } },
    orderBy: [{ topicKey: "asc" }, { id: "asc" }],
    skip: offset,
    take: 8,
  });
  return records.map((record) => memoryRecord(record, 1200));
}

export async function readMemory(access: MemoryAccess, id: string) {
  const record = await getPrisma().personalMemory.findFirst({
    where: {
      id,
      userId: access.ownerId,
      ...approvedFilter(access.project, access.deviceId, access.model),
    },
    include: { currentRevision: { include: { evidence: { take: 3 } } } },
  });
  if (!record)
    throw new AppError(
      "memory_not_found",
      "No hay un recuerdo autorizado con ese identificador.",
      404,
    );
  return memoryRecord(record);
}

function memoryRecord(
  record: {
    id: string;
    topicKey: string;
    subject: string;
    scope: string;
    scopeRef: string | null;
    currentRevision: {
      content: string;
      certainty: string;
      revision: number;
      validFrom: Date;
      evidence: { sourceType: string; sourceRef: string; observedAt: Date }[];
    } | null;
  },
  maxContent = 16000,
) {
  const r = record.currentRevision!;
  return {
    id: record.id,
    topic: record.topicKey,
    subject: record.subject,
    scope: record.scope,
    scopeRef: record.scopeRef,
    content: r.content.slice(0, maxContent),
    truncated: r.content.length > maxContent,
    certainty: r.certainty,
    revision: r.revision,
    validFrom: r.validFrom,
    sources: r.evidence.map((e) => ({
      type: e.sourceType,
      reference: e.sourceRef,
      observedAt: e.observedAt,
    })),
  };
}

export function memoryFilter(project: string, deviceId: string, now: Date) {
  return {
    deletedAt: null,
    OR: [
      { scope: "PERSONAL" as const, scopeRef: null },
      { scope: "PROJECT" as const, scopeRef: project },
      { scope: "DEVICE" as const, scopeRef: deviceId },
    ],
    currentRevision: {
      status: "ACTIVE" as const,
      validFrom: { lte: now },
      OR: [{ validTo: null }, { validTo: { gt: now } }],
    },
  };
}

export async function loadContext(
  project: string,
  deviceId: string,
  ownerId?: string,
): Promise<Context> {
  const db = getPrisma();
  // Single-user local mode: never guess when multiple profiles exist.
  ownerId = await resolveOwner(ownerId);
  const profile = await db.profile.findUnique({
    where: { userId: ownerId },
    include: {
      memories: {
        where: memoryFilter(project, deviceId, new Date()),
        include: { currentRevision: true },
        orderBy: [{ kind: "asc" }, { topicKey: "asc" }],
        take: 16,
      },
    },
  });
  if (!profile)
    throw new AppError(
      "profile_not_found",
      "El propietario configurado no tiene un perfil en Supabase.",
      404,
    );
  return {
    displayName: profile.displayName,
    language: profile.language,
    timezone: profile.timezone,
    summary: profile.currentSummary,
    revision: profile.contextRevision,
    loadedAt: new Date().toISOString(),
    memories: profile.memories.flatMap((m) =>
      m.currentRevision
        ? [
            {
              id: m.id,
              subject: m.subject,
              scope: m.scope,
              content: m.currentRevision.content,
              certainty: m.currentRevision.certainty,
              sensitivity: m.currentRevision.sensitivity,
              exposure: m.currentRevision.exposure,
            },
          ]
        : [],
    ),
  };
}

/** Only explicitly allowed, non-sensitive memories cross the provider boundary. */
export function modelContext(context: Context, model: string): string {
  const memories = context.memories.filter(
    (m) =>
      ["PUBLIC", "INTERNAL"].includes(m.sensitivity) &&
      m.exposure.includes(model),
  );
  const payload = {
    name: context.displayName,
    language: context.language,
    timezone: context.timezone,
    memories: [] as {
      id: string;
      subject: string;
      content: string;
      certainty: string;
    }[],
  };
  for (const m of memories) {
    const entry = {
      id: m.id,
      subject: m.subject,
      content: m.content.slice(0, 4000),
      certainty: m.certainty,
    };
    if (
      JSON.stringify({ ...payload, memories: [...payload.memories, entry] })
        .length > 24000
    )
      break;
    payload.memories.push(entry);
  }
  return JSON.stringify(payload);
}
