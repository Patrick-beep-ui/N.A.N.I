import type { PersonalContextSnapshot } from "@nani/contracts";
import type { PersonalMemoryPort } from "../ports/personal-memory-port.js";

export class ContextService {
  constructor(private readonly personalMemory: PersonalMemoryPort) {}

  loadSessionBootstrap(userId: string): Promise<PersonalContextSnapshot> {
    return this.personalMemory.loadBootstrap(userId);
  }
}
