import { createServer, type Server } from "node:http";
import { once } from "node:events";
import { beforeAll, afterAll, describe, it, expect, vi } from "vitest";
import { EngramClient } from "./engram";
import { OpenCodeRuntime } from "./opencode";
let server: Server;
let url: string;
const calls: {
  method: string;
  path: string;
  query: URLSearchParams;
  body: any;
}[] = [];
beforeAll(async () => {
  server = createServer(async (req, res) => {
    const u = new URL(req.url!, "http://localhost");
    let body = "";
    for await (const chunk of req) body += chunk;
    calls.push({
      method: req.method!,
      path: u.pathname,
      query: u.searchParams,
      body: body ? JSON.parse(body) : null,
    });
    const json = (data: unknown, status = 200) => {
      res.writeHead(status, { "content-type": "application/json" });
      res.end(JSON.stringify(data));
    };
    if (u.pathname === "/provider")
      return json({
        all: [
          { id: "opencode", models: { "big-pickle": { id: "big-pickle" } } },
        ],
        default: {},
        connected: ["opencode"],
      });
    if (u.pathname === "/session" && req.method === "POST")
      return json({ id: "runtime-one" });
    if (u.pathname === "/session/runtime-one/message" && req.method === "POST")
      return json({
        info: { role: "assistant", parentID: "user-one" },
        parts: [{ type: "text", text: "Terminado" }],
      });
    if (u.pathname === "/session/runtime-one/message" && req.method === "GET")
      return json([
        {
          info: { role: "assistant", parentID: "user-one" },
          parts: [
            { type: "tool", tool: "read", state: { status: "completed" } },
          ],
        },
      ]);
    if (u.pathname === "/session/runtime-one/messages") return json([]);
    if (u.pathname === "/permission")
      return json([
        {
          id: "permission-one",
          sessionID: "runtime-one",
          permission: "bash",
          patterns: ["git status"],
          metadata: {},
          always: [],
        },
        {
          id: "permission-other",
          sessionID: "someone-else",
          permission: "edit",
          patterns: ["x"],
          metadata: {},
          always: [],
        },
      ]);
    if (u.pathname === "/permission/permission-one/reply") return json(true);
    if (u.pathname === "/sessions")
      return json({ id: "engram-one", status: "created" }, 201);
    if (u.pathname === "/search")
      return json([
        { id: 7, title: "Decision", content: "Keep DI", project: "project-a" },
        {
          id: 8,
          title: "Foreign",
          content: "not visible",
          project: "project-b",
        },
      ]);
    if (u.pathname === "/observations") return json({ error: "offline" }, 503);
    return json(true);
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  url = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
});
afterAll(() => {
  server.closeAllConnections();
  server.close();
  vi.unstubAllEnvs();
});
describe("real HTTP adapter contracts", () => {
  it("registers and searches Engram with an explicit project; never retries an uncertain write", async () => {
    const client = new EngramClient(url);
    expect(await client.register("local-one", "project-a", process.cwd())).toBe(
      "engram-one",
    );
    const result = await client.search("project-a", "architecture DI");
    expect(result).toContain("Keep DI");
    expect(result).not.toContain("not visible");
    expect(calls.find((c) => c.path === "/search")?.query.get("project")).toBe(
      "project-a",
    );
    const before = calls.filter((c) => c.path === "/observations").length;
    await expect(
      client.record(
        "engram-one",
        "project-a",
        "task",
        "answer",
        "operation-one",
      ),
    ).rejects.toThrow();
    expect(calls.filter((c) => c.path === "/observations")).toHaveLength(
      before + 1,
    );
  });
  it("creates an OpenCode session without auto-approvals and keeps permissions scoped", async () => {
    vi.stubEnv("OPENCODE_BASE_URL", url);
    const runtime = new OpenCodeRuntime(process.cwd(), "opencode/big-pickle");
    const id = await runtime.create();
    expect(id).toBe("runtime-one");
    expect(
      calls.find((c) => c.path === "/session")?.body.permission,
    ).toContainEqual({ permission: "*", pattern: "*", action: "ask" });
    expect(await runtime.permissions(id)).toEqual([
      { id: "permission-one", title: "bash", patterns: ["git status"] },
    ]);
    await expect(runtime.reply(id, "permission-other", "once")).rejects.toThrow(
      "pendiente",
    );
    await runtime.reply(id, "permission-one", "once");
    expect(calls.filter((c) => c.path.endsWith("/reply"))).toHaveLength(1);
  });
  it("executes through the SDK with the explicit model and returns real tool states", async () => {
    vi.stubEnv("OPENCODE_BASE_URL", url);
    const runtime = new OpenCodeRuntime(process.cwd(), "opencode/big-pickle");
    const result = await runtime.execute(
      "runtime-one",
      "Read project",
      "personal context",
      new AbortController().signal,
    );
    expect(result).toEqual({
      answer: "Terminado",
      tools: [{ name: "read", status: "completed" }],
    });
    expect(
      calls.find(
        (c) => c.method === "POST" && c.path === "/session/runtime-one/message",
      )?.body,
    ).toMatchObject({
      model: { providerID: "opencode", modelID: "big-pickle" },
      system: "personal context",
      parts: [{ type: "text", text: "Read project" }],
    });
  });
  it("never falls back when the requested model is unavailable", async () => {
    const before = calls.filter((c) => c.path === "/session").length;
    const runtime = new OpenCodeRuntime(process.cwd(), "opencode/unavailable");
    await expect(runtime.create()).rejects.toThrow("no está disponible");
    expect(calls.filter((c) => c.path === "/session")).toHaveLength(before);
  });
});
