export type FieldErrors = Record<string, string[]>;

export const GENERIC_ERROR = "Something went wrong. Please try again.";
export const NETWORK_ERROR = "Could not reach the server. Check your connection and try again.";
export const SESSION_ERROR = "Your session has expired. Refresh the page and try again.";
export const COOKIES_ERROR =
  "Could not start a secure session. Make sure cookies are enabled and try again.";

export class ApiError extends Error {
  readonly status: number;
  readonly errors: FieldErrors;

  constructor(status: number, errors: FieldErrors) {
    super(`Request failed with status ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

function flattenMessages(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap(flattenMessages);
  }
  if (value && typeof value === "object") {
    return Object.values(value).flatMap(flattenMessages);
  }
  return [String(value)];
}

export async function parseErrors(response: Response): Promise<FieldErrors> {
  try {
    const data: unknown = await response.json();
    if (data && typeof data === "object" && !Array.isArray(data)) {
      if ("detail" in data && typeof data.detail === "string") {
        return { non_field_errors: [data.detail] };
      }
      return Object.fromEntries(
        Object.entries(data).map(([field, messages]) => [field, flattenMessages(messages)]),
      );
    }
  } catch {
    // Not JSON. Django answers a failed CSRF check with an HTML page.
    if (response.status === 403) {
      return { non_field_errors: [SESSION_ERROR] };
    }
  }
  return { non_field_errors: [GENERIC_ERROR] };
}

export function errorsFrom(error: unknown): FieldErrors {
  if (error instanceof ApiError) {
    return error.errors;
  }
  if (error instanceof TypeError) {
    return { non_field_errors: [NETWORK_ERROR] };
  }
  return { non_field_errors: [GENERIC_ERROR] };
}
