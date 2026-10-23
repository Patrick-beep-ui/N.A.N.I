export type EngineErrorCode =
  | "configuration_error"
  | "profile_not_found"
  | "runtime_unavailable"
  | "operational_memory_unavailable";

export class EngineError extends Error {
  constructor(
    public readonly code: EngineErrorCode,
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "EngineError";
  }
}
