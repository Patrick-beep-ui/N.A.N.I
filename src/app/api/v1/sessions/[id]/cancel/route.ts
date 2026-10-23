import { cancelMessage } from "@/services/chat";
import { errorResponse } from "@/lib/errors";
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await cancelMessage((await params).id);
    return Response.json({ status: "cancel_requested" });
  } catch (error) {
    return errorResponse(error);
  }
}
