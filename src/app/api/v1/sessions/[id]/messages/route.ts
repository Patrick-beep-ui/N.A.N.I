import { messageSchema } from "@/lib/contracts";
import { errorResponse } from "@/lib/errors";
import { getSession } from "@/services/sessions";
import { sendMessage } from "@/services/chat";
export const runtime = "nodejs";
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    getSession(id);
    const { message } = messageSchema.parse(await request.json());
    const disconnected = new AbortController();
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const emit = (value: unknown) => {
          if (!disconnected.signal.aborted)
            controller.enqueue(encoder.encode(JSON.stringify(value) + "\n"));
        };
        try {
          emit({ type: "status", message: "Preparando tarea..." });
          const result = await sendMessage(
            id,
            message,
            (m) => emit({ type: "status", message: m }),
            disconnected.signal,
          );
          emit({ type: "result", result });
        } catch (error) {
          const response = errorResponse(error);
          emit({ type: "error", ...(await response.json()) });
        } finally {
          if (!disconnected.signal.aborted) controller.close();
        }
      },
      cancel() {
        disconnected.abort();
      },
    });
    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
