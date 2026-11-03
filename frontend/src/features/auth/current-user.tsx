"use client";

import { useRouter } from "next/navigation";
import { createContext, type ReactNode, use, useEffect, useState } from "react";

import { FormError } from "@/components/ui/form-error";
import { errorsFrom } from "@/lib/api/errors";

import { logout } from "./api";
import type { User } from "./types";
import { useSession } from "./use-session";

const CurrentUserContext = createContext<User | null>(null);

export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const session = useSession();

  const [logoutErrors, setLogoutErrors] = useState<string[]>([]);

  useEffect(() => {
    if (session.status !== "guest") {
      return;
    }
    logout()
      .then(() => router.replace("/sign-in"))
      .catch((error: unknown) => setLogoutErrors(errorsFrom(error).non_field_errors ?? []));
  }, [session.status, router]);

  if (session.status === "error") {
    return <FormError messages={session.errors} />;
  }
  if (logoutErrors.length > 0) {
    return <FormError messages={logoutErrors} />;
  }
  if (session.status !== "user") {
    return null;
  }
  return <CurrentUserContext value={session.user}>{children}</CurrentUserContext>;
}

export function useCurrentUser(): User {
  const user = use(CurrentUserContext);
  if (!user) {
    throw new Error("useCurrentUser must be used inside CurrentUserProvider.");
  }
  return user;
}
