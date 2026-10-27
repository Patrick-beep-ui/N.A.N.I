import { createHash, randomUUID } from "node:crypto";
import { z } from "zod";
import { getPrisma } from "@/lib/prisma";
import { AppError, redactSecrets } from "@/lib/errors";
import type { LocalSession } from "./sessions";

export const proposalSchema = z.object({
  topic: z.string().regex(/^[a-z0-9][a-z0-9/-]{1,119}$/),
  subject: z.string().trim().min(3).max(160),
  content: z.string().trim().min(5).max(2000),
  quote: z.string().trim().min(5).max(1000),
  scope: z.enum(["PERSONAL", "PROJECT"]),
  kind: z.enum(["FACT", "PREFERENCE", "PRINCIPLE", "GOAL", "KNOWLEDGE"]),
});

export async function proposeMemory(session: LocalSession, input: unknown) {
  const data = proposalSchema.parse(input);
  if (!session.currentMessage?.includes(data.quote))
    throw new AppError(
      "invalid_evidence",
      "La cita debe aparecer literalmente en el mensaje actual del usuario.",
      400,
    );
  if (
    redactSecrets(data.content) !== data.content ||
    redactSecrets(data.quote) !== data.quote
  )
    throw new AppError(
      "sensitive_content",
      "No se proponen credenciales ni URLs mediante aprendizaje automático.",
      400,
    );
  const scopeRef = data.scope === "PROJECT" ? session.project : null;
  const db = getPrisma();
  // Reuse an identical pending proposal; never silently overwrite active knowledge.
  const changeId = randomUUID();
  const digest = createHash("sha256")
    .update(JSON.stringify([session.id, session.currentMessage, data]))
    .digest("hex");
  const previous = await db.memoryChange.findFirst({
    where: {
      userId: session.ownerId,
      status: "PENDING",
      result: { path: ["digest"], equals: digest },
    },
  });
  if (previous)
    return { changeId: previous.changeId, status: "PENDING" as const };
  const existing = await db.personalMemory.findFirst({
    where: {
      userId: session.ownerId,
      topicKey: data.topic,
      scope: data.scope,
      scopeRef,
      deletedAt: null,
    },
    include: { currentRevision: true },
  });
  if (
    existing?.currentRevision &&
    (!["PUBLIC", "INTERNAL"].includes(existing.currentRevision.sensitivity) ||
      !existing.currentRevision.exposure.includes(session.model))
  )
    throw new AppError(
      "memory_unavailable",
      "Ese tema no puede modificarse mediante aprendizaje del modelo actual.",
      403,
    );
  await db.memoryChange.create({
    data: {
      changeId,
      userId: session.ownerId,
      operation: existing ? "REVISE" : "CREATE",
      memoryId: existing?.id,
      expectedRevision: existing?.currentRevision?.revision,
      status: "PENDING",
      result: {
        ...data,
        scopeRef,
        digest,
        model: session.model,
        sourceRef: `nani-session:${session.id}`,
        source: "USER_STATEMENT",
      },
    },
  });
  return { changeId, status: "PENDING" as const };
}

export async function pendingMemories(session: LocalSession) {
  const changes = await getPrisma().memoryChange.findMany({
    where: pendingFilter(session),
    orderBy: { createdAt: "asc" },
    take: 20,
  });
  return changes.map((c) => ({ changeId: c.changeId, proposal: c.result }));
}

export async function decideMemory(
  session: LocalSession,
  changeId: string,
  accept: boolean,
) {
  if (session.busy)
    throw new AppError(
      "session_busy",
      "Terminá el turno antes de confirmar o rechazar recuerdos.",
      409,
    );
  return getPrisma().$transaction(async (tx) => {
    // Serialize confirmations for this owner; preserves nullable-scope uniqueness and revision order.
    await tx.$queryRaw`SELECT user_id FROM profiles WHERE user_id = ${session.ownerId}::uuid FOR UPDATE`;
    const change = await tx.memoryChange.findFirst({
      where: { changeId, ...pendingFilter(session) },
    });
    if (!change || change.status !== "PENDING")
      throw new AppError(
        "proposal_resolved",
        "La propuesta ya se resolvió.",
        409,
      );
    if (!accept) {
      await tx.memoryChange.update({
        where: { changeId },
        data: { operation: "REJECT", status: "APPLIED", appliedAt: new Date() },
      });
      return { status: "REJECTED" };
    }
    const data = proposalSchema
      .extend({
        scopeRef: z.string().nullable(),
        model: z.string(),
        sourceRef: z.string(),
      })
      .parse(change.result);
    const existing = await tx.personalMemory.findFirst({
      where: {
        userId: session.ownerId,
        topicKey: data.topic,
        scope: data.scope,
        scopeRef: data.scopeRef,
        deletedAt: null,
      },
      include: { currentRevision: true },
    });
    if (
      (existing?.currentRevision?.revision ?? null) !==
        change.expectedRevision ||
      (existing?.id ?? null) !== change.memoryId
    )
      throw new AppError(
        "memory_conflict",
        "El recuerdo cambió. Generá una propuesta nueva antes de confirmar.",
        409,
      );
    const memory =
      existing ||
      (await tx.personalMemory.create({
        data: {
          userId: session.ownerId,
          topicKey: data.topic,
          subject: data.subject,
          kind: data.kind,
          scope: data.scope,
          scopeRef: data.scopeRef,
        },
      }));
    const now = new Date();
    if (existing?.currentRevisionId)
      await tx.memoryRevision.update({
        where: { id: existing.currentRevisionId },
        data: { status: "SUPERSEDED", validTo: now },
      });
    const revision = await tx.memoryRevision.create({
      data: {
        memoryId: memory.id,
        revision: (existing?.currentRevision?.revision || 0) + 1,
        content: data.content,
        certainty: "EXPLICIT",
        status: "ACTIVE",
        source: "USER_STATEMENT",
        sensitivity: "INTERNAL",
        exposure: [data.model],
        evidence: {
          create: {
            sourceType: "user_confirmed_proposal",
            sourceRef: data.sourceRef,
            excerpt: data.quote,
          },
        },
      },
    });
    await tx.personalMemory.update({
      where: { id: memory.id },
      data: {
        currentRevisionId: revision.id,
        subject: data.subject,
        kind: data.kind,
      },
    });
    await tx.memoryChange.update({
      where: { changeId },
      data: { status: "APPLIED", memoryId: memory.id, appliedAt: now },
    });
    await tx.profile.update({
      where: { userId: session.ownerId },
      data: { contextRevision: { increment: 1 } },
    });
    return {
      status: "ACTIVE",
      memoryId: memory.id,
      revision: revision.revision,
    };
  });
}

function pendingFilter(session: LocalSession) {
  return {
    userId: session.ownerId,
    status: "PENDING" as const,
    AND: [
      { result: { path: ["model"], equals: session.model } },
      {
        OR: [
          { result: { path: ["scope"], equals: "PERSONAL" } },
          {
            AND: [
              { result: { path: ["scope"], equals: "PROJECT" } },
              { result: { path: ["scopeRef"], equals: session.project } },
            ],
          },
        ],
      },
    ],
  };
}
