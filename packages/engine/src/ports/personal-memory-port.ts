import type { PersonalContextSnapshot } from "@nani/contracts";

export interface PersonalMemoryPort {
  loadBootstrap(userId: string): Promise<PersonalContextSnapshot>;
}
