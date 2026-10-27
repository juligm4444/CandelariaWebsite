import { IconCheck } from '@tabler/icons-react';
import type { Metadata } from 'next';

import { MembershipButton } from '@/components/commerce/membership-button';
import { SponsorshipForm } from '@/components/contact/sponsorship-form';
import { AllocationChart } from '@/components/support/allocation-chart';
import { EnergyFlow } from '@/components/support/energy-flow';
import { Reveal } from '@/components/motion/reveal';
import { ButtonLink } from '@/components/ui/button';
import { Container, Section, SectionHeader } from '@/components/ui/layout';
import { Panel, Pill } from '@/components/ui/surface';
import { CURRENCY, membershipTiers } from '@/content/catalog';
import { getCurrentUser } from '@/lib/auth/session';
import { getActiveMembership } from '@/lib/db/commerce';
import { getContent } from '@/lib/i18n/server';
import { cn, formatMoney } from '@/lib/utils';
import { pageMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = pageMetadata({
  title: 'Apoyo',
  description:
    'Membresías de Candelaria Solar Car. Cada aporte recurrente se traduce en componentes y horas de prueba.',
  path: '/support',
});

/**
 * PROVISIONAL planning split, in the same order as
 * `t.support.allocation.items`. Replaced by the Logistics term report; the
 * page labels it as provisional until then.
 */
const ALLOCATION_SHARE = [45, 35, 20];
const ALLOCATION_COLORS = [
  'var(--color-dorado-100)',
  'var(--color-violeta-300)',
  'var(--color-lavanda-300)',
];

export default async function SupportPage() {
  const { locale, t } = await getContent();
  const user = await getCurrentUser().catch(() => null);
  const membership = user ? await getActiveMembership(user.id).catch(() => null) : null;

  const slices = t.support.allocation.items.map((item, index) => ({
    ...item,
    share: ALLOCATION_SHARE[index] ?? 0,
    color: ALLOCATION_COLORS[index] ?? 'var(--color-lavanda-300)',
  }));

  return (
    <>
      {/* Hero: the claim and the two ways in, beside the sun feeding the
          three destinations of the money. */}
      <Section space="tight" className="overflow-hidden">
        <div aria-hidden className="halo-brand pointer-events-none absolute inset-0 opacity-70" />
        <Container className="relative grid items-center gap-7 py-5 lg:grid-cols-[6fr_6fr]">
          <div className="flex flex-col items-start gap-4">
            <h1 data-intro="" className="max-w-[18ch] text-balance-tight text-[2.5rem] md:text-[3.5rem]">
              {t.support.hero.title}
            </h1>
            <p
              data-intro=""
              style={{ '--i': 1 } as React.CSSProperties}
              className="max-w-[52ch] text-base text-ink-muted md:text-[1.5rem] md:leading-[1.45]"
            >
              {t.support.hero.lead}
            </p>
            <div data-intro="" style={{ '--i': 2 } as React.CSSProperties} className="flex flex-wrap gap-2 pt-2">
              <ButtonLink href="#membresias" variant="accent" size="lg" magnetic>
                {t.support.hero.primary}
              </ButtonLink>
              <ButtonLink href="#patrocinio-bloque" variant="secondary" size="lg">
                {t.support.hero.secondary}
              </ButtonLink>
            </div>
          </div>
          <div data-intro="" style={{ '--i': 3 } as React.CSSProperties} className="flex justify-center lg:justify-end">
            <EnergyFlow destinations={slices} mark="*" />
          </div>
        </Container>
      </Section>

      {/* Where the money goes: the split as a donut beside its own legend.
          The legend is the accessible version; the chart is decorative. */}
      <Section surface="paper" labelledBy="destino">
        <Container className="flex flex-col gap-5">
          <SectionHeader id="destino" title={t.support.allocation.title} lead={t.support.allocation.lead} />
          <AllocationChart slices={slices} provisionalMark="*" centreLabel={t.support.allocation.centre} />
          <p className="max-w-[65ch] text-base text-ink-faint">
            * {t.support.allocation.provisional}. {t.support.allocation.provisionalNote}
          </p>
        </Container>
      </Section>

      {/* Memberships. */}
      <Section id="membresias" labelledBy="membresias-titulo" className="scroll-mt-20">
        <Container className="flex flex-col gap-7">
          <SectionHeader
            id="membresias-titulo"
            eyebrow={t.support.plans.eyebrow}
            title={t.support.plans.title}
            lead={t.support.plans.lead}
          />

          <ul className="grid gap-3 lg:grid-cols-3">
            {membershipTiers.map((tier, index) => {
              const current = membership?.tierId === tier.id;
              return (
                <li key={tier.id} className="h-full">
                  <Reveal delay={index * 0.06} className="h-full">
                    <div
                      className={cn(
                        'h-full rounded-block transition-[translate] duration-500 ease-out-ui hover:-translate-y-1 motion-reduce:hover:translate-y-0',
                        tier.recommended && 'cdl-beam p-0.5',
                      )}
                    >
                      <Panel
                        className={cn(
                          'flex h-full flex-col gap-4',
                          tier.recommended && 'border-transparent [--cdl-light-alpha:0.14]',
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-titulo text-[2rem] font-bold">{tier.name[locale]}</h3>
                          {tier.recommended ? (
                            <Pill tone="accent">{t.support.plans.recommended}</Pill>
                          ) : null}
                        </div>

                        <p className="text-base text-ink-faint">{tier.rationale[locale]}</p>

                        <p className="flex items-baseline gap-2">
                          <span className="font-titulo text-[2.5rem] font-bold text-accent">
                            {formatMoney(tier.monthlyPrice, CURRENCY, locale)}
                          </span>
                          <span className="text-base text-ink-muted">
                            {t.support.plans.perMonth}
                          </span>
                        </p>

                        <div className="flex flex-col gap-2">
                          <h4 className="text-base font-medium uppercase text-accent">
                            {t.support.plans.includes}
                          </h4>
                          <ul className="flex flex-col gap-2">
                            {tier.benefits[locale].map((benefit) => (
                              <li key={benefit} className="flex items-start gap-2 text-base text-ink-muted">
                                <IconCheck
                                  className="icon-brand mt-0.5 size-5 shrink-0 text-accent"
                                  aria-hidden
                                />
                                <span>{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="mt-auto pt-2">
                          {current ? (
                            <Pill tone="outline">{t.support.plans.ctaCurrent}</Pill>
                          ) : (
                            <MembershipButton
                              tierId={tier.id}
                              t={t}
                              recommended={tier.recommended}
                              authed={Boolean(user)}
                            />
                          )}
                        </div>
                      </Panel>
                    </div>
                  </Reveal>
                </li>
              );
            })}
          </ul>
        </Container>
      </Section>

      {/* Sponsorship: what a company gets on the left, the request form on
          a paper insert on the right. */}
      <Section
        id="patrocinio-bloque"
        surface="raised"
        labelledBy="patrocinio"
        className="scroll-mt-20"
      >
        <Container className="grid gap-7 lg:grid-cols-[5fr_7fr] lg:gap-9">
          <div className="flex flex-col gap-5">
            <SectionHeader
              id="patrocinio"
              title={t.support.contact.title}
              lead={t.support.contact.body}
            />
            <div className="flex flex-col gap-4">
              <h3 className="text-base font-medium uppercase text-accent">{t.support.sponsor.stepsTitle}</h3>
              <ol className="relative flex flex-col gap-5">
                <span aria-hidden className="absolute bottom-6 left-6 top-6 w-px bg-hairline" />
                <span
                  aria-hidden
                  className="cdl-grow-y absolute bottom-6 left-6 top-6 w-0.5 -translate-x-1/4 rounded-full bg-dorado-100"
                />
                {t.support.sponsor.steps.map((step, index) => (
                  <li key={step.title} className="relative grid grid-cols-[3rem_1fr] items-start gap-4">
                    <span className="relative z-10 inline-flex size-12 items-center justify-center rounded-full border border-dorado-100 bg-canvas font-titulo text-base font-bold text-accent tabular-nums">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <Reveal delay={index * 0.05} className="flex flex-col gap-1 pt-2">
                      <h4 className="font-titulo text-2xl font-bold">{step.title}</h4>
                      <p className="text-base text-ink-muted">{step.body}</p>
                    </Reveal>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* `.on-paper` paints its own canvas colour from unlayered CSS, so the
              white form surface is set inline to win over it. */}
          <div
            className="on-paper rounded-block border border-hairline p-4 md:p-7"
            style={{ backgroundColor: 'var(--cdl-surface)' }}
          >
            <h3 className="mb-4 font-titulo text-2xl font-bold">{t.support.sponsor.formTitle}</h3>
            <SponsorshipForm t={t} />
          </div>
        </Container>
      </Section>
    </>
  );
}
