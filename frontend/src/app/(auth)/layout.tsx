import { GuestOnly } from "@/features/auth/guest-only";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <GuestOnly>
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="flex w-full max-w-sm flex-col gap-6 rounded-2xl border border-border bg-surface p-6">
          {children}
        </div>
      </main>
    </GuestOnly>
  );
}
