import { createEngineContainer, type EngineContainer } from "@nani/engine/server";

const globalForNani = globalThis as typeof globalThis & {
  naniEngine?: EngineContainer;
};

export function getEngineContainer(): EngineContainer {
  globalForNani.naniEngine ??= createEngineContainer();
  return globalForNani.naniEngine;
}
