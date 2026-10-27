import { afterEach, describe, expect, it, vi } from "vitest";
import { search, get, propose } from "../../.opencode/tools/nani-memory";
import { POST } from "@/app/api/v1/memory-tools/route";
const deps = vi.hoisted(() => ({
  session: {
    ownerId: "owner",
    project: "a",
    model: "model/x",
    deviceId: "device",
    proposals: [] as string[],
  },
  lookup: vi.fn(),
  search: vi.fn(),
  read: vi.fn(),
  propose: vi.fn(),
}));
vi.mock("@/services/sessions", () => ({ getRuntimeSession: deps.lookup }));
vi.mock("@/services/memory", () => ({
  searchMemories: deps.search,
  readMemory: deps.read,
}));
vi.mock("@/services/learning", () => ({ proposeMemory: deps.propose }));
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.resetAllMocks();
});
describe("native memory tools", () => {
  it("carries trusted runtime identity through HTTP, not model-controlled scope", async () => {
    deps.lookup.mockReturnValue(deps.session);
    deps.search.mockResolvedValue([
      { id: "memory", sources: [{ reference: "statement" }] },
    ]);
    vi.stubGlobal("fetch", async (url: URL, init: RequestInit) => {
      expect(new Headers(init.headers).get("origin")).toBe(
        "http://127.0.0.1:3000",
      );
      return POST(new Request(url, init));
    });
    const result = await search.execute({ query: "entrevista", offset: 8 }, {
      sessionID: "trusted-runtime",
    } as Parameters<typeof search.execute>[1]);
    expect(deps.lookup).toHaveBeenCalledWith("trusted-runtime");
    expect(deps.search).toHaveBeenCalledWith(deps.session, "entrevista", 8);
    expect(result).toContain("statement");
  });
  it("rejects unbound runtime sessions before any database access", async () => {
    deps.lookup.mockImplementation(() => {
      throw new Error("unbound");
    });
    vi.stubGlobal("fetch", (url: URL, init: RequestInit) =>
      POST(new Request(url, init)),
    );
    await expect(
      get.execute({ id: "e3857d60-95da-4af6-898c-66d742623f18" }, {
        sessionID: "foreign",
      } as Parameters<typeof get.execute>[1]),
    ).rejects.toThrow();
    expect(deps.read).not.toHaveBeenCalled();
  });
  it("rejects remote URLs before transmitting source text", async () => {
    const spy = vi.fn();
    vi.stubGlobal("fetch", spy);
    vi.stubEnv("NANI_BASE_URL", "https://example.com");
    await expect(
      search.execute({ query: "personal" }, {
        sessionID: "runtime",
      } as Parameters<typeof search.execute>[1]),
    ).rejects.toThrow("local HTTP");
    expect(spy).not.toHaveBeenCalled();
  });
  it("returns the persisted proposal ID, never an active-memory claim", async () => {
    deps.lookup.mockReturnValue(deps.session);
    deps.propose.mockResolvedValue({ changeId: "change", status: "PENDING" });
    vi.stubGlobal("fetch", (url: URL, init: RequestInit) =>
      POST(new Request(url, init)),
    );
    const result = await propose.execute(
      {
        topic: "preferences/examples",
        subject: "Examples",
        content: "Prefers examples",
        quote: "examples",
        scope: "PERSONAL",
        kind: "PREFERENCE",
      },
      { sessionID: "runtime" } as Parameters<typeof propose.execute>[1],
    );
    expect(JSON.parse(result as string)).toEqual({
      changeId: "change",
      status: "PENDING",
    });
  });
});
