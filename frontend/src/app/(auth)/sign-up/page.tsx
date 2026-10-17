import type { Metadata } from "next";
import Link from "next/link";

import { SignUpForm } from "@/features/auth/sign-up-form";

export const metadata: Metadata = {
  title: "Sign up",
};

export default function SignUpPage() {
  return (
    <>
      <h1 className="text-2xl font-bold">Create an account</h1>
      <SignUpForm />
      <p className="text-sm text-muted-foreground">
        Already have an account?
        <Link href="/sign-in" className="ms-1 font-semibold text-accent">
          Log in
        </Link>
      </p>
    </>
  );
}
