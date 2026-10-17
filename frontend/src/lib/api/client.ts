import { readCookie } from "./cookies";
import { ApiError, COOKIES_ERROR, parseErrors } from "./errors";

async function csrfToken(): Promise<string> {
  if (!readCookie("csrftoken")) {
    const response = await fetch("/api/auth/csrf");
    if (!response.ok) {
      throw new ApiError(response.status, await parseErrors(response));
    }
  }

  const token = readCookie("csrftoken");
  if (!token) {
    throw new ApiError(0, { non_field_errors: [COOKIES_ERROR] });
  }
  return token;
}

export async function request<T>(
  path: string,
  method: "GET" | "POST" = "GET",
  body?: unknown,
): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (method !== "GET") {
    headers["X-CSRFToken"] = await csrfToken();
  }
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(path, {
    method,
    headers,
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });

  if (!response.ok) {
    throw new ApiError(response.status, await parseErrors(response));
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}
