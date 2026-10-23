import { describe, expect, it } from "vitest";
import type { PersonalContextSnapshot } from "@nani/contracts";
import type { PersonalMemoryPort } from "../ports/personal-memory-port.js";
import { ContextService } from "./context-service.js";
import { SessionService } from "./session-service.js";

const userId = "d925eb4a-3457-460c-9488-da57cfa675ff";

class MemoryStub implements PersonalMemoryPort {
  calls = 0;

  async loadBootstrap(requestedUserId: string): Promise<PersonalContextSnapshot> {
    this.calls += 1;
    return {
      userId: requestedUserId,
      displayName: "Patrick",
      language: "es",
      timezone: "America/Managua",
      summary: null,
      contextRevision: 7,
      memories: [],
      loadedAt: "2026-10-23T12:00:00.000Z",
      sources: [{
        source: "supabase",
        status: "loaded",
        revision: "7",
        loadedAt: "2026-10-23T12:00:00.000Z",
        detail: "0 memorias personales vigentes"
      }]
    };
  }
}

describe("SessionService", () => {
  it("creates a session from exactly one personal-memory bootstrap", async () => {
    const memory = new MemoryStub();
    const service = new SessionService(new ContextService(memory));

    const session = await service.start({
      userId,
      deviceId: "machine:patrick-pc",
      projectId: "n.a.n.i",
      workingDirectory: "C:\\workspace\\N.A.N.I"
    });

    expect(memory.calls).toBe(1);
    expect(session.userId).toBe(userId);
    expect(session.context.contextRevision).toBe(7);
    expect(session.context.sources[0]?.status).toBe("loaded");
  });
});
