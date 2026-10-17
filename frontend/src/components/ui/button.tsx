import Link from "next/link";
import type { ComponentProps } from "react";

const base =
  "inline-flex h-11 items-center justify-center rounded-xl px-5 font-semibold disabled:opacity-60";

const variants = {
  primary: "bg-primary text-primary-foreground hover:bg-primary-strong",
  secondary: "border border-border bg-surface hover:bg-surface-strong",
};

type Variant = keyof typeof variants;

function buttonClassName(variant: Variant, className = "") {
  return `${base} ${variants[variant]} ${className}`.trim();
}

type ButtonProps = ComponentProps<"button"> & { variant?: Variant };

export function Button({ variant = "primary", className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClassName(variant, className)} {...props} />;
}

type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: Variant };

export function ButtonLink({ variant = "primary", className, ...props }: ButtonLinkProps) {
  return <Link className={buttonClassName(variant, className)} {...props} />;
}
