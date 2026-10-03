import { IconArrowRight } from '@tabler/icons-react';
import type { Metadata } from 'next';

import { AreaMark } from '@/components/brand/lockup';
import { MemberCard } from '@/components/content/member-card';
import { Reveal } from '@/components/motion/reveal';
import { ButtonLink } from '@/components/ui/button';
import { Container, Section, SectionHeader } from '@/components/ui/layout';
import { EmptyState } from '@/components/ui/surface';
import { areas, type AreaKey } from '@/content/areas';
import { listActiveMembers, type Member } from '@/lib/db/members';
import { getContent } from '@/lib/i18n/server';
import { plural } from '@/lib/i18n/dictionary';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Equipo',
  description:
    'Las siete áreas de Candelaria Solar Car, de qué responde cada una y quiénes la integran.',
};

export default async function TeamPage() {
  const { locale, t } = await getContent();
  const members: Member[] = await listActiveMembers().catch((error: unknown) => {
    console.error('[team] listActiveMembers failed: %s', error instanceof Error ? error.message : error);
    return [];
  });

  const byArea = new Map<AreaKey, Member[]>();
  for (const member of members) {
    const list = byArea.get(member.areaKey);
    if (list) list.push(member);
    else byArea.set(member.areaKey, [member]);
  }

  return (
    <>
      <Section space="tight" className="overflow-hidden">
        <div aria-hidden className="halo-brand pointer-events-none absolute inset-0 opacity-60" />
        <Container className="relative flex flex-col items-start gap-4 py-5">
          <h1 className="max-w-[16ch] text-balance-tight text-[2.5rem] md:text-[3.5rem]">
            {t.team.hero.title}
          </h1>
          <p className="max-w-[52ch] text-base text-ink-muted md:text-[1.5rem] md:leading-[1.45]">
            {t.team.hero.lead}
          </p>
        </Container>
      </Section>

      {/* One chapter per area, alternating surface family so seven sections do
          not read as seven identical blocks. */}
      {areas.map((area, index) => {
        const roster = byArea.get(area.key) ?? [];
        const headingId = `${area.key}-titulo`;

        return (
          <Section
            key={area.key}
            id={area.key}
            surface={index % 2 === 0 ? 'canvas' : 'raised'}
            labelledBy={headingId}
            space="tight"
            className="scroll-mt-20"
          >
            <Container className="grid gap-7 lg:grid-cols-[1fr_2fr] lg:gap-9">
              <div className="flex flex-col gap-3">
                <span aria-hidden className="block h-0.5 w-16" style={{ backgroundColor: area.accent }} />
                <div className="flex items-center gap-2">
                  <AreaMark src={area.isotipo} name={area.name[locale]} size={64} className="-ml-4" />
                  <h2 id={headingId} className="font-titulo text-[2rem] font-bold md:text-[2.5rem]">
                    {area.name[locale]}
                  </h2>
                </div>
                <p className="max-w-[44ch] text-base text-ink-muted md:text-[1.5rem] md:leading-[1.45]">
                  {area.brief[locale]}
                </p>
                <p className="text-base font-medium" style={{ color: area.label }}>
                  {plural(t.team.memberCount, roster.length)}
                </p>
              </div>

              <div className="flex flex-col gap-5">
                <div>
                  <h3 className="font-texto text-base font-medium uppercase text-accent">
                    {t.team.dutiesTitle}
                  </h3>
                  <ul className="mt-2 flex flex-col">
                    {area.duties[locale].map((duty) => (
                      <li
                        key={duty}
                        className="py-2 text-base text-ink-muted not-last:border-b not-last:border-hairline"
                      >
                        {duty}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-texto text-base font-medium uppercase text-accent">
                    {t.team.membersTitle}
                  </h3>
                  {roster.length === 0 ? (
                    <EmptyState
                      className="mt-2"
                      title={t.team.emptyTitle}
                      body={t.team.emptyBody}
                    />
                  ) : (
                    <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                      {roster.map((member, position) => (
                        <li key={member.id}>
                          <Reveal delay={Math.min(position, 6) * 0.05}>
                            <MemberCard member={member} area={area} locale={locale} t={t} />
                          </Reveal>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </Container>
          </Section>
        );
      })}

      <Section surface="paper" space="tight" labelledBy="convocatorias">
        <Container width="narrow" className="flex flex-col items-start gap-4">
          <SectionHeader id="convocatorias" title={t.team.join.title} lead={t.team.join.body} />
          <ButtonLink href="/contact?topic=rrhh" variant="primary" size="lg">
            {t.team.join.cta}
            <IconArrowRight className="icon-brand size-5" aria-hidden />
          </ButtonLink>
        </Container>
      </Section>
    </>
  );
}
