import type { Metadata } from 'next';

import { PortalButton } from '@/components/commerce/portal-button';
import { ButtonLink } from '@/components/ui/button';
import { Container, Section } from '@/components/ui/layout';
import { EmptyState, Panel, Pill } from '@/components/ui/surface';
import { CURRENCY, tierById } from '@/content/catalog';
import { requireUser } from '@/lib/auth/session';
import { getActiveMembership, listContributions } from '@/lib/db/commerce';
import { getContent } from '@/lib/i18n/server';
import { formatDate, formatMoney } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Compras',
  robots: { index: false, follow: false },
};

export default async function PurchasesPage() {
  const user = await requireUser('/purchases');
  const { locale, t } = await getContent();

  const [membership, contributions] = await Promise.all([
    getActiveMembership(user.id).catch(() => null),
    listContributions(user.id).catch(() => []),
  ]);

  const tier = membership ? tierById.get(membership.tierId) : null;

  return (
    <Section space="tight">
      <Container className="flex flex-col gap-7">
        <header className="flex flex-col gap-2">
          <h1 className="text-balance-tight text-[2.5rem] md:text-[3rem]">
            {t.purchases.hero.title}
          </h1>
          <p className="max-w-[56ch] text-base text-ink-muted">{t.purchases.hero.lead}</p>
        </header>

        <section className="flex flex-col gap-3">
          <h2 className="font-texto text-base font-medium uppercase text-accent">
            {t.purchases.membershipTitle}
          </h2>

          {membership && tier ? (
            <Panel className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <p className="font-titulo text-2xl font-bold">{tier.name[locale]}</p>
                <p className="text-base text-ink-muted">
                  {formatMoney(tier.monthlyPrice, CURRENCY, locale)} {t.support.plans.perMonth}
                </p>
                {membership.currentPeriodEnd ? (
                  <p className="text-base text-ink-faint">
                    {t.purchases.nextBilling}: {formatDate(membership.currentPeriodEnd, locale)}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col items-start gap-2">
                <Pill tone="accent">{t.purchases.status[membership.status]}</Pill>
                <PortalButton label={t.purchases.manage} note={t.purchases.manageNote} />
              </div>
            </Panel>
          ) : (
            <EmptyState
              title={t.purchases.noMembershipTitle}
              body={t.purchases.noMembershipBody}
              action={
                <ButtonLink href="/support#membresias" variant="primary">
                  {t.purchases.noMembershipCta}
                </ButtonLink>
              }
            />
          )}
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-texto text-base font-medium uppercase text-accent">
            {t.purchases.historyTitle}
          </h2>

          {contributions.length === 0 ? (
            <EmptyState title={t.purchases.emptyTitle} body={t.purchases.emptyBody} />
          ) : (
            <ul className="flex flex-col">
              {contributions.map((contribution) => (
                <li
                  key={contribution.id}
                  className="grid grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-1 border-b border-hairline py-3 sm:grid-cols-[8rem_1fr_auto_7rem]"
                >
                  <time
                    dateTime={contribution.createdAt}
                    className="order-2 text-base text-ink-faint sm:order-1"
                  >
                    {formatDate(contribution.createdAt, locale)}
                  </time>
                  <span className="order-1 text-base text-ink sm:order-2">
                    {contribution.description ?? t.purchases.types[contribution.kind]}
                  </span>
                  <span className="order-3 text-base font-medium text-accent">
                    {formatMoney(contribution.amount, contribution.currency, locale)}
                  </span>
                  <span className="order-4 text-base text-ink-muted sm:text-right">
                    {t.purchases.status[contribution.status]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </Container>
    </Section>
  );
}
