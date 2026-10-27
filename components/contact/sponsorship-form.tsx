'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { FormMessage, SelectField, TextArea, TextField } from '@/components/ui/field';
import type { Dictionary } from '@/lib/i18n/dictionary';

const MODALITIES = ['economic', 'material', 'services', 'academic', 'other'] as const;

/**
 * Sponsorship request. Posts to the same /api/contact endpoint as the contact
 * page, with the topic fixed to the Committee, so it inherits the same rate
 * limit, honeypot and server-side validation. No figures or tax benefits are
 * promised here: the Committee answers each request directly.
 */
export function SponsorshipForm({ t }: { t: Dictionary }) {
  const [pending, setPending] = useState(false);
  const [state, setState] = useState<'idle' | 'sent' | 'error' | 'rate'>('idle');

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setState('idle');

    const data = new FormData(event.currentTarget);
    const payload = {
      name: String(data.get('name') ?? ''),
      email: String(data.get('email') ?? ''),
      organization: String(data.get('organization') ?? ''),
      modality: String(data.get('modality') ?? 'other'),
      topic: 'comite',
      message: String(data.get('message') ?? ''),
      website: String(data.get('website') ?? ''),
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setState(response.ok ? 'sent' : response.status === 429 ? 'rate' : 'error');
    } catch {
      setState('error');
    } finally {
      setPending(false);
    }
  };

  const copy = t.support.sponsor;

  if (state === 'sent') {
    return (
      <div role="status">
        <FormMessage tone="success">{copy.success}</FormMessage>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="relative flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <TextField label={copy.name} name="name" autoComplete="name" required minLength={2} maxLength={120} />
        <TextField
          label={copy.organization}
          name="organization"
          autoComplete="organization"
          required
          maxLength={160}
        />
        <TextField
          label={copy.email}
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={200}
        />
        <SelectField label={copy.modality} name="modality" defaultValue="economic">
          {MODALITIES.map((modality) => (
            <option key={modality} value={modality}>
              {copy.modalities[modality]}
            </option>
          ))}
        </SelectField>
      </div>

      <TextArea
        label={copy.proposal}
        name="message"
        helper={copy.proposalHint}
        minLength={20}
        maxLength={4000}
        rows={4}
        required
      />

      <div aria-hidden className="absolute left-[-9999px]">
        <label htmlFor="sponsor-website">Website</label>
        <input id="sponsor-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div aria-live="polite">
        {state === 'error' ? <FormMessage tone="error">{t.contact.error}</FormMessage> : null}
        {state === 'rate' ? <FormMessage tone="error">{t.contact.rateLimited}</FormMessage> : null}
      </div>

      <Button type="submit" size="lg" disabled={pending} className="self-start">
        {pending ? copy.submitting : copy.submit}
      </Button>
    </form>
  );
}
