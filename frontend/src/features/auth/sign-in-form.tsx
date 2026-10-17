"use client";

import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { TextField } from "@/components/ui/text-field";

import { login } from "./api";
import { useAuthForm } from "./use-auth-form";

function submit(form: FormData) {
  return login({
    email: String(form.get("email")),
    password: String(form.get("password")),
  });
}

export function SignInForm() {
  const { errors, pending, handleSubmit } = useAuthForm({ submit, redirectTo: "/dashboard" });

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <FormError messages={errors.non_field_errors} />
      <TextField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        errors={errors.email}
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        errors={errors.password}
      />
      <Button type="submit" disabled={pending}>
        {pending ? "Logging in…" : "Log in"}
      </Button>
    </form>
  );
}
