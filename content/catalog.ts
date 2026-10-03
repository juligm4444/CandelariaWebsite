import type { Locale } from '@/lib/i18n/config';

/**
 * Membership catalogue.
 *
 * Prices are in minor units (COP has no decimals in practice, so 18000000 is
 * 180.000 COP). `polarProductId` is read from the environment at request time
 * because it differs between the Polar sandbox and production organisations,
 * and must never be hard-coded here.
 *
 * There used to be a merch store here too (sudadera, gorra, termo), sold as
 * one-off purchases through Polar. Polar is a merchant-of-record platform for
 * digital goods and does not accept physical merchandise: there is no
 * shipping-address collection, no fulfilment tracking, nothing to describe
 * around that limitation without misrepresenting the product to Polar, which
 * risks the account. The kit survives as a membership perk instead - the
 * `aluminio` tier below still promises "una pieza de equipación oficial al
 * año" - fulfilled by hand by the team, outside any checkout.
 *
 * There was also a one-off "aporte único" (free-form donation). Polar's
 * acceptable-use policy lists "donations, crowdfunding, community access,
 * advertising, and sponsorship" as a prohibited product category outright -
 * not a presentation problem like the merch one, an outright ban - so it is
 * gone rather than reworded. Only the three membership subscriptions remain.
 * If this needs to come back, it needs a separate payment channel outside
 * Polar, not a rebrand of the same product inside it.
 *
 * Every price and every Polar id in this file is a placeholder until the team
 * confirms them. See docs/MANUAL_SETUP.md, section 4.
 */

export const CURRENCY = 'COP';

export type MembershipTierId = 'cobre' | 'aluminio' | 'titanio';

export type MembershipTier = {
  id: MembershipTierId;
  /** Environment variable holding the Polar product id for this tier. */
  polarEnvKey: `POLAR_PRODUCT_${'COBRE' | 'ALUMINIO' | 'TITANIO'}`;
  monthlyPrice: number;
  recommended: boolean;
  name: Record<Locale, string>;
  /** One line explaining the material the tier is named after. */
  rationale: Record<Locale, string>;
  benefits: Record<Locale, string[]>;
};

export const membershipTiers: MembershipTier[] = [
  {
    id: 'cobre',
    polarEnvKey: 'POLAR_PRODUCT_COBRE',
    monthlyPrice: 500000,
    recommended: false,
    name: { es: 'Cobre', en: 'Copper' },
    rationale: {
      es: 'Por el cobre que lleva la energía de las celdas al motor: la primera conexión con el proyecto.',
      en: 'For the copper that carries energy from the cells to the motor: your first connection to the project.',
    },
    benefits: {
      es: [
        'Bitácora técnica por correo antes de que se publique en el sitio',
        'Tu nombre en el reporte semestral de Logística',
      ],
      en: [
        'Technical log by e-mail before it reaches the site',
        'Your name in the Logistics term report',
      ],
    },
  },
  {
    id: 'aluminio',
    polarEnvKey: 'POLAR_PRODUCT_ALUMINIO',
    monthlyPrice: 1500000,
    recommended: true,
    name: { es: 'Aluminio', en: 'Aluminium' },
    rationale: {
      es: 'Por el aluminio del chasis: estructura ligera que sostiene cada sistema del vehículo.',
      en: 'For the chassis aluminium: the light structure that holds every system of the vehicle together.',
    },
    benefits: {
      es: [
        'Todo lo del nivel Cobre',
        'Acceso a los datos de validación en bruto cuando un área cierra una medición',
        'Una pieza de equipación oficial al año, entregada en persona por el equipo',
      ],
      en: [
        'Everything in Copper',
        'Access to raw validation data when an area closes a measurement',
        'One piece of official kit per year, handed over in person by the team',
      ],
    },
  },
  {
    id: 'titanio',
    polarEnvKey: 'POLAR_PRODUCT_TITANIO',
    monthlyPrice: 5000000,
    recommended: false,
    name: { es: 'Titanio', en: 'Titanium' },
    rationale: {
      es: 'Por el titanio de las piezas críticas: la exigencia más alta que pide el vehículo.',
      en: 'For the titanium in the critical parts: the highest demand the vehicle makes.',
    },
    benefits: {
      es: [
        'Todo lo del nivel Aluminio',
        'Visita al taller con el área que elijas',
        'Reunión semestral con el Comité sobre el estado del proyecto',
      ],
      en: [
        'Everything in Aluminium',
        'A workshop visit with the area of your choice',
        'A termly meeting with the Committee on project status',
      ],
    },
  },
];

export const tierById = new Map(membershipTiers.map((tier) => [tier.id, tier]));
