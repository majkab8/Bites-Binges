import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api/errors";

import { register } from "./api";
import { SignUpForm } from "./sign-up-form";
import { testUser } from "./test-user";

const push = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("./api", () => ({ register: vi.fn() }));

type Fields = {
  email?: string;
  username?: string;
  password?: string;
  passwordConfirm?: string;
  displayName?: string;
};

async function fillAndSubmit({
  email = "maja@example.com",
  username = "maja",
  password = "Str0ng-pass-123",
  passwordConfirm = password,
  displayName = "",
}: Fields = {}) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Email"), email);
  await user.type(screen.getByLabelText("Username"), username);
  await user.type(screen.getByLabelText("Password"), password);
  await user.type(screen.getByLabelText("Repeat password"), passwordConfirm);
  if (displayName) {
    await user.type(screen.getByLabelText(/What should we call you/), displayName);
  }
  await user.click(screen.getByRole("button", { name: "Create account" }));
}

describe("SignUpForm", () => {
  beforeEach(() => {
    render(<SignUpForm />);
  });

  it("registers without a display name and goes to the dashboard", async () => {
    vi.mocked(register).mockResolvedValueOnce(testUser);

    await fillAndSubmit();

    expect(register).toHaveBeenCalledWith({
      email: "maja@example.com",
      username: "maja",
      password: "Str0ng-pass-123",
    });
    expect(push).toHaveBeenCalledWith("/dashboard");
  });

  it("sends the trimmed display name when it is filled in", async () => {
    vi.mocked(register).mockResolvedValueOnce({ ...testUser, display_name: "Maja" });

    await fillAndSubmit({ displayName: "  Maja " });

    expect(register).toHaveBeenCalledWith(expect.objectContaining({ display_name: "Maja" }));
  });

  it("does not call the API when the passwords do not match", async () => {
    await fillAndSubmit({ passwordConfirm: "something-else" });

    expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
    expect(screen.getByLabelText("Repeat password")).toHaveAttribute("aria-invalid", "true");
    expect(register).not.toHaveBeenCalled();
  });

  it("shows API errors next to the fields", async () => {
    vi.mocked(register).mockRejectedValueOnce(
      new ApiError(400, {
        username: ["A user with this username already exists."],
        password: ["This password is too common."],
      }),
    );

    await fillAndSubmit();

    expect(
      await screen.findByText("A user with this username already exists."),
    ).toBeInTheDocument();
    expect(screen.getByText("This password is too common.")).toBeInTheDocument();
    expect(screen.getByLabelText("Username")).toHaveAttribute("aria-invalid", "true");
    expect(push).not.toHaveBeenCalled();
  });
});
