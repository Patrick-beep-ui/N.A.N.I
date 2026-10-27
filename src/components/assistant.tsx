"use client";
import { useEffect, useState } from "react";
import type { ChatResult, Permission, SessionView } from "@/lib/contracts";

type Entry = { role: "user" | "assistant"; text: string };
type Proposal = {
  changeId: string;
  proposal: {
    subject: string;
    content: string;
    quote: string;
    scope: string;
    model: string;
  };
};
export function Assistant() {
  const [project, setProject] = useState("n.a.n.i");
  const [session, setSession] = useState<SessionView | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(
    "Iniciá una sesión para cargar tu contexto.",
  );
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [starting, setStarting] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [tools, setTools] = useState<ChatResult["tools"]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [deciding, setDeciding] = useState(false);
  const projectChanged = !!session && project.trim() !== session.project;

  useEffect(() => {
    if (!session || busy) return;
    let active = true;
    fetch(`/api/v1/sessions/${session.id}/memories`, { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        if (active) setProposals(data);
      })
      .catch(() => {
        if (active)
          setError("No se pudieron consultar las propuestas de memoria.");
      });
    return () => {
      active = false;
    };
  }, [session, busy]);

  async function decide(changeId: string, accept: boolean) {
    if (!session) return;
    setDeciding(true);
    try {
      const r = await fetch(`/api/v1/sessions/${session.id}/memories`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ changeId, accept }),
      });
      const result = await r.json();
      if (!r.ok)
        throw new Error(
          result.error?.message || "No se pudo resolver la propuesta.",
        );
      setProposals((prev) => prev.filter((p) => p.changeId !== changeId));
      setStatus(
        accept
          ? `Memoria activa: ${result.memoryId} · revisión ${result.revision}.`
          : "Propuesta rechazada.",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falló la confirmación.");
    } finally {
      setDeciding(false);
    }
  }

  useEffect(() => {
    if (!busy || !session) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      try {
        const r = await fetch(`/api/v1/sessions/${session.id}/permissions`, {
          cache: "no-store",
        });
        if (r.ok && active) setPermissions(await r.json());
      } catch {}
      if (active) timer = setTimeout(poll, 1500);
    };
    void poll();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [busy, session]);

  async function start() {
    setError("");
    setStarting(true);
    try {
      const r = await fetch("/api/v1/sessions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ project }),
      });
      const body = await r.json();
      if (!r.ok)
        throw new Error(body.error?.message || "No se pudo iniciar la sesión.");
      setSession(body);
      setEntries([]);
      setTools([]);
      setProposals([]);
      setStatus(
        "Contexto de Supabase cargado. Podés conversar o encargar una tarea.",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error de conexión.");
    } finally {
      setStarting(false);
    }
  }
  async function send() {
    if (!session || busy || projectChanged || !message.trim()) return;
    const text = message.trim();
    setMessage("");
    setError("");
    setBusy(true);
    setTools([]);
    setEntries((prev) => [...prev, { role: "user", text }]);
    try {
      const r = await fetch(`/api/v1/sessions/${session.id}/messages`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      if (!r.ok) {
        const body = await r.json();
        throw new Error(body.error?.message || "La solicitud falló.");
      }
      if (!r.body) throw new Error("No se recibió el resultado.");
      const reader = r.body.getReader();
      const decoder = new TextDecoder();
      let pending = "";
      let ended = false;
      while (true) {
        const { value, done } = await reader.read();
        pending += decoder.decode(value, { stream: !done });
        const lines = pending.split("\n");
        pending = lines.pop() || "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line);
          if (event.type === "status") setStatus(event.message);
          if (event.type === "error")
            throw new Error(event.error?.message || "La tarea falló.");
          if (event.type === "result") {
            const result = event.result as ChatResult;
            setEntries((prev) => [
              ...prev,
              { role: "assistant", text: result.answer },
            ]);
            setTools(result.tools);
            setStatus(
              result.operationalMemory === "saved"
                ? "Resultado registrado en Engram."
                : "Respuesta completa; registro operativo sin confirmar.",
            );
            if (result.warnings.length) setError(result.warnings.join(" "));
            ended = true;
          }
        }
        if (done) break;
      }
      if (!ended)
        throw new Error(
          "La conexión terminó sin confirmar el resultado. Revisá OpenCode antes de repetir la tarea.",
        );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falló la conexión.");
      setStatus("Tarea interrumpida.");
    } finally {
      setBusy(false);
      setPermissions([]);
    }
  }
  async function cancel() {
    if (!session) return;
    try {
      const r = await fetch(`/api/v1/sessions/${session.id}/cancel`, {
        method: "POST",
      });
      if (!r.ok) throw new Error();
      setStatus(
        "Cancelación solicitada. Los cambios ya realizados se conservan.",
      );
    } catch {
      setError("No se confirmó la cancelación. Revisá OpenCode.");
    }
  }
  async function reply(permissionId: string, reply: "once" | "reject") {
    if (!session) return;
    try {
      const r = await fetch(`/api/v1/sessions/${session.id}/permissions`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ permissionId, reply }),
      });
      if (!r.ok) {
        const b = await r.json();
        throw new Error(b.error?.message);
      }
      setPermissions((prev) => prev.filter((p) => p.id !== permissionId));
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No se pudo responder el permiso.",
      );
    }
  }
  return (
    <section className="assistant">
      <div className="setup console-card">
        <label htmlFor="project">Proyecto</label>
        <input
          id="project"
          value={project}
          onChange={(e) => setProject(e.target.value)}
          disabled={busy || starting}
        />
        <button onClick={start} disabled={busy || starting}>
          {starting
            ? "Cargando contexto..."
            : session
              ? "Nueva sesión"
              : "Iniciar N.A.N.I."}
        </button>
        {session && (
          <p className="session-info">
            Proyecto activo: {session.project}
            <br />
            {session.context.displayName} · {session.context.memories.length}{" "}
            recuerdos iniciales · revisión {session.context.revision}
            <br />
            {session.model}
            <br />
            <span>Carpeta: {session.workingDirectory}</span>
          </p>
        )}
      </div>
      <div className="console-card chat">
        {projectChanged && (
          <p role="status">
            Iniciá una nueva sesión para cambiar de proyecto y recargar sus
            memorias.
          </p>
        )}
        <p role="status" aria-live="polite">
          {status}
        </p>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <div className="messages" aria-label="Conversación">
          {!entries.length && (
            <p className="empty">
              N.A.N.I. recupera tu contexto de Supabase y utiliza OpenCode para
              trabajar en la carpeta configurada.
            </p>
          )}
          {entries.map((entry, i) => (
            <article key={i} className={`message ${entry.role}`}>
              <strong>{entry.role === "user" ? "Vos" : "N.A.N.I."}</strong>
              <p>{entry.text}</p>
            </article>
          ))}
        </div>
        {permissions.map((p) => (
          <div className="permission" key={p.id}>
            <strong>Permiso de OpenCode: {p.title}</strong>
            <pre>{p.patterns.join("\n")}</pre>
            <button onClick={() => reply(p.id, "once")}>
              Permitir esta vez
            </button>
            <button className="secondary" onClick={() => reply(p.id, "reject")}>
              Denegar
            </button>
          </div>
        ))}
        {!!tools.length && (
          <details>
            <summary>Herramientas reportadas ({tools.length})</summary>
            <ul>
              {tools.map((t, i) => (
                <li key={i}>
                  {t.name}: {t.status}
                </li>
              ))}
            </ul>
          </details>
        )}
        {proposals.map((p) => (
          <div className="permission" key={p.changeId}>
            <strong>Aprendizaje pendiente: {p.proposal.subject}</strong>
            <p>{p.proposal.content}</p>
            <p>
              Fuente: «{p.proposal.quote}» · alcance {p.proposal.scope}
            </p>
            <small>
              Confirmar guarda este contenido como memoria activa y autoriza su
              uso por {p.proposal.model}. No confirmés datos sensibles ni
              secretos.
            </small>
            <p>
              <button
                disabled={busy || deciding}
                onClick={() => decide(p.changeId, true)}
              >
                Confirmar recuerdo
              </button>{" "}
              <button
                className="secondary"
                disabled={busy || deciding}
                onClick={() => decide(p.changeId, false)}
              >
                Rechazar
              </button>
            </p>
          </div>
        ))}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
        >
          <label htmlFor="message">Mensaje o tarea</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={!session || busy || projectChanged}
            rows={4}
            maxLength={16000}
            placeholder="Jefe, ¿en qué trabajamos hoy?"
          />
          <div className="actions">
            <button
              type="submit"
              disabled={!session || busy || projectChanged || !message.trim()}
            >
              Enviar
            </button>
            {busy && (
              <button type="button" className="secondary" onClick={cancel}>
                Cancelar tarea
              </button>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
