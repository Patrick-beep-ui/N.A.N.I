import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaPersonalMemoryRepository } from "./adapters/prisma/prisma-personal-memory-repository.js";
import { EngineError } from "./errors/engine-error.js";
import { ContextService } from "./services/context-service.js";
import { SessionService } from "./services/session-service.js";

export interface EngineContainer {
  prisma: PrismaClient;
  sessions: SessionService;
}

export function createEngineContainer(databaseUrl = process.env.DATABASE_URL): EngineContainer {
  if (!databaseUrl) {
    throw new EngineError("configuration_error", "DATABASE_URL no está configurado.");
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl })
  });
  const personalMemory = new PrismaPersonalMemoryRepository(prisma);
  const context = new ContextService(personalMemory);

  return { prisma, sessions: new SessionService(context) };
}
