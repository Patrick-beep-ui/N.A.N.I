import { randomUUID } from "node:crypto";
import type { CreateSessionRequest, Session } from "@nani/contracts";
import type { ContextService } from "./context-service.js";

export interface StartSessionCommand extends CreateSessionRequest {
  userId: string;
}

export class SessionService {
  constructor(private readonly contextService: ContextService) {}

  async start(command: StartSessionCommand): Promise<Session> {
    const context = await this.contextService.loadSessionBootstrap(command.userId);

    return {
      sessionId: randomUUID(),
      userId: command.userId,
      deviceId: command.deviceId,
      projectId: command.projectId ?? null,
      workingDirectory: command.workingDirectory ?? null,
      createdAt: new Date().toISOString(),
      context
    };
  }
}
