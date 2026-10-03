'use client';

import { IconAlertTriangle } from '@tabler/icons-react';
import { useId, type ComponentProps, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

/**
 * Form controls. Label above, helper text always present in the markup, error
 * below. Placeholder never substitutes for a label. Contrast is checked against
 * both surface families: `--cdl-text-muted` is 0.72 alpha, which clears AA on
 * Morado 300 and on Neutro 100.
 */

const controlClass =
  'w-full rounded-pill border border-hairline-strong bg-transparent px-4 py-3 text-base ' +
  'text-ink placeholder:text-ink-faint transition-colors duration-200 ease-brand ' +
  'hover:border-accent focus:border-accent aria-[invalid=true]:border-area-comite';

function FieldShell({
  id,
  label,
  helper,
  error,
  required,
  children,
  className,
}: {
  id: string;
  label: string;
  helper?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={id} className="text-base font-medium text-ink">
        {label}
        {required ? (
          <span aria-hidden className="pl-1 text-accent">
            *
          </span>
        ) : null}
      </label>
      {children}
      {helper && !error ? (
        <p id={`${id}-helper`} className="text-base leading-snug text-ink-muted">
          {helper}
        </p>
      ) : null}
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="flex items-start gap-2 text-base leading-snug text-area-comite"
        >
          <IconAlertTriangle className="icon-brand mt-0.5 size-5" aria-hidden />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}

type FieldCommon = {
  label: string;
  helper?: string;
  error?: string;
  className?: string;
};

export function TextField({
  label,
  helper,
  error,
  className,
  id: providedId,
  required,
  ...props
}: FieldCommon & ComponentProps<'input'>) {
  const generated = useId();
  const id = providedId ?? generated;
  return (
    <FieldShell
      id={id}
      label={label}
      helper={helper}
      error={error}
      required={required}
      className={className}
    >
      <input
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : helper ? `${id}-helper` : undefined}
        className={controlClass}
        {...props}
      />
    </FieldShell>
  );
}

export function TextArea({
  label,
  helper,
  error,
  className,
  id: providedId,
  required,
  rows = 5,
  ...props
}: FieldCommon & ComponentProps<'textarea'>) {
  const generated = useId();
  const id = providedId ?? generated;
  return (
    <FieldShell
      id={id}
      label={label}
      helper={helper}
      error={error}
      required={required}
      className={className}
    >
      <textarea
        id={id}
        rows={rows}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : helper ? `${id}-helper` : undefined}
        className={cn(controlClass, 'min-h-32 resize-y rounded-card leading-relaxed')}
        {...props}
      />
    </FieldShell>
  );
}

export function SelectField({
  label,
  helper,
  error,
  className,
  id: providedId,
  required,
  children,
  ...props
}: FieldCommon & ComponentProps<'select'>) {
  const generated = useId();
  const id = providedId ?? generated;
  return (
    <FieldShell
      id={id}
      label={label}
      helper={helper}
      error={error}
      required={required}
      className={className}
    >
      <select
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : helper ? `${id}-helper` : undefined}
        className={cn(controlClass, 'appearance-none bg-surface pr-10')}
        {...props}
      >
        {children}
      </select>
    </FieldShell>
  );
}

/** Inline form-level message. Used for submit failures, not per-field errors. */
export function FormMessage({
  tone,
  children,
}: {
  tone: 'error' | 'success';
  children: ReactNode;
}) {
  return (
    <p
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'rounded-card border px-4 py-3 text-base',
        tone === 'error' && 'border-area-comite/40 text-area-comite',
        tone === 'success' && 'border-area-baterias/40 text-area-baterias',
      )}
    >
      {children}
    </p>
  );
}
