'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { updateProfile, type ProfileActionState } from '@/app/actions/profile';
import { Button } from '@/components/ui/button';
import { FormMessage, SelectField, TextField } from '@/components/ui/field';
import { careers } from '@/content/careers';
import type { CurrentUser } from '@/lib/auth/session';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionary';

const initial: ProfileActionState = { status: 'idle' };

function Submit({ t }: { t: Dictionary }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="self-start">
      {pending ? t.common.saving : t.common.save}
    </Button>
  );
}

export function ProfileForm({
  user,
  locale,
  t,
}: {
  user: CurrentUser;
  locale: Locale;
  t: Dictionary;
}) {
  const [state, action] = useActionState(updateProfile, initial);

  return (
    <form action={action} className="flex flex-col gap-4">
      <TextField
        label={t.profile.fields.name}
        name="name"
        defaultValue={user.name}
        autoComplete="name"
        required
      />

      <TextField
        label={t.profile.fields.email}
        name="email"
        type="email"
        defaultValue={user.email}
        helper={t.profile.fields.emailLocked}
        disabled
        readOnly
      />

      {user.isInternal ? (
        <>
          <SelectField
            label={t.profile.fields.career}
            name="careerKey"
            defaultValue={user.careerKey ?? ''}
          >
            <option value="">{t.profile.fields.careerPlaceholder}</option>
            {careers.map((career) => (
              <option key={career.key} value={career.key}>
                {career[locale]}
              </option>
            ))}
          </SelectField>

          <TextField
            label={t.profile.fields.role}
            name="roleTitle"
            defaultValue={user.roleTitle ?? ''}
            placeholder={t.profile.fields.rolePlaceholder}
            maxLength={120}
          />
        </>
      ) : null}

      <div className="flex flex-col gap-2">
        <label htmlFor="photo" className="text-base font-medium text-ink">
          {t.profile.fields.photo}
        </label>
        <input
          id="photo"
          name="photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="w-full rounded-pill border border-hairline-strong px-4 py-3 text-base text-ink-muted file:mr-4 file:rounded-pill file:border-0 file:bg-surface-raised file:px-4 file:py-2 file:text-base file:text-ink"
        />
        <p className="text-base text-ink-muted">{t.profile.fields.photoHint}</p>
      </div>

      {state.status === 'success' ? (
        <FormMessage tone="success">{t.profile.updateSuccess}</FormMessage>
      ) : null}
      {state.status === 'error' ? (
        <FormMessage tone="error">{t.profile.updateError}</FormMessage>
      ) : null}

      <Submit t={t} />
    </form>
  );
}
