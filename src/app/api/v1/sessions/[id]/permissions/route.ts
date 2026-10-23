import { z } from "zod";
import { getSession } from "@/services/sessions";
import { OpenCodeRuntime } from "@/integrations/opencode";
import { errorResponse, AppError } from "@/lib/errors";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const s = getSession((await params).id);
    return Response.json(
      s.runtimeId
        ? await new OpenCodeRuntime(s.workingDirectory, s.model).permissions(
            s.runtimeId,
          )
        : [],
    );
  } catch (error) {
    return errorResponse(error);
  }
}
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const s = getSession((await params).id);
    if (!s.runtimeId)
      throw new AppError(
        "session_expired",
        "No hay una ejecución de OpenCode en esta sesión.",
        409,
      );
    const { permissionId, reply } = z
      .object({
        permissionId: z.string().min(1),
        reply: z.enum(["once", "reject"]),
      })
      .parse(await request.json());
    await new OpenCodeRuntime(s.workingDirectory, s.model).reply(
      s.runtimeId,
      permissionId,
      reply,
    );
    return Response.json({ status: "replied" });
  } catch (error) {
    return errorResponse(error);
  }
}
