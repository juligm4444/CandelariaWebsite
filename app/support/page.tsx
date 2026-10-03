import { IconArrowRight, IconCheck } from '@tabler/icons-react';
import type { Metadata } from 'next';

import { MembershipButton } from '@/components/commerce/membership-button';
import { Reveal } from '@/components/motion/reveal';
import { ButtonLink } from '@/components/ui/button';
import { Container, Section, SectionHeader } from '@/components/ui/layout';
import { Panel, Pill } from '@/components/ui/surface';
import { CURRENCY, membershipTiers } from '@/content/catalog';
import { getCurrentUser } from '@/lib/auth/session';
import { getActiveMembership } from '@/lib/db/commerce';
import { getContent } from '@/lib/i18n/server';
import { cn, formatMoney } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Apoyo',
  description:
    'Membresías de Candelaria Solar Car. Cada aporte recurrente se traduce en componentes y horas de prueba.',
};

export default async function SupportPage() {
  const { locale, t } = await getContent();
  const user = await getCurrentUser().catch(() => null);
  const membership = user ? await getActiveMembership(user.id).catch(() => null) : null;

  return (
    <>
      <Section space="tight" className="overflow-hidden">
        <div aria-hidden className="halo-brand pointer-events-none absolute inset-0 opacity-70" />
        <Container className="relative flex flex-col items-start gap-4 py-5">
          <h1 className="max-w-[18ch] text-balance-tight text-[2.5rem] md:text-[3.5rem]">
            {t.support.hero.title}
          </h1>
          <p className="max-w-[52ch] text-base text-ink-muted md:text-[1.5rem] md:leading-[1.45]">
            {t.support.hero.lead}
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <ButtonLink href="#membresias" variant="accent" size="lg">
              {t.support.hero.primary}
            </ButtonLink>
          </div>
        </Container>
      </Section>

      {/* Where the money goes. Three items as a hairline-divided row, not three
          identical cards. */}
      <Section surface="paper" space="tight" labelledBy="destino">
        <Container className="flex flex-col gap-7">
          <SectionHeader
            id="destino"
            title={t.support.allocation.title}
            lead={t.support.allocation.lead}
          />
          <ul className="grid gap-5 md:grid-cols-3 md:gap-0">
            {t.support.allocation.items.map((item) => (
              <li
                key={item.title}
                className="flex flex-col gap-2 border-t border-hairline pt-4 md:border-l md:border-t-0 md:pl-5 md:pr-5 md:pt-0 md:first:border-l-0 md:first:pl-0"
              >
                <h3 className="font-titulo text-2xl font-bold">{item.title}</h3>
                <p className="text-base text-ink-muted">{item.body}</p>
              </li>
            ))}
          </ul>
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
                <li key={tier.id}>
                  <Reveal delay={index * 0.06}>
                    <Panel
                      className={cn(
                        'flex h-full flex-col gap-4',
                        tier.recommended && 'border-dorado-100',
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
                  </Reveal>
                </li>
              );
            })}
          </ul>
        </Container>
      </Section>

      <Section surface="paper" space="tight" labelledBy="patrocinio">
        <Container width="narrow" className="flex flex-col items-start gap-4">
          <SectionHeader
            id="patrocinio"
            title={t.support.contact.title}
            lead={t.support.contact.body}
          />
          <ButtonLink href="/contact?topic=comite" variant="primary" size="lg">
            {t.support.contact.cta}
            <IconArrowRight className="icon-brand size-5" aria-hidden />
          </ButtonLink>
        </Container>
      </Section>
    </>
  );
}
