import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api/errors";

import { getMe } from "./api";
import { GuestOnly } from "./guest-only";
import { testUser } from "./test-user";

const replace = vi.fn();
const router = { replace };

vi.mock("next/navigation", () => ({ useRouter: () => router }));
vi.mock("./api", () => ({ getMe: vi.fn() }));

function renderGuestOnly() {
  render(
    <GuestOnly>
      <p>Sign-in form</p>
    </GuestOnly>,
  );
}

describe("GuestOnly", () => {
  it("shows the page to logged-out users", async () => {
    vi.mocked(getMe).mockRejectedValueOnce(new ApiError(403, {}));

    renderGuestOnly();

    expect(await screen.findByText("Sign-in form")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it("sends logged-in users to the dashboard", async () => {
    vi.mocked(getMe).mockResolvedValueOnce(testUser);

    renderGuestOnly();

    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith("/dashboard"));
    expect(screen.queryByText("Sign-in form")).not.toBeInTheDocument();
  });
});
