"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";

import { useSession } from "./use-session";

export function GuestOnly({ children }: { children: ReactNode }) {
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (session.status === "user") {
      router.replace("/dashboard");
    }
  }, [session.status, router]);

  return session.status === "guest" || session.status === "error" ? children : null;
}
