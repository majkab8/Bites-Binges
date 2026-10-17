import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useCurrentUser } from "@/features/auth/current-user";
import { testUser } from "@/features/auth/test-user";
import type { User } from "@/features/auth/types";

import { Greeting } from "./greeting";

vi.mock("@/features/auth/current-user", () => ({ useCurrentUser: vi.fn() }));

const maja: User = { ...testUser, display_name: "Maja" };

describe("Greeting", () => {
  it("greets the user by display name", () => {
    vi.mocked(useCurrentUser).mockReturnValue(maja);

    render(<Greeting />);

    expect(screen.getByRole("heading", { name: "Hello, Maja!" })).toBeInTheDocument();
  });

  it("falls back to the username without a display name", () => {
    vi.mocked(useCurrentUser).mockReturnValue({ ...maja, display_name: "" });

    render(<Greeting />);

    expect(screen.getByRole("heading", { name: "Hello, maja!" })).toBeInTheDocument();
  });
});
