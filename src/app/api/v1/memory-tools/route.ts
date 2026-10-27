import { z } from "zod";
import { getRuntimeSession } from "@/services/sessions";
import { searchMemories, readMemory } from "@/services/memory";
import { proposeMemory } from "@/services/learning";
import { errorResponse } from "@/lib/errors";
export const runtime = "nodejs";
const requestSchema = z.object({
  runtimeSessionId: z.string().min(1).max(200),
  action: z.enum(["search", "get", "propose"]),
  args: z.unknown(),
});
export async function POST(request: Request) {
  try {
    const input = requestSchema.parse(await request.json());
    const session = getRuntimeSession(input.runtimeSessionId);
    if (input.action === "search") {
      const args = z
        .object({
          query: z.string().trim().min(2).max(300),
          offset: z.number().int().min(0).max(5000).default(0),
        })
        .parse(input.args);
      return Response.json({
        memories: await searchMemories(session, args.query, args.offset),
      });
    }
    if (input.action === "get") {
      const { id } = z.object({ id: z.uuid() }).parse(input.args);
      return Response.json(await readMemory(session, id));
    }
    const result = await proposeMemory(session, input.args);
    return Response.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}
