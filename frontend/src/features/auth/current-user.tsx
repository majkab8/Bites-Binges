"use client";

import { useRouter } from "next/navigation";
import { createContext, type ReactNode, use, useEffect } from "react";

import { FormError } from "@/components/ui/form-error";

import type { User } from "./types";
import { useSession } from "./use-session";

const CurrentUserContext = createContext<User | null>(null);

export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (session.status === "guest") {
      router.replace("/sign-in");
    }
  }, [session.status, router]);

  if (session.status === "error") {
    return <FormError messages={session.errors} />;
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
