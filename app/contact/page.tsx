import type { Metadata } from 'next';

import { ContactForm } from '@/components/contact/contact-form';
import { Container, Section } from '@/components/ui/layout';
import { Panel } from '@/components/ui/surface';
import { getContent } from '@/lib/i18n/server';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Escríbenos',
  description: 'Contacta al semillero Candelaria Solar Car.',
};

const TOPICS = ['general', 'rrhh', 'comite', 'prensa'] as const;
type Topic = (typeof TOPICS)[number];

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ContactPage({ searchParams }: { searchParams: SearchParams }) {
  const { t } = await getContent();
  const params = await searchParams;

  const raw = params.topic;
  const candidate = Array.isArray(raw) ? raw[0] : raw;
  const defaultTopic: Topic =
    candidate && (TOPICS as readonly string[]).includes(candidate) ? (candidate as Topic) : 'general';

  return (
    <Section space="tight" className="overflow-hidden">
      <div aria-hidden className="halo-brand pointer-events-none absolute inset-0 opacity-60" />
      <Container width="reading" className="relative flex flex-col gap-5">
        <header className="flex flex-col gap-2">
          <h1 className="text-balance-tight text-[2.5rem] md:text-[3rem]">
            {t.contact.hero.title}
          </h1>
          <p className="max-w-[48ch] text-base text-ink-muted">{t.contact.hero.lead}</p>
        </header>

        <Panel>
          <ContactForm t={t} defaultTopic={defaultTopic} />
        </Panel>
      </Container>
    </Section>
  );
}
