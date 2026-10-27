import { beforeEach, describe, it, expect, vi } from "vitest";
const db = vi.hoisted(() => ({
  profile: { findMany: vi.fn(), findUnique: vi.fn() },
  personalMemory: { findMany: vi.fn(), findFirst: vi.fn() },
}));
vi.mock("@/lib/prisma", () => ({ getPrisma: () => db }));
import {
  loadContext,
  modelContext,
  searchMemories,
  readMemory,
} from "./memory";
describe("personal context", () => {
  beforeEach(() => vi.resetAllMocks());
  it("resolves the single local owner and forwards project, device and validity filters", async () => {
    db.profile.findMany.mockResolvedValue([{ userId: "owner" }]);
    db.profile.findUnique.mockResolvedValue({
      displayName: "Patrick",
      language: "es",
      timezone: "America/Managua",
      currentSummary: null,
      contextRevision: 1,
      memories: [],
    });
    await loadContext("project-a", "machine:pc");
    expect(db.profile.findUnique.mock.calls[0]![0]).toMatchObject({
      where: { userId: "owner" },
      include: {
        memories: {
          where: {
            deletedAt: null,
            OR: [
              { scope: "PERSONAL", scopeRef: null },
              { scope: "PROJECT", scopeRef: "project-a" },
              { scope: "DEVICE", scopeRef: "machine:pc" },
            ],
            currentRevision: {
              status: "ACTIVE",
              validFrom: { lte: expect.any(Date) },
              OR: [{ validTo: null }, { validTo: { gt: expect.any(Date) } }],
            },
          },
        },
      },
    });
  });
  it("does not guess the owner when multiple profiles exist", async () => {
    db.profile.findMany.mockResolvedValue([
      { userId: "one" },
      { userId: "two" },
    ]);
    await expect(loadContext("p", "d")).rejects.toThrow("varios perfiles");
    expect(db.profile.findUnique).not.toHaveBeenCalled();
  });
  it("keeps restricted or unapproved memories out of the model payload", () => {
    const memory = {
      id: "1",
      subject: "Standard",
      scope: "PERSONAL",
      content: "allowed",
      certainty: "EXPLICIT",
      sensitivity: "INTERNAL",
      exposure: ["opencode/big-pickle"],
    };
    const payload = modelContext(
      {
        displayName: "Patrick",
        language: "es",
        timezone: "UTC",
        summary: "summary-not-classified",
        revision: 1,
        loadedAt: "",
        memories: [
          memory,
          {
            ...memory,
            id: "2",
            content: "secret-sensitive",
            sensitivity: "SENSITIVE",
          },
          {
            ...memory,
            id: "3",
            content: "other-model",
            exposure: ["other/model"],
          },
        ],
      },
      "opencode/big-pickle",
    );
    expect(payload).toContain("allowed");
    expect(payload).not.toContain("secret-sensitive");
    expect(payload).not.toContain("other-model");
    expect(payload).not.toContain("summary-not-classified");
  });
  it("searches live storage beyond the bootstrap and applies exposure in SQL", async () => {
    db.personalMemory.findMany.mockResolvedValue([
      {
        id: "beyond-bootstrap",
        topicKey: "career/current",
        subject: "Trabajo",
        scope: "PERSONAL",
        scopeRef: null,
        currentRevision: {
          content: "Latest role",
          certainty: "EXPLICIT",
          revision: 2,
          validFrom: new Date(),
          evidence: [
            {
              sourceType: "statement",
              sourceRef: "source",
              observedAt: new Date(),
            },
          ],
        },
      },
    ]);
    const result = await searchMemories(
      { ownerId: "owner", project: "a", deviceId: "d", model: "model/x" },
      "entrevista",
      8,
    );
    expect(result[0]).toMatchObject({
      id: "beyond-bootstrap",
      revision: 2,
      sources: [{ reference: "source" }],
    });
    expect(db.personalMemory.findMany.mock.calls[0]![0]).toMatchObject({
      where: {
        userId: "owner",
        currentRevision: {
          status: "ACTIVE",
          sensitivity: { in: ["PUBLIC", "INTERNAL"] },
          exposure: { has: "model/x" },
        },
      },
      skip: 8,
      take: 8,
    });
  });
  it("does not allow ID reads to bypass owner, scope, sensitivity or model", async () => {
    db.personalMemory.findFirst.mockResolvedValue(null);
    await expect(
      readMemory(
        { ownerId: "owner", project: "a", deviceId: "d", model: "model/x" },
        "foreign-id",
      ),
    ).rejects.toThrow("autorizado");
    expect(db.personalMemory.findFirst.mock.calls[0]![0].where).toMatchObject({
      id: "foreign-id",
      userId: "owner",
      OR: [
        { scope: "PERSONAL", scopeRef: null },
        { scope: "PROJECT", scopeRef: "a" },
        { scope: "DEVICE", scopeRef: "d" },
      ],
      currentRevision: { exposure: { has: "model/x" } },
    });
  });
});
