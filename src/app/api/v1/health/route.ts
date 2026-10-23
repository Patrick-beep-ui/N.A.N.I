import { getPrisma } from "@/lib/prisma";
import { getConfig } from "@/lib/config";
export const runtime = "nodejs";
export async function GET() {
  let database = "unavailable";
  try {
    await getPrisma().$queryRaw`SELECT 1`;
    database = "connected";
  } catch {}
  const probe = async (url: string, headers: Record<string, string>) => {
    try {
      const r = await fetch(url, {
        headers,
        redirect: "error",
        cache: "no-store",
        signal: AbortSignal.timeout(3000),
      });
      return r.ok ? "reachable" : "unavailable";
    } catch {
      return "unavailable";
    }
  };
  try {
    const c = getConfig();
    const [opencode, engram] = await Promise.all([
      probe(
        c.opencodeUrl + "/global/health",
        c.opencodePassword
          ? {
              authorization: `Basic ${Buffer.from(c.opencodeUsername + ":" + c.opencodePassword).toString("base64")}`,
            }
          : {},
      ),
      probe(
        c.engramUrl + "/health",
        c.engramToken ? { authorization: "Bearer " + c.engramToken } : {},
      ),
    ]);
    return Response.json(
      { database, opencode, engram },
      { status: database === "connected" ? 200 : 503 },
    );
  } catch {
    return Response.json(
      { database, configuration: "invalid" },
      { status: 503 },
    );
  }
}
