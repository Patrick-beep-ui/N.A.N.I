import { randomUUID } from "node:crypto";
import { getConfig } from "@/lib/config";
import type { Context, SessionView } from "@/lib/contracts";
import { AppError } from "@/lib/errors";
import { loadContext, resolveOwner } from "./memory";
export type LocalSession = {
  id: string;
  project: string;
  context: Context;
  workingDirectory: string;
  model: string;
  ownerId: string;
  deviceId: string;
  currentMessage?: string;
  runtimeId?: string;
  engramId?: string;
  busy: boolean;
  lastUsed: number;
  controller?: AbortController;
};
const state = globalThis as typeof globalThis & {
  naniSessions?: Map<string, LocalSession>;
};
const sessions = (state.naniSessions ??= new Map<string, LocalSession>());
export async function startSession(project: string): Promise<SessionView> {
  for (const [id, s] of sessions)
    if (!s.busy && Date.now() - s.lastUsed > 6 * 3600000) sessions.delete(id);
  if (sessions.size >= 64)
    throw new AppError(
      "session_limit",
      "Hay demasiadas sesiones abiertas. Reiniciá N.A.N.I. para liberar las anteriores.",
      429,
    );
  const c = getConfig();
  let ownerId: string;
  let context: Context;
  try {
    ownerId = await resolveOwner(c.ownerId);
    context = await loadContext(project, c.deviceId, ownerId);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      "database_unavailable",
      "No fue posible leer tu perfil en Supabase. Revisá DATABASE_URL y el registro del servidor.",
      503,
      error,
    );
  }
  const session: LocalSession = {
    id: randomUUID(),
    project,
    context,
    workingDirectory: c.workingDirectory,
    model: c.model,
    ownerId,
    deviceId: c.deviceId,
    busy: false,
    lastUsed: Date.now(),
  };
  sessions.set(session.id, session);
  return {
    id: session.id,
    project,
    context,
    workingDirectory: c.workingDirectory,
    model: c.model,
    opencode: "Se conecta al enviar",
    engram: "Se consulta al enviar",
  };
}
export function getSession(id: string): LocalSession {
  const s = sessions.get(id);
  if (!s || (!s.busy && Date.now() - s.lastUsed > 6 * 3600000)) {
    sessions.delete(id);
    throw new AppError(
      "session_expired",
      "La sesión expiró o se reinició el servidor. Iniciá una nueva.",
      404,
    );
  }
  s.lastUsed = Date.now();
  return s;
}

/** Native tool context supplies the runtime ID, never the model's arguments. */
export function getRuntimeSession(runtimeId: string): LocalSession {
  const session = [...sessions.values()].find(
    (s) => s.runtimeId === runtimeId && s.busy && !s.controller?.signal.aborted,
  );
  if (!session)
    throw new AppError(
      "session_expired",
      "La herramienta requiere un turno activo desde N.A.N.I.",
      403,
    );
  return session;
}
