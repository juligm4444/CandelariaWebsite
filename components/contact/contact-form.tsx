'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { FormMessage, SelectField, TextArea, TextField } from '@/components/ui/field';
import type { Dictionary } from '@/lib/i18n/dictionary';

const TOPICS = ['general', 'rrhh', 'comite', 'prensa'] as const;
type Topic = (typeof TOPICS)[number];

export function ContactForm({ t, defaultTopic }: { t: Dictionary; defaultTopic: Topic }) {
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
      topic: String(data.get('topic') ?? 'general'),
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

  if (state === 'sent') return <FormMessage tone="success">{t.contact.success}</FormMessage>;

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <SelectField label={t.contact.topicLabel} name="topic" defaultValue={defaultTopic}>
        {TOPICS.map((topic) => (
          <option key={topic} value={topic}>
            {t.contact.topics[topic]}
          </option>
        ))}
      </SelectField>

      <div className="grid gap-4 md:grid-cols-2">
        <TextField label={t.contact.name} name="name" autoComplete="name" required />
        <TextField label={t.contact.email} name="email" type="email" autoComplete="email" required />
      </div>

      <TextArea
        label={t.contact.message}
        name="message"
        helper={t.contact.messageHint}
        minLength={20}
        maxLength={4000}
        required
      />

      {/* Honeypot. Hidden from sight and from assistive technology, so only a
          bot that fills every input will trip it. */}
      <div aria-hidden className="absolute left-[-9999px]">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {state === 'error' ? <FormMessage tone="error">{t.contact.error}</FormMessage> : null}
      {state === 'rate' ? <FormMessage tone="error">{t.contact.rateLimited}</FormMessage> : null}

      <Button type="submit" size="lg" disabled={pending} className="self-start">
        {pending ? t.contact.submitting : t.contact.submit}
      </Button>
    </form>
  );
}
