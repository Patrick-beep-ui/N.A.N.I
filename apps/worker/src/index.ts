const state = {
  worker: "started",
  opencode: "not_connected",
  engram: "not_connected",
  synchronization: "not_started"
} as const;

console.info("N.A.N.I. worker", state);
console.info("El worker está preparado para el siguiente tramo: runs, eventos y outbox local.");
