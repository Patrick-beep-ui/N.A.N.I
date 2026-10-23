import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { AppError } from "./errors";
const state = globalThis as typeof globalThis & { naniPrisma?: PrismaClient };
export function getPrisma(): PrismaClient {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString)
    throw new AppError(
      "configuration_error",
      "Falta DATABASE_URL en el .env de la raíz. Completalo y reiniciá pnpm dev.",
    );
  return (state.naniPrisma ??= new PrismaClient({
    adapter: new PrismaPg({
      connectionString,
      max: 3,
      connectionTimeoutMillis: 8000,
      query_timeout: 8000,
    }),
  }));
}
