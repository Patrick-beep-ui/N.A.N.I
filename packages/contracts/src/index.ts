import { z } from "zod";

export const memoryKindSchema = z.enum([
  "fact",
  "preference",
  "principle",
  "goal",
  "knowledge"
]);

export const memoryScopeSchema = z.enum(["personal", "project", "device"]);
export const memoryCertaintySchema = z.enum(["explicit", "inferred"]);
export const memoryStatusSchema = z.enum([
  "candidate",
  "active",
  "superseded",
  "rejected",
  "deleted"
]);

export const personalMemorySchema = z.object({
  id: z.uuid(),
  kind: memoryKindSchema,
  topicKey: z.string().min(1).max(160),
  scope: memoryScopeSchema,
  scopeRef: z.string().min(1).max(200).nullable(),
  subject: z.string().min(1).max(200),
  content: z.string().min(1).max(4_000),
  certainty: memoryCertaintySchema,
  status: memoryStatusSchema,
  revision: z.number().int().positive(),
  validFrom: z.iso.datetime(),
  sourceRefs: z.array(z.string().min(1).max(500)),
  sensitivity: z.enum(["public", "internal", "sensitive", "restricted"]),
  exposure: z.array(z.string().min(1).max(120))
});

export const contextSourceStateSchema = z.object({
  source: z.enum(["supabase", "engram", "files"]),
  status: z.enum(["loaded", "stale", "unavailable", "not_requested"]),
  revision: z.string().nullable(),
  loadedAt: z.iso.datetime().nullable(),
  detail: z.string().nullable()
});

export const personalContextSnapshotSchema = z.object({
  userId: z.uuid(),
  displayName: z.string().min(1),
  language: z.string().min(2),
  timezone: z.string().min(1),
  summary: z.string().nullable(),
  contextRevision: z.number().int().positive(),
  memories: z.array(personalMemorySchema),
  loadedAt: z.iso.datetime(),
  sources: z.array(contextSourceStateSchema)
});

export const createSessionRequestSchema = z.object({
  deviceId: z.string().min(1).max(160),
  projectId: z.string().min(1).max(160).nullable().optional(),
  workingDirectory: z.string().min(1).max(1_024).nullable().optional()
});

export const sessionSchema = z.object({
  sessionId: z.uuid(),
  userId: z.uuid(),
  deviceId: z.string(),
  projectId: z.string().nullable(),
  workingDirectory: z.string().nullable(),
  createdAt: z.iso.datetime(),
  context: personalContextSnapshotSchema
});

export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    requestId: z.string()
  })
});

export type PersonalMemory = z.infer<typeof personalMemorySchema>;
export type ContextSourceState = z.infer<typeof contextSourceStateSchema>;
export type PersonalContextSnapshot = z.infer<typeof personalContextSnapshotSchema>;
export type CreateSessionRequest = z.infer<typeof createSessionRequestSchema>;
export type Session = z.infer<typeof sessionSchema>;
export type ApiError = z.infer<typeof apiErrorSchema>;
