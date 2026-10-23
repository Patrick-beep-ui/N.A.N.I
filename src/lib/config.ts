import { realpathSync, statSync } from "node:fs";
import { hostname } from "node:os";
import { z } from "zod";
import { AppError } from "./errors";

const loopback = new Set(["localhost", "127.0.0.1", "[::1]"]);
export function localUrl(value: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new AppError(
      "configuration_error",
      "La URL del servicio local no es válida.",
    );
  }
  if (
    url.protocol !== "http:" ||
    !loopback.has(url.hostname) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new AppError(
      "configuration_error",
      "Los servicios locales deben usar una URL HTTP de loopback sin credenciales ni parámetros.",
    );
  }
  return url.href.replace(/\/$/, "");
}
export function getConfig() {
  const ownerId = process.env.NANI_OWNER_USER_ID?.trim() || undefined;
  if (ownerId && !z.uuid().safeParse(ownerId).success)
    throw new AppError(
      "configuration_error",
      "NANI_OWNER_USER_ID debe ser un UUID válido o quedar vacío para elegir el único perfil.",
    );
  const model = process.env.OPENCODE_MODEL?.trim() || "opencode/big-pickle";
  if (!/^[\w.-]+\/[\w.-]+$/.test(model))
    throw new AppError(
      "configuration_error",
      "OPENCODE_MODEL debe tener formato proveedor/modelo.",
    );
  let workingDirectory: string;
  try {
    workingDirectory = realpathSync(
      /* turbopackIgnore: true */ process.env.NANI_WORKING_DIRECTORY?.trim() ||
        process.cwd(),
    );
    if (!statSync(/* turbopackIgnore: true */ workingDirectory).isDirectory())
      throw new Error();
  } catch {
    throw new AppError(
      "configuration_error",
      "NANI_WORKING_DIRECTORY debe apuntar a una carpeta local existente.",
    );
  }
  return {
    ownerId,
    workingDirectory,
    deviceId: `machine:${hostname().toLowerCase()}`,
    model,
    opencodeUrl: localUrl(
      process.env.OPENCODE_BASE_URL?.trim() || "http://127.0.0.1:4096",
    ),
    engramUrl: localUrl(
      process.env.ENGRAM_BASE_URL?.trim() || "http://127.0.0.1:7437",
    ),
    opencodeUsername: process.env.OPENCODE_SERVER_USERNAME || "opencode",
    opencodePassword: process.env.OPENCODE_SERVER_PASSWORD || "",
    engramToken: process.env.ENGRAM_HTTP_TOKEN || "",
  };
}
