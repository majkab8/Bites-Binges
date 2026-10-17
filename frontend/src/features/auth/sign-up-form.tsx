"use client";

import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { TextField } from "@/components/ui/text-field";
import type { FieldErrors } from "@/lib/api/errors";

import { register } from "./api";
import { useAuthForm } from "./use-auth-form";

function validate(form: FormData): FieldErrors {
  return form.get("password") === form.get("password_confirm") ?
      {}
    : { password_confirm: ["Passwords do not match."] };
}

function submit(form: FormData) {
  const displayName = String(form.get("display_name")).trim();

  return register({
    email: String(form.get("email")),
    username: String(form.get("username")),
    password: String(form.get("password")),
    ...(displayName && { display_name: displayName }),
  });
}

export function SignUpForm() {
  const { errors, pending, handleSubmit } = useAuthForm({
    submit,
    validate,
    redirectTo: "/dashboard",
  });

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
        label="Username"
        name="username"
        autoComplete="username"
        required
        errors={errors.username}
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        errors={errors.password}
      />
      <TextField
        label="Repeat password"
        name="password_confirm"
        type="password"
        autoComplete="new-password"
        required
        errors={errors.password_confirm}
      />
      <TextField
        label="What should we call you? (optional)"
        name="display_name"
        autoComplete="given-name"
        maxLength={50}
        errors={errors.display_name}
      />
      <Button type="submit" disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
