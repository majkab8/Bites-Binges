import type { Metadata } from "next";
import Link from "next/link";

import { SignInForm } from "@/features/auth/sign-in-form";

export const metadata: Metadata = {
  title: "Log in",
};

export default function SignInPage() {
  return (
    <>
      <h1 className="text-2xl font-bold">Log in</h1>
      <SignInForm />
      <p className="text-sm text-muted-foreground">
        No account yet?
        <Link href="/sign-up" className="ms-1 font-semibold text-accent">
          Sign up
        </Link>
      </p>
    </>
  );
}
