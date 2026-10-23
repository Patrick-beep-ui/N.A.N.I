import { describe, it, expect } from "vitest";
import { isLocalRequest } from "./local-access";
import { localUrl } from "./config";
import { diagnostic } from "./errors";

describe("local API boundary", () => {
  const request = (host: string, origin?: string, method = "POST") =>
    new Request("http://127.0.0.1:3000/api/v1/sessions", {
      method,
      headers: { host, ...(origin ? { origin } : {}) },
    });
  it("allows same-origin local browser requests", () =>
    expect(
      isLocalRequest(request("127.0.0.1:3000", "http://127.0.0.1:3000")),
    ).toBe(true));
  it("rejects LAN, rebinding and cross-port origins", () => {
    for (const [host, origin] of [
      ["192.168.1.3:3000", "http://192.168.1.3:3000"],
      ["attacker.example:3000", "http://attacker.example:3000"],
      ["127.0.0.1:3000", "http://localhost:3001"],
      ["127.0.0.1:3000", "null"],
    ])
      expect(isLocalRequest(request(host!, origin))).toBe(false);
  });
  it("rejects mutation without Origin; permits local health GET", () => {
    expect(isLocalRequest(request("127.0.0.1:3000"))).toBe(false);
    expect(isLocalRequest(request("127.0.0.1:3000", undefined, "GET"))).toBe(
      true,
    );
  });
  it("does not allow remote runtime endpoints or URL credentials", () => {
    expect(() => localUrl("https://remote.example")).toThrow();
    expect(() => localUrl("http://secret@localhost:4096")).toThrow();
    expect(localUrl("http://127.0.0.1:4096/")).toBe("http://127.0.0.1:4096");
  });
  it("redacts DB credentials from diagnostics", () =>
    expect(
      diagnostic(
        new Error(
          "connect postgresql://postgres:secret@db.example:5432/postgres password=secret",
        ),
      ),
    ).not.toContain("secret"));
});
