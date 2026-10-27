import { tool } from "@opencode-ai/plugin";

async function call(runtimeSessionId: string, action: string, args: unknown) {
  const base = new URL(process.env.NANI_BASE_URL || "http://127.0.0.1:3000");
  if (
    base.protocol !== "http:" ||
    !["127.0.0.1", "localhost", "[::1]"].includes(base.hostname) ||
    base.username ||
    base.password ||
    base.search ||
    base.hash
  )
    throw new Error(
      "NANI_BASE_URL debe ser una URL local HTTP sin credenciales.",
    );
  const response = await fetch(new URL("/api/v1/memory-tools", base), {
    method: "POST",
    redirect: "error",
    signal: AbortSignal.timeout(15000),
    headers: { "content-type": "application/json", Origin: base.origin },
    body: JSON.stringify({ runtimeSessionId, action, args }),
  });
  const result = await response.json();
  if (!response.ok)
    throw new Error(
      result.error?.message || "Falló la herramienta de memoria.",
    );
  return JSON.stringify(result);
}

export const search = tool({
  description:
    "Buscar contexto personal de Patrick en Supabase. Usar antes de recomendaciones, trabajo o preguntas que dependen de sus antecedentes. Devuelve recuerdos autorizados con ID y fuente; paginar con offset si hay 8 resultados. No requiere pedir al usuario que recuerde.",
  args: {
    query: tool.schema.string().min(2).max(300),
    offset: tool.schema.number().int().min(0).max(5000).optional(),
  },
  execute: (args, context) => call(context.sessionID, "search", args),
});
export const get = tool({
  description:
    "Recuperar contenido y procedencia de un recuerdo por ID devuelto por búsqueda. El servidor comprueba propietario, proyecto, vigencia y exposición al modelo.",
  args: { id: tool.schema.string().uuid() },
  execute: (args, context) => call(context.sessionID, "get", args),
});
export const propose = tool({
  description:
    "Proponer aprendizaje personal en Supabase con cita literal del mensaje actual. No confirma ni activa el recuerdo: el usuario revisa y confirma en la UI. No guardar conversaciones enteras, secretos o datos sensibles.",
  args: {
    topic: tool.schema.string(),
    subject: tool.schema.string(),
    content: tool.schema.string(),
    quote: tool.schema.string(),
    scope: tool.schema.enum(["PERSONAL", "PROJECT"]),
    kind: tool.schema.enum([
      "FACT",
      "PREFERENCE",
      "PRINCIPLE",
      "GOAL",
      "KNOWLEDGE",
    ]),
  },
  execute: (args, context) => call(context.sessionID, "propose", args),
});
