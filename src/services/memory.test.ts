import { beforeEach, describe, it, expect, vi } from "vitest";
const db = vi.hoisted(() => ({
  profile: { findMany: vi.fn(), findUnique: vi.fn() },
}));
vi.mock("@/lib/prisma", () => ({ getPrisma: () => db }));
import { loadContext, modelContext } from "./memory";
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
});
