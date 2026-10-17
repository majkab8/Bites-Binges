import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api/errors";

import { login } from "./api";
import { SignInForm } from "./sign-in-form";
import { testUser } from "./test-user";

const push = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("./api", () => ({ login: vi.fn() }));

async function submit(email: string, password: string) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Email"), email);
  await user.type(screen.getByLabelText("Password"), password);
  await user.click(screen.getByRole("button", { name: "Log in" }));
}

describe("SignInForm", () => {
  beforeEach(() => {
    render(<SignInForm />);
  });

  it("logs in and goes to the dashboard", async () => {
    vi.mocked(login).mockResolvedValueOnce(testUser);

    await submit("maja@example.com", "secret123");

    expect(login).toHaveBeenCalledWith({ email: "maja@example.com", password: "secret123" });
    expect(push).toHaveBeenCalledWith("/dashboard");
  });

  it("shows the error from the API", async () => {
    vi.mocked(login).mockRejectedValueOnce(
      new ApiError(400, { non_field_errors: ["Invalid email or password."] }),
    );

    await submit("maja@example.com", "wrong");

    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid email or password.");
    expect(push).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Log in" })).toBeEnabled();
  });
});
