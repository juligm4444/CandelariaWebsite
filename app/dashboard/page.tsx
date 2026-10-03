import type { Metadata } from 'next';
import Link from 'next/link';

import {
  ColeaderForm,
  DeletePublicationForm,
  InviteForm,
  RevokeMemberForm,
  TransferLeadForm,
} from '@/components/dashboard/member-actions';
import { PublicationForm } from '@/components/dashboard/publication-form';
import { Container, Section } from '@/components/ui/layout';
import { EmptyState, Panel, Pill } from '@/components/ui/surface';
import { areaByKey } from '@/content/areas';
import { canManageArea, isAreaLeader, requireInternal } from '@/lib/auth/session';
import { listAreaInvites, listAreaMembers } from '@/lib/db/members';
import { publicationsByArea } from '@/lib/db/publications';
import { getContent } from '@/lib/i18n/server';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Panel',
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const user = await requireInternal('/dashboard');
  const { locale, t } = await getContent();

  if (!user.areaKey) {
    return (
      <Section space="tight">
        <Container width="narrow">
          <EmptyState title={t.dashboard.noAreaTitle} body={t.dashboard.noAreaBody} />
        </Container>
      </Section>
    );
  }

  const area = areaByKey.get(user.areaKey);
  const manages = canManageArea(user, user.areaKey);
  const leads = isAreaLeader(user, user.areaKey);

  const [publications, members, invites] = await Promise.all([
    publicationsByArea(user.areaKey, locale).catch(() => []),
    manages ? listAreaMembers(user.areaKey).catch(() => []) : Promise.resolve([]),
    manages ? listAreaInvites(user.areaKey).catch(() => []) : Promise.resolve([]),
  ]);

  const mine = publications.filter((publication) => publication.authorName === user.name);

  return (
    <Section space="tight">
      <Container className="flex flex-col gap-7">
        <header className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {area ? (
              <Pill tone="outline" style={{ borderColor: area.accent, color: area.label }}>
                {area.name[locale]}
              </Pill>
            ) : null}
            {user.internalRole ? <Pill tone="neutral">{t.team.roles[user.internalRole]}</Pill> : null}
          </div>
          <h1 className="text-balance-tight text-[2.5rem] md:text-[3rem]">
            {t.dashboard.hero.title}
          </h1>
          <p className="max-w-[56ch] text-base text-ink-muted">{t.dashboard.hero.lead}</p>
        </header>

        {/* Publications */}
        <section className="flex flex-col gap-4">
          <h2 className="font-titulo text-[2rem] font-bold">{t.dashboard.tabs.publications}</h2>

          <Panel>
            <PublicationForm t={t} />
          </Panel>

          <div className="grid gap-5 lg:grid-cols-2">
            <PublicationList
              title={t.dashboard.publications.mine}
              empty={t.dashboard.publications.emptyMine}
              items={mine}
              locale={locale}
              t={t}
              deletable={manages}
            />
            <PublicationList
              title={t.dashboard.publications.area}
              empty={t.dashboard.publications.emptyArea}
              items={publications}
              locale={locale}
              t={t}
              deletable={manages}
            />
          </div>
        </section>

        {/* Area management, only for leads and co-leads */}
        {manages ? (
          <section className="flex flex-col gap-4">
            <h2 className="font-titulo text-[2rem] font-bold">{t.dashboard.members.title}</h2>

            <Panel>
              <InviteForm t={t} canInviteColeader={leads} />
            </Panel>

            <ul className="flex flex-col">
              {members.map((member) => (
                <li
                  key={member.id}
                  className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline py-3"
                >
                  <div className="flex min-w-48 flex-col">
                    <span className="text-base text-ink">{member.name}</span>
                    <span className="text-base text-ink-faint">{member.email}</span>
                  </div>

                  <Pill tone="outline">{t.team.roles[member.internalRole]}</Pill>

                  {leads && member.id !== user.id ? (
                    <div className="flex flex-wrap items-center gap-2">
                      {member.internalRole !== 'leader' ? (
                        <ColeaderForm
                          t={t}
                          targetId={member.id}
                          promote={member.internalRole !== 'coleader'}
                        />
                      ) : null}
                      {member.internalRole === 'coleader' ? (
                        <TransferLeadForm t={t} targetId={member.id} />
                      ) : null}
                      {member.internalRole !== 'leader' ? (
                        <RevokeMemberForm t={t} targetId={member.id} />
                      ) : null}
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>

            {invites.length > 0 ? (
              <div className="flex flex-col gap-2">
                <h3 className="font-texto text-base font-medium uppercase text-accent">
                  {t.dashboard.members.invite}
                </h3>
                <ul className="flex flex-col">
                  {invites.map((invite) => (
                    <li
                      key={invite.id}
                      className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline py-2"
                    >
                      <span className="text-base text-ink">{invite.email}</span>
                      <span className="text-base text-ink-faint">
                        {t.team.roles[invite.role]}
                      </span>
                      <span className="text-base text-ink-faint">
                        {invite.consumedAt
                          ? formatDate(invite.consumedAt, locale)
                          : formatDate(invite.createdAt, locale)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        ) : null}
      </Container>
    </Section>
  );
}

function PublicationList({
  title,
  empty,
  items,
  locale,
  t,
  deletable,
}: {
  title: string;
  empty: string;
  items: Awaited<ReturnType<typeof publicationsByArea>>;
  locale: 'es' | 'en';
  t: Awaited<ReturnType<typeof getContent>>['t'];
  deletable: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-texto text-base font-medium uppercase text-accent">{title}</h3>

      {items.length === 0 ? (
        <p className="text-base text-ink-muted">{empty}</p>
      ) : (
        <ul className="flex flex-col">
          {items.map((publication) => (
            <li
              key={publication.id}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline py-3"
            >
              <div className="flex min-w-48 flex-col">
                <Link
                  href={`/publications/${publication.slug}`}
                  className="text-base text-ink transition-colors duration-200 ease-brand hover:text-accent"
                >
                  {publication.title}
                </Link>
                <time dateTime={publication.publishedAt} className="text-base text-ink-faint">
                  {formatDate(publication.publishedAt, locale)}
                </time>
              </div>
              {deletable ? <DeletePublicationForm t={t} id={publication.id} /> : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
