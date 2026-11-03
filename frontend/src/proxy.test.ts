import { getRedirectUrl, unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { config, proxy, SESSION_COOKIE } from "./proxy";

function visit(path: string, { loggedIn }: { loggedIn: boolean }) {
  const request = new NextRequest(`http://localhost:3000${path}`);
  if (loggedIn) {
    request.cookies.set(SESSION_COOKIE, "abc123");
  }
  return getRedirectUrl(proxy(request));
}

describe("proxy", () => {
  it.each(["/", "/sign-in", "/sign-up"])("shows %s to logged-out users", (path) => {
    expect(visit(path, { loggedIn: false })).toBeNull();
  });

  it.each(["/", "/sign-in", "/sign-up"])(
    "sends logged-in users from %s to the dashboard",
    (path) => {
      expect(visit(path, { loggedIn: true })).toBe("http://localhost:3000/dashboard");
    },
  );

  it.each(["/dashboard", "/app/board"])("shows %s to logged-in users", (path) => {
    expect(visit(path, { loggedIn: true })).toBeNull();
  });

  it.each(["/dashboard", "/app/board"])("sends logged-out users from %s to sign in", (path) => {
    expect(visit(path, { loggedIn: false })).toBe("http://localhost:3000/sign-in");
  });

  it.each(["/", "/sign-in", "/dashboard"])("runs on page %s", (url) => {
    expect(unstable_doesMiddlewareMatch({ config, url })).toBe(true);
  });

  it.each(["/api/auth/me", "/_next/static/chunk.js", "/favicon.ico", "/next.svg"])(
    "skips %s",
    (url) => {
      expect(unstable_doesMiddlewareMatch({ config, url })).toBe(false);
    },
  );
});
