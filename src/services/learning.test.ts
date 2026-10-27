import { beforeEach, describe, expect, it, vi } from "vitest";
const db = vi.hoisted(() => ({
  memoryChange: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  personalMemory: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
  memoryRevision: { create: vi.fn(), update: vi.fn() },
  profile: { update: vi.fn() },
  $transaction: vi.fn(),
  $queryRaw: vi.fn(),
}));
vi.mock("@/lib/prisma", () => ({ getPrisma: () => db }));
import { proposeMemory, decideMemory, pendingMemories } from "./learning";
import type { LocalSession } from "./sessions";
const session = {
  id: "session",
  ownerId: "owner",
  model: "opencode/big-pickle",
  project: "a",
  currentMessage: "Prefiero ejemplos concretos para estudiar.",
} as LocalSession;
const input = {
  topic: "preferences/study",
  subject: "Aprendizaje",
  content: "Prefiere ejemplos concretos para estudiar.",
  quote: "Prefiero ejemplos concretos",
  kind: "PREFERENCE",
  scope: "PERSONAL",
};
beforeEach(() => {
  vi.resetAllMocks();
  db.$transaction.mockImplementation((fn) => fn(db));
  db.memoryChange.findFirst.mockResolvedValue(null);
  db.personalMemory.findFirst.mockResolvedValue(null);
  db.personalMemory.create.mockResolvedValue({ id: "memory" });
  db.memoryRevision.create.mockResolvedValue({ id: "revision", revision: 1 });
});
describe("reviewed learning", () => {
  it("does not let an active runtime turn confirm its own proposals", async () => {
    await expect(
      decideMemory({ ...session, busy: true }, "change", true),
    ).rejects.toThrow("Terminá el turno");
    expect(db.$transaction).not.toHaveBeenCalled();
  });
  it("requires actual source text and only creates a pending change", async () => {
    await expect(
      proposeMemory(session, { ...input, quote: "invented statement" }),
    ).rejects.toThrow("literalmente");
    await proposeMemory(session, input);
    expect(db.memoryChange.create.mock.calls[0]![0].data).toMatchObject({
      userId: "owner",
      status: "PENDING",
      result: { quote: input.quote, scopeRef: null, model: session.model },
    });
    expect(db.memoryRevision.create).not.toHaveBeenCalled();
  });
  it("will not downgrade sensitive existing knowledge", async () => {
    db.personalMemory.findFirst.mockResolvedValue({
      currentRevision: { sensitivity: "SENSITIVE", exposure: [] },
    });
    await expect(proposeMemory(session, input)).rejects.toThrow(
      "no puede modificarse",
    );
    expect(db.memoryChange.create).not.toHaveBeenCalled();
  });
  it("only confirmation activates a revision with evidence and model exposure", async () => {
    db.memoryChange.findFirst.mockResolvedValue({
      status: "PENDING",
      expectedRevision: null,
      memoryId: null,
      result: {
        ...input,
        scopeRef: null,
        model: session.model,
        sourceRef: "nani:session",
      },
    });
    const result = await decideMemory(session, "change", true);
    expect(result).toMatchObject({
      status: "ACTIVE",
      memoryId: "memory",
      revision: 1,
    });
    expect(db.memoryRevision.create.mock.calls[0]![0].data).toMatchObject({
      status: "ACTIVE",
      certainty: "EXPLICIT",
      exposure: [session.model],
      evidence: { create: { excerpt: input.quote } },
    });
    expect(db.profile.update).toHaveBeenCalled();
  });
  it("rejects stale updates without superseding the current revision", async () => {
    db.memoryChange.findFirst.mockResolvedValue({
      status: "PENDING",
      expectedRevision: 1,
      memoryId: "memory",
      result: {
        ...input,
        scopeRef: null,
        model: session.model,
        sourceRef: "nani:session",
      },
    });
    db.personalMemory.findFirst.mockResolvedValue({
      id: "memory",
      currentRevision: { revision: 2 },
    });
    await expect(decideMemory(session, "change", true)).rejects.toThrow(
      "cambió",
    );
    expect(db.memoryRevision.update).not.toHaveBeenCalled();
  });
  it("replaces an existing revision only after confirmation, retaining history", async () => {
    db.memoryChange.findFirst.mockResolvedValue({
      status: "PENDING",
      expectedRevision: 1,
      memoryId: "memory",
      result: {
        ...input,
        scopeRef: null,
        model: session.model,
        sourceRef: "nani:session",
      },
    });
    db.personalMemory.findFirst.mockResolvedValue({
      id: "memory",
      currentRevisionId: "old-revision",
      currentRevision: { revision: 1 },
    });
    db.memoryRevision.create.mockResolvedValue({
      id: "new-revision",
      revision: 2,
    });
    await decideMemory(session, "change", true);
    expect(db.memoryRevision.update.mock.calls[0]![0]).toMatchObject({
      where: { id: "old-revision" },
      data: { status: "SUPERSEDED", validTo: expect.any(Date) },
    });
    expect(db.personalMemory.update.mock.calls[0]![0]).toMatchObject({
      data: { currentRevisionId: "new-revision" },
    });
  });
  it("reviews pending changes after a restart but constrains project and model", async () => {
    db.memoryChange.findMany.mockResolvedValue([]);
    await pendingMemories(session);
    const filter = JSON.stringify(
      db.memoryChange.findMany.mock.calls[0]![0].where,
    );
    expect(filter).toContain("owner");
    expect(filter).toContain(session.model);
    expect(filter).toContain("scopeRef");
  });
  it("rejects a proposal without creating a memory", async () => {
    db.memoryChange.findFirst.mockResolvedValue({ status: "PENDING" });
    await decideMemory(session, "change", false);
    expect(db.memoryChange.update.mock.calls[0]![0].data).toMatchObject({
      operation: "REJECT",
      status: "APPLIED",
    });
    expect(db.personalMemory.create).not.toHaveBeenCalled();
  });
});
