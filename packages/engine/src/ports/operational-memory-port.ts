export interface OperationalMemoryQuery {
  scope: string;
  query: string;
  limit: number;
}

export interface OperationalMemoryObservation {
  id: string;
  scope: string;
  content: string;
  occurredAt: string;
  source: "engram";
}

export interface OperationalMemoryPort {
  search(query: OperationalMemoryQuery): Promise<OperationalMemoryObservation[]>;
  record(observation: Omit<OperationalMemoryObservation, "id" | "source">): Promise<string>;
}
