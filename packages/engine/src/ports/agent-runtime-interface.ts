export interface AgentTask {
  sessionId: string;
  projectId: string;
  workingDirectory: string;
  prompt: string;
  context: string;
}

export interface AgentRun {
  runId: string;
  runtimeSessionId: string;
  status: "accepted" | "running" | "completed" | "failed" | "cancelled";
}

export interface AgentRuntimeInterface {
  execute(task: AgentTask): Promise<AgentRun>;
  cancel(runId: string): Promise<boolean>;
}
