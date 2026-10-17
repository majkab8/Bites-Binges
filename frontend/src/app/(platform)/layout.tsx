import { CurrentUserProvider } from "@/features/auth/current-user";

export default function PlatformLayout({ children }: LayoutProps<"/">) {
  return <CurrentUserProvider>{children}</CurrentUserProvider>;
}
