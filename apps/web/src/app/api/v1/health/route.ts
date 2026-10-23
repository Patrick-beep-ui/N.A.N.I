export const runtime = "nodejs";

export function GET(): Response {
  return Response.json({
    status: "ok",
    components: {
      engine: "ready",
      supabase: process.env.DATABASE_URL ? "configured" : "unconfigured",
      opencode: "not_connected",
      engram: "not_connected",
      worker: "not_started"
    }
  });
}
