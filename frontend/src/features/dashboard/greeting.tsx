"use client";

import { useCurrentUser } from "@/features/auth/current-user";

export function Greeting() {
  const user = useCurrentUser();

  return <h1 className="text-3xl font-semibold">Hello, {user.display_name || user.username}!</h1>;
}
