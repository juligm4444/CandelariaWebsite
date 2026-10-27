import type { Metadata } from 'next';

import { ContactForm } from '@/components/contact/contact-form';
import { Container, Section } from '@/components/ui/layout';
import { Panel } from '@/components/ui/surface';
import { TextLink } from '@/components/ui/text-link';
import { getContent } from '@/lib/i18n/server';
import { pageMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = pageMetadata({
  title: 'Escríbenos',
  description:
    'Escríbele a Candelaria Solar Car: patrocinios, alianzas académicas, prensa o preguntas sobre el vehículo solar de la Universidad de los Andes.',
  path: '/contact',
});

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
      <Container className="relative grid gap-7 lg:grid-cols-[5fr_7fr] lg:gap-9">
        <div className="flex flex-col gap-7">
          <header className="flex flex-col gap-3">
            <h1 className="text-balance-tight text-[2.5rem] md:text-[3.5rem]">
              {t.contact.hero.title}
            </h1>
            <p className="max-w-[48ch] text-base text-ink-muted md:text-[1.5rem] md:leading-[1.45]">
              {t.contact.hero.lead}
            </p>
          </header>

          {/* Routes that answer most messages before they are written. */}
          <ul className="flex flex-col border-t border-hairline">
            {t.contact.routes.map((route) => (
              <li
                key={route.href}
                data-light=""
                className="cdl-light flex flex-col gap-1 border-b border-hairline px-2 py-4 [--cdl-light-alpha:0.08]"
              >
                <h2 className="font-titulo text-2xl font-bold">{route.title}</h2>
                <p className="text-base text-ink-muted">{route.body}</p>
                <TextLink href={route.href}>{route.cta}</TextLink>
              </li>
            ))}
          </ul>
        </div>

        <Panel className="self-start">
          <ContactForm t={t} defaultTopic={defaultTopic} />
        </Panel>
      </Container>
    </Section>
  );
}
