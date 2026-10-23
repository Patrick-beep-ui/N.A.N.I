import { getPrisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import type { Context } from "@/lib/contracts";

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
  if (!ownerId) {
    const profiles = await db.profile.findMany({
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
    ownerId = profiles[0]!.userId;
  }
  const profile = await db.profile.findUnique({
    where: { userId: ownerId },
    include: {
      memories: {
        where: memoryFilter(project, deviceId, new Date()),
        include: { currentRevision: true },
        orderBy: [{ kind: "asc" }, { topicKey: "asc" }],
        take: 100,
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
