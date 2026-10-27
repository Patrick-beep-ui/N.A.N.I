import { describe, it, expect, vi, beforeEach } from "vitest";
const deps = vi.hoisted(() => ({
  session: {
    id: "local",
    project: "project-a",
    context: {},
    workingDirectory: "/tmp",
    model: "opencode/big-pickle",
    runtimeId: undefined as string | undefined,
    engramId: undefined as string | undefined,
    busy: false,
    lastUsed: 0,
    controller: undefined as AbortController | undefined,
  },
  register: vi.fn(),
  search: vi.fn(),
  searchPersonal: vi.fn(),
  loadContext: vi.fn(),
  record: vi.fn(),
  create: vi.fn(),
  execute: vi.fn(),
  cancel: vi.fn(),
}));
vi.mock("./sessions", () => ({ getSession: () => deps.session }));
vi.mock("./memory", () => ({
  modelContext: () => "approved context",
  searchMemories: deps.searchPersonal,
  loadContext: deps.loadContext,
}));
vi.mock("./behavior", () => ({
  behaviorInstructions: async () => "Always consult memory; be natural.",
}));
vi.mock("@/integrations/engram", () => ({
  engramClient: () => ({
    register: deps.register,
    search: deps.search,
    record: deps.record,
  }),
}));
vi.mock("@/integrations/opencode", () => ({
  OpenCodeRuntime: class {
    create = deps.create;
    execute = deps.execute;
    cancel = deps.cancel;
  },
}));
import { sendMessage, cancelMessage } from "./chat";
beforeEach(() => {
  vi.resetAllMocks();
  Object.assign(deps.session, {
    busy: false,
    runtimeId: undefined,
    engramId: undefined,
    controller: undefined,
  });
  deps.register.mockResolvedValue("engram-real-id");
  deps.search.mockResolvedValue("scoped history");
  deps.record.mockResolvedValue(undefined);
  deps.create.mockResolvedValue("runtime-real-id");
  deps.loadContext.mockResolvedValue({});
  deps.searchPersonal.mockResolvedValue([
    { id: "personal-one", content: "relevant preference" },
  ]);
  deps.execute.mockResolvedValue({ answer: "done", tools: [] });
});
describe("single assistant workflow", () => {
  it("carries the returned session identities through execution and memory", async () => {
    const result = await sendMessage(
      "local",
      "task",
      () => {},
      new AbortController().signal,
    );
    expect(result.operationalMemory).toBe("saved");
    expect(deps.execute.mock.calls[0]?.[0]).toBe("runtime-real-id");
    expect(deps.record.mock.calls[0]?.slice(0, 2)).toEqual([
      "engram-real-id",
      "project-a",
    ]);
    expect(deps.session.busy).toBe(false);
    expect(deps.searchPersonal).toHaveBeenCalled();
    expect(deps.execute.mock.calls[0]?.[2]).toContain("relevant preference");
    expect(deps.execute.mock.calls[0]?.[2]).toContain("nani-memory_search");
  });
  it("does not hide an execution result when the memory write fails", async () => {
    deps.record.mockRejectedValue(new Error("offline"));
    const result = await sendMessage(
      "local",
      "task",
      () => {},
      new AbortController().signal,
    );
    expect(result.answer).toBe("done");
    expect(result.operationalMemory).toBe("unavailable");
    expect(result.warnings).toHaveLength(1);
    expect(deps.record).toHaveBeenCalledTimes(1);
  });
  it("rejects concurrent sends before creating another runtime execution", async () => {
    deps.session.busy = true;
    await expect(
      sendMessage("local", "task", () => {}, new AbortController().signal),
    ).rejects.toThrow("Ya hay una tarea");
    expect(deps.execute).not.toHaveBeenCalled();
  });
  it("cancels both the local wait and the actual runtime", async () => {
    deps.session.runtimeId = "runtime-real-id";
    deps.session.controller = new AbortController();
    await cancelMessage("local");
    expect(deps.session.controller.signal.aborted).toBe(true);
    expect(deps.cancel).toHaveBeenCalledWith("runtime-real-id");
  });
  it("warns about failed live personal retrieval without fabricating memories", async () => {
    deps.searchPersonal.mockRejectedValue(new Error("offline"));
    const result = await sendMessage(
      "local",
      "task",
      () => {},
      new AbortController().signal,
    );
    expect(result.warnings.join(" ")).toContain("Supabase falló");
    expect(deps.execute.mock.calls[0]?.[2]).not.toContain(
      "relevant preference",
    );
  });
});
