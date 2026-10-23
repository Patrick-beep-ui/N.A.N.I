"use client";

import { useState } from "react";
import { apiErrorSchema, sessionSchema, type Session } from "@nani/contracts";

type ViewState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; session: Session }
  | { kind: "error"; message: string; requestId: string | undefined };

export function SessionBootstrap() {
  const [state, setState] = useState<ViewState>({ kind: "idle" });

  async function startSession() {
    setState({ kind: "loading" });

    try {
      const response = await fetch("/api/v1/sessions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          deviceId: "machine:local-windows",
          projectId: "n.a.n.i",
          workingDirectory: null
        })
      });
      const body: unknown = await response.json();

      if (!response.ok) {
        const parsed = apiErrorSchema.safeParse(body);
        throw Object.assign(
          new Error(parsed.success ? parsed.data.error.message : "No se pudo iniciar la sesión."),
          { requestId: parsed.success ? parsed.data.error.requestId : undefined }
        );
      }

      setState({ kind: "success", session: sessionSchema.parse(body) });
    } catch (error) {
      setState({
        kind: "error",
        message: error instanceof Error ? error.message : "Error desconocido.",
        requestId: readRequestId(error)
      });
    }
  }

  return (
    <div className="console-card">
      <div className="status-row">
        <span className={`status-dot status-${state.kind}`} aria-hidden="true" />
        <span>{statusLabel(state)}</span>
      </div>

      {state.kind === "success" ? (
        <div className="snapshot">
          <strong>{state.session.context.displayName}</strong>
          <dl>
            <div><dt>Revisión</dt><dd>{state.session.context.contextRevision}</dd></div>
            <div><dt>Memorias vigentes</dt><dd>{state.session.context.memories.length}</dd></div>
            <div><dt>Fuente</dt><dd>Supabase</dd></div>
            <div><dt>Estado</dt><dd>{state.session.context.sources[0]?.status ?? "desconocido"}</dd></div>
          </dl>
          <small>Sesión {state.session.sessionId}</small>
        </div>
      ) : null}

      {state.kind === "error" ? (
        <p className="error" role="alert">
          {state.message}{state.requestId ? ` Solicitud: ${state.requestId}` : ""}
        </p>
      ) : null}

      <button type="button" onClick={startSession} disabled={state.kind === "loading"}>
        {state.kind === "loading" ? "Cargando contexto..." : "Iniciar N.A.N.I."}
      </button>
    </div>
  );
}

function readRequestId(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null || !("requestId" in error)) return undefined;
  return typeof error.requestId === "string" ? error.requestId : undefined;
}

function statusLabel(state: ViewState): string {
  switch (state.kind) {
    case "idle": return "Sin sesión";
    case "loading": return "Recuperando memoria personal";
    case "success": return "Contexto personal cargado";
    case "error": return "Inicio incompleto";
  }
}
