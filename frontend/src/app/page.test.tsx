import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "./page";

describe("Home page", () => {
  it("renders the app name as the main heading", () => {
    render(<Home />);

    expect(screen.getByRole("heading", { level: 1, name: "Bites & Binges" })).toBeInTheDocument();
  });

  it("links to the log in and sign up pages", () => {
    render(<Home />);

    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute("href", "/sign-in");
    expect(screen.getByRole("link", { name: "Sign up" })).toHaveAttribute("href", "/sign-up");
  });
});
