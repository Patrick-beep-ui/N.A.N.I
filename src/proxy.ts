import { NextRequest, NextResponse } from "next/server";
import { isLocalRequest } from "./lib/local-access";
export function proxy(request: NextRequest) {
  if (!isLocalRequest(request))
    return NextResponse.json(
      {
        error: {
          message: "N.A.N.I. solo acepta solicitudes locales del mismo origen.",
        },
      },
      { status: 403 },
    );
  const response = NextResponse.next();
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("X-Content-Type-Options", "nosniff");
  return response;
}
export const config = { matcher: "/api/:path*" };
