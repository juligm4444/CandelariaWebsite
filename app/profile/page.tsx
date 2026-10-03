import type { Metadata } from 'next';
import Image from 'next/image';

import { SignOutButton } from '@/components/auth/sign-out-button';
import { ProfileForm } from '@/components/profile/profile-form';
import { Container, Section } from '@/components/ui/layout';
import { Panel, Pill } from '@/components/ui/surface';
import { areaByKey } from '@/content/areas';
import { CURRENCY } from '@/content/catalog';
import { requireUser } from '@/lib/auth/session';
import { getSupporterStats } from '@/lib/db/commerce';
import { fill } from '@/lib/i18n/dictionary';
import { getContent } from '@/lib/i18n/server';
import { initials, mediaUrl } from '@/lib/media';
import { formatMoney } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Perfil',
  robots: { index: false, follow: false },
};

/** Thresholds mirror compute_supporter_tier in the database migration. */
const TIER_FLOORS = {
  visitor: 0,
  supporter: 1,
  bronze: 2_000_000,
  silver: 6_000_000,
  gold: 15_000_000,
  core: 30_000_000,
} as const;

const TIER_ORDER = ['visitor', 'supporter', 'bronze', 'silver', 'gold', 'core'] as const;

export default async function ProfilePage() {
  const user = await requireUser('/profile');
  const { locale, t } = await getContent();
  const stats = await getSupporterStats(user.id).catch(() => ({
    totalContributed: 0,
    monthsSubscribed: 0,
    score: 0,
    tier: 'visitor' as const,
  }));

  const area = user.areaKey ? areaByKey.get(user.areaKey) : undefined;
  const photo = mediaUrl(user.imagePath);

  const currentIndex = TIER_ORDER.indexOf(stats.tier);
  const nextTier = TIER_ORDER[currentIndex + 1] ?? null;
  const floor = TIER_FLOORS[stats.tier];
  const ceiling = nextTier ? TIER_FLOORS[nextTier] : floor;
  const percent = nextTier
    ? Math.min(100, Math.max(0, Math.round(((stats.score - floor) / (ceiling - floor)) * 100)))
    : 100;

  return (
    <Section space="tight">
      <Container className="flex flex-col gap-7">
        <header className="flex flex-wrap items-center gap-4">
          <div className="relative size-20 shrink-0 overflow-hidden rounded-card border border-hairline bg-surface">
            {photo ? (
              <Image src={photo} alt="" fill sizes="80px" className="object-cover" />
            ) : (
              <span
                aria-hidden
                className="flex size-full items-center justify-center font-titulo text-2xl font-bold text-accent"
              >
                {initials(user.name)}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <h1 className="text-balance-tight text-[2rem] md:text-[2.5rem]">{user.name}</h1>
            <div className="flex flex-wrap items-center gap-2">
              {area ? (
                <Pill tone="outline" style={{ borderColor: area.accent, color: area.label }}>
                  {area.name[locale]}
                  {user.internalRole ? ` · ${t.team.roles[user.internalRole]}` : null}
                </Pill>
              ) : (
                <Pill tone="outline">{t.profile.externalBadge}</Pill>
              )}
              <Pill tone="accent">{t.profile.supporter.tiers[stats.tier]}</Pill>
            </div>
          </div>
        </header>

        <div className="grid items-start gap-5 lg:grid-cols-[2fr_1fr]">
          <Panel className="flex flex-col gap-5">
            <h2 className="font-titulo text-2xl font-bold">{t.profile.sections.account}</h2>
            <ProfileForm user={user} locale={locale} t={t} />
          </Panel>

          <div className="flex flex-col gap-3">
            <Panel className="flex flex-col gap-3">
              <h2 className="font-titulo text-2xl font-bold">{t.profile.supporter.title}</h2>

              <dl className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between gap-3 border-b border-hairline pb-2">
                  <dt className="text-base text-ink-muted">{t.profile.supporter.tierLabel}</dt>
                  <dd className="text-base font-medium text-accent">
                    {t.profile.supporter.tiers[stats.tier]}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-3 border-b border-hairline pb-2">
                  <dt className="text-base text-ink-muted">{t.profile.supporter.totalLabel}</dt>
                  <dd className="text-base text-ink">
                    {formatMoney(stats.totalContributed, CURRENCY, locale)}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-base text-ink-muted">{t.profile.supporter.monthsLabel}</dt>
                  <dd className="text-base text-ink">{stats.monthsSubscribed}</dd>
                </div>
              </dl>

              {nextTier ? (
                <div className="flex flex-col gap-2">
                  <p className="text-base text-ink-muted">
                    {fill(t.profile.supporter.progress, {
                      percent,
                      tier: t.profile.supporter.tiers[nextTier],
                    })}
                  </p>
                  <div
                    role="progressbar"
                    aria-valuenow={percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={t.profile.supporter.title}
                    className="h-1 w-full overflow-hidden rounded-pill bg-hairline"
                  >
                    <span
                      className="block h-full bg-dorado-100"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-base text-accent">{t.profile.supporter.maxTier}</p>
              )}

              <p className="text-base text-ink-faint">{t.profile.supporter.explain}</p>
            </Panel>

            <Panel className="flex flex-col gap-3">
              <h2 className="font-titulo text-2xl font-bold">{t.profile.sections.danger}</h2>
              <SignOutButton label={t.nav.logout} />
            </Panel>
          </div>
        </div>
      </Container>
    </Section>
  );
}
