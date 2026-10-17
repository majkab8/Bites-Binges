import { describe, expect, it } from "vitest";

import {
  ApiError,
  errorsFrom,
  GENERIC_ERROR,
  NETWORK_ERROR,
  parseErrors,
  SESSION_ERROR,
} from "./errors";

describe("parseErrors", () => {
  it("keeps field errors", async () => {
    const response = Response.json({ email: ["Taken."], password: ["Too short."] });

    await expect(parseErrors(response)).resolves.toEqual({
      email: ["Taken."],
      password: ["Too short."],
    });
  });

  it("flattens nested errors into messages", async () => {
    const response = Response.json({
      profile: { bio: ["Too long."] },
      tags: [{ name: ["Empty."] }],
    });

    await expect(parseErrors(response)).resolves.toEqual({
      profile: ["Too long."],
      tags: ["Empty."],
    });
  });

  it("turns a detail message into a form error", async () => {
    const response = Response.json({ detail: "Authentication credentials were not provided." });

    await expect(parseErrors(response)).resolves.toEqual({
      non_field_errors: ["Authentication credentials were not provided."],
    });
  });

  it("explains a failed CSRF check", async () => {
    const response = new Response("<h1>Forbidden</h1>", { status: 403 });

    await expect(parseErrors(response)).resolves.toEqual({ non_field_errors: [SESSION_ERROR] });
  });

  it("falls back to a generic message for other responses that are not JSON", async () => {
    const response = new Response("<h1>Server Error</h1>", { status: 500 });

    await expect(parseErrors(response)).resolves.toEqual({ non_field_errors: [GENERIC_ERROR] });
  });
});

describe("errorsFrom", () => {
  it("returns the errors of an ApiError", () => {
    expect(errorsFrom(new ApiError(400, { email: ["Taken."] }))).toEqual({ email: ["Taken."] });
  });

  it("explains network failures", () => {
    expect(errorsFrom(new TypeError("Failed to fetch"))).toEqual({
      non_field_errors: [NETWORK_ERROR],
    });
  });

  it("uses a generic message for anything else", () => {
    expect(errorsFrom(new Error("Unexpected"))).toEqual({ non_field_errors: [GENERIC_ERROR] });
  });
});
