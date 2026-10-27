import { IconChevronDown } from '@tabler/icons-react';
import type { Metadata } from 'next';

import { TeamExplorer } from '@/components/team/team-explorer';
import type { ExplorerArea, ExplorerLabels } from '@/components/team/types';
import { WorkCycle } from '@/components/team/work-cycle';
import { Container, Section, SectionHeader } from '@/components/ui/layout';
import { areas, type AreaKey } from '@/content/areas';
import { EMPTY_LINKS, listActiveMembers, memberLinks, type Member } from '@/lib/db/members';
import { plural } from '@/lib/i18n/dictionary';
import { getContent } from '@/lib/i18n/server';
import { initials, mediaUrl } from '@/lib/media';
import { normaliseSocialUrl, SOCIAL_KEYS } from '@/lib/social';
import { pageMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = pageMetadata({
  title: 'Equipo',
  description:
    'Las siete áreas de Candelaria Solar Car, de qué responde cada una y quiénes la integran.',
  path: '/team',
});

const AREA_KEYS = new Set<string>(areas.map((area) => area.key));

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function TeamPage({ searchParams }: { searchParams: SearchParams }) {
  const { locale, t } = await getContent();
  const params = await searchParams;

  const rawArea = Array.isArray(params.area) ? params.area[0] : params.area;
  const requested = rawArea && AREA_KEYS.has(rawArea) ? (rawArea as AreaKey) : null;

  const members: Member[] = await listActiveMembers().catch((error: unknown) => {
    console.error('[team] listActiveMembers failed: %s', error instanceof Error ? error.message : error);
    return [];
  });
  const links = await memberLinks(members.map((member) => member.id));

  const byArea = new Map<AreaKey, Member[]>();
  for (const member of members) {
    const list = byArea.get(member.areaKey);
    if (list) list.push(member);
    else byArea.set(member.areaKey, [member]);
  }

  const explorerAreas: ExplorerArea[] = areas.map((area) => {
    const roster = byArea.get(area.key) ?? [];
    return {
      key: area.key,
      name: area.name[locale],
      brief: area.brief[locale],
      duties: [...area.duties[locale]],
      accent: area.accent,
      label: area.label,
      rgb: area.rgb,
      countLabel: plural(t.team.memberCount, roster.length),
      members: roster.map((member) => {
        const extra = links.get(member.id) ?? EMPTY_LINKS;
        return {
          id: member.id,
          name: member.name,
          role: member.roleTitle,
          position:
            member.internalRole === 'leader' || member.internalRole === 'coleader'
              ? member.internalRole
              : null,
          photo: mediaUrl(member.imagePath),
          initials: initials(member.name),
          // Stored links were validated on write; they are checked again on
          // read so a tampered row can never put a foreign scheme in an href.
          links: SOCIAL_KEYS.flatMap((key) => {
            const href = extra[key] ? normaliseSocialUrl(key, extra[key]) : null;
            return href ? [{ key, href }] : [];
          }),
        };
      }),
    };
  });

  // Arriving from a link to an area (/team?area=celdas) shows that area;
  // otherwise the ring turns until the visitor picks one.
  const initial = requested;

  const labels: ExplorerLabels = {
    ringHint: {
      label: t.team.explorer.ringLabel,
      pointer: t.team.explorer.ringPointer,
      touch: t.team.explorer.ringTouch,
    },
    dutiesTitle: t.team.dutiesTitle,
    membersTitle: t.team.membersTitle,
    emptyTitle: t.team.emptyTitle,
    emptyBody: t.team.emptyBody,
    previous: t.team.explorer.previous,
    next: t.team.explorer.next,
    logLink: t.team.explorer.logLink,
    card: {
      leader: t.team.roles.leader,
      coleader: t.team.roles.coleader,
      showBack: t.team.explorer.showBack,
      showFront: t.team.explorer.showFront,
      linksTitle: t.team.socialTitle,
      noLinks: t.team.explorer.noLinks,
      newTab: t.team.explorer.newTab,
      social: {
        linkedinUrl: t.profile.fields.linkedinUrl,
        githubUrl: t.profile.fields.githubUrl,
        instagramUrl: t.profile.fields.instagramUrl,
        websiteUrl: t.profile.fields.websiteUrl,
      },
    },
    ring: t.team.explorer.ring,
  };

  return (
    <>
      {/* Mini hero: the claim. */}
      <Section space="tight" className="overflow-hidden pb-5 md:pb-7">
        <div aria-hidden className="halo-brand pointer-events-none absolute inset-0 opacity-60" />
        <Container className="relative flex flex-col items-start gap-3">
          <h1 data-intro="" className="max-w-[20ch] text-balance-tight text-[2.5rem] md:text-[3.5rem]">
            {t.team.hero.title}
          </h1>
          <p
            data-intro=""
            style={{ '--i': 1 } as React.CSSProperties}
            className="max-w-[52ch] text-base text-ink-muted md:text-[1.5rem] md:leading-[1.45]"
          >
            {t.team.hero.lead}
          </p>
          <p data-intro="" style={{ '--i': 2 } as React.CSSProperties} className="text-base text-ink-faint">
            {plural(t.team.explorer.summary, members.length).replace('{{areas}}', String(areas.length))}
          </p>
        </Container>
      </Section>

      <Section space="tight" className="pt-0 md:pt-0">
        <Container>
          <TeamExplorer areas={explorerAreas} initial={initial} labels={labels} />
        </Container>
      </Section>

      {/* How the areas work together, drawn: the seven areas rearranged by
          each practice. */}
      <Section surface="paper" labelledBy="como-trabajamos">
        <Container className="flex flex-col gap-7 md:gap-9">
          <SectionHeader
            id="como-trabajamos"
            title={t.team.howWeWork.title}
            lead={t.team.howWeWork.lead}
          />
          <WorkCycle
            steps={t.team.howWeWork.items}
            colors={areas.map((area) => area.accent)}
            labels={t.team.howWeWork.controls}
          />
        </Container>
      </Section>

      <Section labelledBy="preguntas" space="tight">
        <Container width="narrow" className="flex flex-col gap-5">
          <h2 id="preguntas" className="text-balance-tight text-[2rem] md:text-[3rem]">
            {t.team.faq.title}
          </h2>
          <div className="flex flex-col border-t border-hairline">
            {t.team.faq.items.map((item) => (
              <details key={item.q} className="group border-b border-hairline">
                <summary
                  data-light=""
                  className="cdl-light flex min-h-14 list-none items-center justify-between gap-4 rounded-card px-2 py-3 text-base font-medium text-ink md:text-[1.5rem] [&::-webkit-details-marker]:hidden"
                >
                  {item.q}
                  <IconChevronDown
                    className="icon-brand size-6 shrink-0 text-accent transition-transform duration-300 ease-out-ui group-open:rotate-180 motion-reduce:transition-none"
                    aria-hidden
                  />
                </summary>
                <p className="max-w-[65ch] px-2 pb-4 text-base text-ink-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
