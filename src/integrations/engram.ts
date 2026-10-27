import { z } from "zod";
import { getConfig } from "@/lib/config";
import { AppError, redactSecrets } from "@/lib/errors";

export class EngramClient {
  constructor(
    private readonly baseUrl: string,
    private readonly token = "",
  ) {}
  async request(path: string, body?: unknown): Promise<unknown> {
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        method: body === undefined ? "GET" : "POST",
        cache: "no-store",
        redirect: "error",
        headers: {
          ...(body === undefined ? {} : { "content-type": "application/json" }),
          ...(this.token ? { authorization: `Bearer ${this.token}` } : {}),
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        signal: AbortSignal.timeout(8000),
      });
    } catch {
      throw new AppError(
        "engram_unavailable",
        "Engram no responde. Ejecutá engram serve y verificá ENGRAM_BASE_URL.",
      );
    }
    if (!response.ok)
      throw new AppError(
        "engram_unavailable",
        `Engram rechazó la operación (${response.status}). Revisá la versión y el token configurado.`,
      );
    return response.json();
  }
  async register(id: string, project: string, directory: string) {
    const result = await this.request("/sessions", { id, project, directory });
    return z.object({ id: z.string().min(1) }).parse(result).id;
  }
  async search(project: string, message: string): Promise<string> {
    const terms =
      message
        .match(/[\p{L}\p{N}_]+/gu)
        ?.slice(0, 12)
        .join(" ") || "contexto";
    const params = new URLSearchParams({
      q: terms,
      project,
      limit: "5",
      match_mode: "any",
    });
    const results = z
      .array(
        z.object({
          id: z.number(),
          title: z.string(),
          content: z.string(),
          project: z.string().optional(),
        }),
      )
      .parse(await this.request(`/search?${params}`));
    return results
      .filter((r) => !r.project || r.project === project)
      .map((r) => `[${r.id}] ${r.title}\n${r.content.slice(0, 1800)}`)
      .join("\n\n");
  }
  async record(
    sessionId: string,
    project: string,
    message: string,
    result: string,
    operationId: string,
    tools: { name: string; status: string }[] = [],
  ) {
    // No automatic retries after a possibly committed write.
    await this.request("/observations", {
      session_id: sessionId,
      project,
      scope: "project",
      type: "discovery",
      title: "Interacción mediante N.A.N.I.",
      content: `Solicitud: ${redactSecrets(message).slice(0, 1500)}\nResultado reportado por OpenCode (no verificación independiente): ${redactSecrets(result).slice(0, 3500)}\nEstados de herramientas: ${JSON.stringify(tools.slice(0, 30))}\n${tools.length ? "Los estados no prueban por sí solos todos los efectos afirmados." : "Sin herramientas reportadas en este turno; no considerar acciones verificadas."}`,
      operation_id: operationId,
      capture_prompt: false,
    });
  }
}
export function engramClient() {
  const c = getConfig();
  return new EngramClient(c.engramUrl, c.engramToken);
}
