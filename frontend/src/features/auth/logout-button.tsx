"use client";

import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";

import { logout } from "./api";
import { useAuthForm } from "./use-auth-form";

export function LogoutButton() {
  const { errors, pending, handleSubmit } = useAuthForm({ submit: logout, redirectTo: "/" });

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
      <FormError messages={errors.non_field_errors} />
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? "Logging out…" : "Log out"}
      </Button>
    </form>
  );
}
