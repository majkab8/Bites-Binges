import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { logout } from "./api";
import { LogoutButton } from "./logout-button";

const push = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("./api", () => ({ logout: vi.fn() }));

describe("LogoutButton", () => {
  it("logs out and goes to the home page", async () => {
    vi.mocked(logout).mockResolvedValueOnce(undefined);
    render(<LogoutButton />);

    await userEvent.click(screen.getByRole("button", { name: "Log out" }));

    expect(logout).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith("/");
  });

  it("shows an error and lets the user try again", async () => {
    vi.mocked(logout).mockRejectedValueOnce(new TypeError("Failed to fetch"));
    render(<LogoutButton />);

    await userEvent.click(screen.getByRole("button", { name: "Log out" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Could not reach the server");
    expect(screen.getByRole("button", { name: "Log out" })).toBeEnabled();
    expect(push).not.toHaveBeenCalled();
  });
});
