import { Container, Hairline, Section } from '@/components/ui/layout';
import type { LegalSection } from '@/content/legal';
import { formatDate } from '@/lib/utils';

/** Shared reading layout for the privacy notice and the terms. */
export function LegalPage({
  title,
  intro,
  sections,
  updated,
  updatedLabel,
  locale,
}: {
  title: string;
  intro: string;
  sections: LegalSection[];
  updated: string;
  updatedLabel: string;
  locale: string;
}) {
  return (
    <Section surface="paper" space="tight">
      <Container width="reading" className="flex flex-col gap-5">
        <header className="flex flex-col gap-2">
          <h1 className="text-balance-tight text-[2rem] md:text-[3rem]">{title}</h1>
          <p className="text-base text-ink-muted">
            {updatedLabel}: {formatDate(updated, locale)}
          </p>
          <p className="text-base leading-relaxed text-ink md:text-[1.5rem] md:leading-[1.6]">
            {intro}
          </p>
        </header>

        <Hairline />

        {sections.map((section) => (
          <section key={section.heading} className="flex flex-col gap-2">
            <h2 className="font-titulo text-2xl font-bold">{section.heading}</h2>
            {section.body.map((paragraph, index) => (
              <p key={index} className="text-base leading-relaxed text-ink-muted">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </Container>
    </Section>
  );
}
