import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { errorsFrom, type FieldErrors } from "@/lib/api/errors";

type AuthFormOptions = {
  submit: (form: FormData) => Promise<unknown>;
  redirectTo: string;
  validate?: (form: FormData) => FieldErrors;
};

export function useAuthForm({ submit, redirectTo, validate }: AuthFormOptions) {
  const router = useRouter();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const validationErrors = validate?.(form) ?? {};
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setPending(true);
    try {
      await submit(form);
      router.push(redirectTo);
    } catch (error) {
      setErrors(errorsFrom(error));
      setPending(false);
    }
  }

  return { errors, pending, handleSubmit };
}
