import { describe, expect, it } from "vitest";

import { cn } from "./cn";

describe("cn", () => {
  it("lets later classes override earlier ones", () => {
    expect(cn("h-11 bg-primary", "h-9 bg-surface")).toBe("h-9 bg-surface");
  });

  it("keeps a text size and a theme text color together", () => {
    expect(cn("text-sm", "text-primary-foreground")).toBe("text-sm text-primary-foreground");
  });

  it("skips falsy values", () => {
    expect(cn("px-5", false, undefined, null, "font-semibold")).toBe("px-5 font-semibold");
  });
});
