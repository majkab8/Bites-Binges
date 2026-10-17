import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { request } from "./client";
import { ApiError, COOKIES_ERROR } from "./errors";

const fetchMock = vi.fn<typeof fetch>();

function setCsrfCookie(value: string) {
  document.cookie = `csrftoken=${value}; path=/`;
}

function sentHeaders(callIndex: number): Record<string, string> {
  return fetchMock.mock.calls[callIndex]?.[1]?.headers as Record<string, string>;
}

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  document.cookie = "csrftoken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  vi.unstubAllGlobals();
});

describe("request", () => {
  it("fetches the CSRF cookie before the first POST", async () => {
    fetchMock
      .mockImplementationOnce(async () => {
        setCsrfCookie("fresh-token");
        return new Response(null, { status: 204 });
      })
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    await request("/api/auth/logout", "POST");

    expect(fetchMock.mock.calls[0]?.[0]).toBe("/api/auth/csrf");
    expect(fetchMock.mock.calls[1]?.[0]).toBe("/api/auth/logout");
    expect(sentHeaders(1)["X-CSRFToken"]).toBe("fresh-token");
  });

  it("reads the CSRF cookie again before each request", async () => {
    fetchMock.mockImplementation(async () => new Response(null, { status: 204 }));

    setCsrfCookie("first");
    await request("/api/auth/logout", "POST");
    setCsrfCookie("rotated-after-login");
    await request("/api/auth/logout", "POST");

    expect(sentHeaders(0)["X-CSRFToken"]).toBe("first");
    expect(sentHeaders(1)["X-CSRFToken"]).toBe("rotated-after-login");
  });

  it("sends JSON and returns the parsed response", async () => {
    setCsrfCookie("token");
    fetchMock.mockResolvedValueOnce(Response.json({ id: 1 }));

    await expect(request("/api/auth/login", "POST", { email: "a@b.c" })).resolves.toEqual({
      id: 1,
    });

    const init = fetchMock.mock.calls[0]?.[1];
    expect(init?.method).toBe("POST");
    expect(init?.body).toBe(JSON.stringify({ email: "a@b.c" }));
    expect(sentHeaders(0)["Content-Type"]).toBe("application/json");
  });

  it("does not send a CSRF token with GET requests", async () => {
    fetchMock.mockResolvedValueOnce(Response.json({}));

    await request("/api/auth/me");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(sentHeaders(0)["X-CSRFToken"]).toBeUndefined();
  });

  it("stops before the POST when the CSRF request fails", async () => {
    fetchMock.mockResolvedValueOnce(Response.json({}, { status: 500 }));

    const error = await request("/api/auth/logout", "POST").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(500);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("explains the problem when the CSRF cookie is not set", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));

    const error = await request("/api/auth/logout", "POST").catch((e: unknown) => e);

    expect((error as ApiError).errors).toEqual({ non_field_errors: [COOKIES_ERROR] });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("throws an ApiError with the parsed errors", async () => {
    setCsrfCookie("token");
    fetchMock.mockResolvedValueOnce(
      Response.json({ email: ["A user with this email already exists."] }, { status: 400 }),
    );

    const error = await request("/api/auth/register", "POST", {}).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(400);
    expect((error as ApiError).errors).toEqual({
      email: ["A user with this email already exists."],
    });
  });
});
