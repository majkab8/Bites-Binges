export function FormError({ messages }: { messages?: string[] | undefined }) {
  if (!messages?.length) {
    return null;
  }

  return (
    <p role="alert" className="rounded-xl border border-primary/40 bg-primary/20 px-3 py-2 text-sm">
      {messages.join(" ")}
    </p>
  );
}
