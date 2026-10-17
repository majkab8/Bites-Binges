import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button, ButtonLink } from "./button";

describe("Button", () => {
  it("lets a passed class override the default one", () => {
    render(<Button className="h-9">Save</Button>);

    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toHaveClass("h-9");
    expect(button).not.toHaveClass("h-11");
  });

  it("does not submit forms by default", () => {
    render(<Button>Save</Button>);

    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute("type", "button");
  });
});

describe("ButtonLink", () => {
  it("renders a link with the variant classes", () => {
    render(
      <ButtonLink href="/sign-up" variant="secondary">
        Sign up
      </ButtonLink>,
    );

    const link = screen.getByRole("link", { name: "Sign up" });
    expect(link).toHaveAttribute("href", "/sign-up");
    expect(link).toHaveClass("bg-surface");
  });
});
