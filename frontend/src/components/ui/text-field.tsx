import { type ComponentProps, useId } from "react";

import { FieldError } from "./field-error";

type TextFieldProps = ComponentProps<"input"> & {
  label: string;
  errors?: string[] | undefined;
};

export function TextField({ label, errors, ...inputProps }: TextFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hasErrors = Boolean(errors?.length);

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={hasErrors}
        aria-describedby={hasErrors ? errorId : undefined}
        className="h-11 rounded-xl border border-border bg-black/25 px-3 outline-none focus:border-accent aria-invalid:border-accent"
        {...inputProps}
      />
      <FieldError id={errorId} messages={errors} />
    </div>
  );
}
