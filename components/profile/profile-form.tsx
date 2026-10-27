'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { updateProfile, type ProfileActionState } from '@/app/actions/profile';
import { Button } from '@/components/ui/button';
import { FormMessage, SelectField, TextArea, TextField } from '@/components/ui/field';
import { careers } from '@/content/careers';
import type { CurrentUser } from '@/lib/auth/session';
import type { MemberLinks } from '@/lib/db/members';
import { SOCIAL_KEYS } from '@/lib/social';
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
  links,
  locale,
  t,
}: {
  user: CurrentUser;
  links: MemberLinks;
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

          <fieldset className="flex flex-col gap-4 border-t border-hairline pt-4">
            <legend className="font-titulo text-2xl font-bold">{t.profile.fields.cardTitle}</legend>
            <p className="text-base text-ink-muted">{t.profile.fields.cardHint}</p>

            <TextArea
              label={t.profile.fields.bio}
              name="bio"
              defaultValue={links.bio ?? ''}
              helper={t.profile.fields.bioHint}
              maxLength={280}
              rows={3}
            />

            <div className="grid gap-4 md:grid-cols-2">
              {SOCIAL_KEYS.map((key) => (
                <TextField
                  key={key}
                  label={t.profile.fields[key]}
                  name={key}
                  type="url"
                  inputMode="url"
                  defaultValue={links[key] ?? ''}
                  placeholder="https://"
                  maxLength={300}
                />
              ))}
            </div>
          </fieldset>
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
        <FormMessage tone="error">
          {state.message === 'INVALID_LINK'
            ? t.profile.fields.linkError
            : state.message === 'BIO_TOO_LONG'
              ? t.profile.fields.bioError
              : t.profile.updateError}
        </FormMessage>
      ) : null}

      <Submit t={t} />
    </form>
  );
}
