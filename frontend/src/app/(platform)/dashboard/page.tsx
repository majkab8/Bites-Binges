import type { Metadata } from "next";

import { LogoutButton } from "@/features/auth/logout-button";
import { Greeting } from "@/features/dashboard/greeting";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-4">
      <Greeting />
      <LogoutButton />
    </main>
  );
}
