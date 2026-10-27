import { z } from "zod";
import { getSession } from "@/services/sessions";
import { pendingMemories, decideMemory } from "@/services/learning";
import { errorResponse } from "@/lib/errors";
export const runtime = "nodejs";
type Params = { params: Promise<{ id: string }> };
export async function GET(_request: Request, { params }: Params) {
  try {
    return Response.json(await pendingMemories(getSession((await params).id)));
  } catch (error) {
    return errorResponse(error);
  }
}
export async function POST(request: Request, { params }: Params) {
  try {
    const session = getSession((await params).id);
    const { changeId, accept } = z
      .object({ changeId: z.uuid(), accept: z.boolean() })
      .parse(await request.json());
    return Response.json(await decideMemory(session, changeId, accept));
  } catch (error) {
    return errorResponse(error);
  }
}
