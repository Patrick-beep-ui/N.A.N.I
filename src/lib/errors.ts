import { randomUUID } from "node:crypto";
import { ZodError } from "zod";
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public status = 503,
    cause?: unknown,
  ) {
    super(message, { cause });
  }
}
export function redactSecrets(text: string): string {
  return text
    .replace(/\b(?:postgres(?:ql)?|https?):\/\/\S+/gi, "[URL omitida]")
    .replace(
      /(?:password|token|authorization)\s*[:=]\s*\S+/gi,
      "[credencial omitida]",
    );
}
export function diagnostic(error: unknown): string {
  const cause = error instanceof Error && error.cause ? error.cause : error;
  const text =
    cause instanceof Error
      ? cause.message
      : "No hay detalle seguro disponible.";
  return redactSecrets(text).slice(0, 500);
}
export function errorResponse(error: unknown) {
  const requestId = randomUUID();
  const known = error instanceof AppError;
  const invalid = error instanceof ZodError || error instanceof SyntaxError;
  console.error("[NANI]", {
    requestId,
    type: error instanceof Error ? error.name : "unknown",
    code: known ? error.code : invalid ? "validation_error" : "internal_error",
    detail: diagnostic(error),
  });
  return Response.json(
    {
      error: {
        code: known
          ? error.code
          : invalid
            ? "validation_error"
            : "internal_error",
        message: known
          ? error.message
          : invalid
            ? "La solicitud no es válida."
            : "Ocurrió un error interno. Revisá la configuración y el registro del servidor.",
        requestId,
      },
    },
    { status: known ? error.status : invalid ? 400 : 500 },
  );
}
