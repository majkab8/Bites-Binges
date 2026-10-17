type FieldErrorProps = {
  id?: string;
  messages?: string[] | undefined;
};

export function FieldError({ id, messages }: FieldErrorProps) {
  if (!messages?.length) {
    return null;
  }

  return (
    <p id={id} className="text-sm text-accent">
      {messages.join(" ")}
    </p>
  );
}
