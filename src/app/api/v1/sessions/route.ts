import { startSchema } from "@/lib/contracts";
import { errorResponse } from "@/lib/errors";
import { startSession } from "@/services/sessions";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const { project } = startSchema.parse(await request.json());
    return Response.json(await startSession(project), { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
