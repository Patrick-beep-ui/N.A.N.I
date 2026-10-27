import { createOpencodeClient } from "@opencode-ai/sdk/v2";
import { getConfig } from "@/lib/config";
import { AppError } from "@/lib/errors";
import type { Permission } from "@/lib/contracts";

export function opencodeClient(directory: string) {
  const c = getConfig();
  return createOpencodeClient({
    baseUrl: c.opencodeUrl,
    directory,
    headers: c.opencodePassword
      ? {
          Authorization: `Basic ${Buffer.from(`${c.opencodeUsername}:${c.opencodePassword}`).toString("base64")}`,
        }
      : {},
    fetch: (input, init) => fetch(input, { ...init, redirect: "error" }),
  });
}

export class OpenCodeRuntime {
  private client;
  constructor(
    private directory: string,
    private model: string,
  ) {
    // Keep NANI's native tools/skills discoverable even when the task targets another folder.
    // The target working directory is supplied explicitly in the system context.
    this.client = opencodeClient(process.cwd());
  }
  async create(): Promise<string> {
    const [providerID, modelID] = this.model.split("/") as [string, string];
    try {
      const providers = await this.client.provider.list(
        {},
        { throwOnError: true, signal: AbortSignal.timeout(8000) },
      );
      const provider = providers.data.all.find((p) => p.id === providerID);
      if (!provider?.models[modelID])
        throw new AppError(
          "model_unavailable",
          `El modelo ${this.model} no está disponible en OpenCode. No se seleccionará otro automáticamente.`,
        );
      const available = await this.client.tool.ids(
        {},
        { throwOnError: true, signal: AbortSignal.timeout(15000) },
      );
      const required = [
        "nani-memory_search",
        "nani-memory_get",
        "nani-memory_propose",
      ];
      if (!required.every((name) => available.data.includes(name)))
        throw new AppError(
          "memory_tools_unavailable",
          "OpenCode no cargó las herramientas de NANI. Instalá dependencias y reiniciá opencode serve desde la raíz de este repositorio.",
        );
      const result = await this.client.session.create(
        {
          title: "N.A.N.I.",
          permission: [
            { permission: "*", pattern: "*", action: "ask" },
            { permission: "read", pattern: "*", action: "allow" },
            { permission: "glob", pattern: "*", action: "allow" },
            { permission: "grep", pattern: "*", action: "allow" },
            { permission: "skill", pattern: "nani-*", action: "allow" },
            { permission: "nani-memory_search", pattern: "*", action: "allow" },
            { permission: "nani-memory_get", pattern: "*", action: "allow" },
            {
              permission: "nani-memory_propose",
              pattern: "*",
              action: "allow",
            },
            { permission: "supabase*", pattern: "*", action: "deny" },
            { permission: "read", pattern: "*.env*", action: "deny" },
            { permission: "read", pattern: "**/.env*", action: "deny" },
            { permission: "question", pattern: "*", action: "deny" },
          ],
        },
        { throwOnError: true, signal: AbortSignal.timeout(8000) },
      );
      return result.data.id;
    } catch (e) {
      if (e instanceof AppError) throw e;
      throw new AppError(
        "opencode_unavailable",
        "No fue posible conectar OpenCode. Ejecutá opencode serve --hostname 127.0.0.1 --port 4096 y verificá su autenticación.",
        503,
        e,
      );
    }
  }
  async execute(
    id: string,
    message: string,
    system: string,
    signal: AbortSignal,
  ) {
    const [providerID, modelID] = this.model.split("/") as [string, string];
    try {
      const { data } = await this.client.session.prompt(
        {
          sessionID: id,
          model: { providerID, modelID },
          system,
          parts: [{ type: "text", text: message }],
        },
        { throwOnError: true, signal },
      );
      if (data.info.error)
        throw new AppError(
          "execution_failed",
          "OpenCode reportó un error de ejecución. Revisá su terminal; no se guardó como tarea completada.",
        );
      const answer = data.parts
        .filter((p) => p.type === "text")
        .map((p) => p.text)
        .join("\n");
      const history = await this.client.session.messages(
        { sessionID: id, limit: 30 },
        { throwOnError: true, signal },
      );
      const tools = history.data
        .filter(
          (m) =>
            m.info.role === "assistant" &&
            m.info.parentID === data.info.parentID,
        )
        .flatMap((m) =>
          m.parts
            .filter((p) => p.type === "tool")
            .map((p) => ({ name: p.tool, status: p.state.status })),
        );
      if (!answer.trim())
        throw new AppError(
          "empty_response",
          "OpenCode no devolvió una respuesta de texto.",
        );
      return { answer, tools };
    } catch (e) {
      if (signal.aborted) {
        await this.cancel(id).catch(() => {});
        throw new AppError(
          "cancelled",
          "Ejecución cancelada o agotó su tiempo. Los cambios ya realizados no se revierten automáticamente.",
          409,
        );
      }
      if (e instanceof AppError) throw e;
      throw new AppError(
        "execution_failed",
        "Falló la conexión con OpenCode durante la ejecución. Verificá los efectos antes de reintentar.",
        503,
        e,
      );
    }
  }
  async cancel(id: string) {
    await this.client.session.abort(
      { sessionID: id },
      { throwOnError: true, signal: AbortSignal.timeout(8000) },
    );
  }
  async permissions(id: string): Promise<Permission[]> {
    const { data } = await this.client.permission.list(
      {},
      { throwOnError: true, signal: AbortSignal.timeout(8000) },
    );
    return data
      .filter((p) => p.sessionID === id)
      .map((p) => ({ id: p.id, title: p.permission, patterns: p.patterns }));
  }
  async reply(id: string, permissionId: string, reply: "once" | "reject") {
    const pending = await this.permissions(id);
    if (!pending.some((p) => p.id === permissionId))
      throw new AppError(
        "permission_expired",
        "El permiso ya no está pendiente en esta sesión.",
        409,
      );
    await this.client.permission.reply(
      { requestID: permissionId, reply },
      { throwOnError: true, signal: AbortSignal.timeout(8000) },
    );
  }
}
