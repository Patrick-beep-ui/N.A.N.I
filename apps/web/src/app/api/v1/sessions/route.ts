import { randomUUID } from "node:crypto";
import { createSessionRequestSchema } from "@nani/contracts";
import { EngineError } from "@nani/engine";
import { getEngineContainer } from "../../../../lib/engine-container";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  const requestId = randomUUID();

  try {
    const ownerUserId = process.env.NANI_OWNER_USER_ID;
    if (!ownerUserId) {
      throw new EngineError("configuration_error", "NANI_OWNER_USER_ID no está configurado.");
    }

    const input = createSessionRequestSchema.parse(await request.json());
    const session = await getEngineContainer().sessions.start({
      userId: ownerUserId,
      ...input
    });

    return Response.json(session, {
      status: 201,
      headers: { "x-request-id": requestId }
    });
  } catch (error) {
    const known = error instanceof EngineError;
    const validation = error instanceof Error && error.name === "ZodError";
    const code = known ? error.code : validation ? "validation_error" : "internal_error";
    const message = known || validation
      ? (error as Error).message
      : "No fue posible iniciar la sesión.";

    return Response.json(
      { error: { code, message, requestId } },
      {
        status: known && error.code === "profile_not_found" ? 404 : validation ? 400 : 503,
        headers: { "x-request-id": requestId }
      }
    );
  }
}
