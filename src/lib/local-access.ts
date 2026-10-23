const hosts = new Set(["localhost", "127.0.0.1", "[::1]"]);
export function isLocalRequest(request: Request): boolean {
  try {
    const host = new URL(`http://${request.headers.get("host") || ""}`);
    const target = new URL(request.url);
    if (!hosts.has(host.hostname) || !hosts.has(target.hostname)) return false;
    const origin = request.headers.get("origin");
    if (request.method !== "GET" && request.method !== "HEAD" && !origin)
      return false;
    if (origin && new URL(origin).origin !== `${target.protocol}//${host.host}`)
      return false;
    const site = request.headers.get("sec-fetch-site");
    return !site || site === "same-origin" || site === "none";
  } catch {
    return false;
  }
}
