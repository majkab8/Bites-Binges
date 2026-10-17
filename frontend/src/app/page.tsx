import { ButtonLink } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 p-4">
      <h1 className="text-3xl font-semibold">Bites & Binges</h1>
      <div className="flex gap-3">
        <ButtonLink href="/sign-in" variant="secondary">
          Log in
        </ButtonLink>
        <ButtonLink href="/sign-up">Sign up</ButtonLink>
      </div>
    </main>
  );
}
