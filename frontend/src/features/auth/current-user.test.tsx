import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api/errors";

import { getMe, logout } from "./api";
import { CurrentUserProvider, useCurrentUser } from "./current-user";
import { testUser } from "./test-user";

const replace = vi.fn();
const router = { replace };

vi.mock("next/navigation", () => ({ useRouter: () => router }));
vi.mock("./api", () => ({ getMe: vi.fn(), logout: vi.fn() }));

function Username() {
  return <p>{useCurrentUser().username}</p>;
}

function renderProvider() {
  render(
    <CurrentUserProvider>
      <Username />
    </CurrentUserProvider>,
  );
}

describe("CurrentUserProvider", () => {
  it("gives the logged-in user to its children", async () => {
    vi.mocked(getMe).mockResolvedValueOnce(testUser);

    renderProvider();

    expect(await screen.findByText("maja")).toBeInTheDocument();
  });

  it("logs out users with an expired session and sends them to the sign-in page", async () => {
    vi.mocked(getMe).mockRejectedValueOnce(new ApiError(403, {}));
    vi.mocked(logout).mockResolvedValueOnce(undefined);

    renderProvider();

    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith("/sign-in"));
    expect(logout).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("maja")).not.toBeInTheDocument();
  });

  it("shows an error when logging out an expired session fails", async () => {
    vi.mocked(getMe).mockRejectedValueOnce(new ApiError(403, {}));
    vi.mocked(logout).mockRejectedValueOnce(new TypeError("Failed to fetch"));

    renderProvider();

    expect(await screen.findByRole("alert")).toHaveTextContent("Could not reach the server");
    expect(replace).not.toHaveBeenCalled();
  });

  it("shows an error when the session check fails for another reason", async () => {
    vi.mocked(getMe).mockRejectedValueOnce(new TypeError("Failed to fetch"));

    renderProvider();

    expect(await screen.findByRole("alert")).toHaveTextContent("Could not reach the server");
    expect(replace).not.toHaveBeenCalled();
    expect(logout).not.toHaveBeenCalled();
  });
});
