'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';

import { createPublicationAction, type ActionState } from '@/app/actions/dashboard';
import { Button } from '@/components/ui/button';
import { FormMessage, TextArea, TextField } from '@/components/ui/field';
import type { Dictionary } from '@/lib/i18n/dictionary';

const initial: ActionState = { status: 'idle' };

function Submit({ t }: { t: Dictionary }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="self-start">
      {pending
        ? t.dashboard.publications.form.submitting
        : t.dashboard.publications.form.submit}
    </Button>
  );
}

export function PublicationForm({ t }: { t: Dictionary }) {
  const [state, action] = useActionState(createPublicationAction, initial);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button variant="accent" onClick={() => setOpen(true)} className="self-start">
        {t.dashboard.publications.create}
      </Button>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <TextField label={t.dashboard.publications.form.nameEs} name="titleEs" required maxLength={300} />
        <TextField label={t.dashboard.publications.form.nameEn} name="titleEn" required maxLength={300} />
      </div>

      <TextArea
        label={t.dashboard.publications.form.abstractEs}
        name="abstractEs"
        required
        maxLength={20000}
      />
      <TextArea
        label={t.dashboard.publications.form.abstractEn}
        name="abstractEn"
        required
        maxLength={20000}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="cover" className="text-base font-medium text-ink">
            {t.dashboard.publications.form.image}
          </label>
          <input
            id="cover"
            name="cover"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="w-full rounded-pill border border-hairline-strong px-4 py-3 text-base text-ink-muted file:mr-4 file:rounded-pill file:border-0 file:bg-surface-raised file:px-4 file:py-2 file:text-base file:text-ink"
          />
          <p className="text-base text-ink-muted">{t.dashboard.publications.form.imageHint}</p>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="pdf" className="text-base font-medium text-ink">
            {t.dashboard.publications.form.pdf}
          </label>
          <input
            id="pdf"
            name="pdf"
            type="file"
            accept="application/pdf"
            className="w-full rounded-pill border border-hairline-strong px-4 py-3 text-base text-ink-muted file:mr-4 file:rounded-pill file:border-0 file:bg-surface-raised file:px-4 file:py-2 file:text-base file:text-ink"
          />
          <p className="text-base text-ink-muted">{t.dashboard.publications.form.pdfHint}</p>
        </div>
      </div>

      {state.status === 'success' ? (
        <FormMessage tone="success">{t.dashboard.publications.created}</FormMessage>
      ) : null}
      {state.status === 'error' ? (
        <FormMessage tone="error">{t.dashboard.publications.createError}</FormMessage>
      ) : null}

      <div className="flex gap-2">
        <Submit t={t} />
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          {t.common.cancel}
        </Button>
      </div>
    </form>
  );
}
