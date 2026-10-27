import Image from 'next/image';

import { Isotipo } from '@/components/brand/lockup';
import { Reveal } from '@/components/motion/reveal';
import { Container, Section, SectionHeader } from '@/components/ui/layout';
import { areas } from '@/content/areas';
import type { Dictionary } from '@/content/es';
import type { Locale } from '@/lib/i18n/config';

/**
 * How the brand was built: why a condor, the three attributes of the mark,
 * the palette with its proportions, the area system and the two typefaces.
 *
 * Everything is drawn inline (SVG and CSS), so the section costs no extra
 * requests beyond the brand's own marks. The glyphs move only without a
 * reduced-motion preference; see "Brand identity graphics" in globals.css.
 * The marks themselves are never animated, recoloured or given effects
 * (manual §2.6): the orbit is a separate drawing outside the protection area.
 */

type Identity = Dictionary['about']['identity'];

/** Ciclo: an arc and a sun travelling around a closed circle. */
function CycleGlyph() {
  return (
    <svg viewBox="0 0 96 96" className="size-24" fill="none" aria-hidden>
      <circle cx="48" cy="48" r="34" stroke="var(--cdl-border)" strokeWidth="2" />
      <g className="cdl-spin">
        <circle
          cx="48"
          cy="48"
          r="34"
          stroke="var(--color-dorado-100)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="120 94"
        />
        <circle cx="82" cy="48" r="5" fill="var(--color-dorado-100)" />
      </g>
    </svg>
  );
}

/** Facetas: a hexagon split into six facets that light up in turn, like cells. */
function FacetGlyph() {
  const points = Array.from({ length: 6 }, (_, index) => {
    const angle = (Math.PI / 3) * index - Math.PI / 2;
    return [48 + 36 * Math.cos(angle), 48 + 36 * Math.sin(angle)] as const;
  });
  return (
    <svg viewBox="0 0 96 96" className="size-24" fill="none" aria-hidden>
      {points.map(([x, y], index) => {
        const [nx, ny] = points[(index + 1) % points.length]!;
        const d = `M48 48 L${x.toFixed(2)} ${y.toFixed(2)} L${nx.toFixed(2)} ${ny.toFixed(2)} Z`;
        return (
          <g key={index}>
            <path
              d={d}
              fill="var(--color-violeta-300)"
              className="cdl-glyph-facet"
              style={{ '--i': index, opacity: 0.3 } as React.CSSProperties}
            />
            <path d={d} stroke="var(--color-lavanda-100)" strokeWidth="2" strokeLinejoin="round" />
          </g>
        );
      })}
    </svg>
  );
}

/** Dirección: chevrons running forward. */
function DirectionGlyph() {
  return (
    <svg viewBox="0 0 96 96" className="size-24" fill="none" aria-hidden>
      <path d="M12 48 H84" stroke="var(--cdl-border)" strokeWidth="2" strokeLinecap="round" />
      {[24, 44, 64].map((x, index) => (
        <path
          key={x}
          d={`M${x} 32 L${x + 14} 48 L${x} 64`}
          stroke="var(--color-dorado-100)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="cdl-glyph-arrow"
          style={{ '--i': index } as React.CSSProperties}
        />
      ))}
    </svg>
  );
}

const GLYPHS = [CycleGlyph, FacetGlyph, DirectionGlyph];

export function BrandIdentity({ copy, locale }: { copy: Identity; locale: Locale }) {
  return (
    <Section labelledBy="identidad" className="overflow-hidden">
      <Container className="flex flex-col gap-9">
        <SectionHeader id="identidad" eyebrow={copy.eyebrow} title={copy.title} lead={copy.lead} />

        {/* Why a condor: the mark inside an orbit, the reason beside it. */}
        <div className="grid items-center gap-7 lg:grid-cols-[5fr_7fr] lg:gap-9">
          <Reveal className="relative mx-auto flex aspect-square w-full max-w-[26rem] items-center justify-center">
            <div
              aria-hidden
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  'radial-gradient(closest-side, rgb(255 185 56 / 0.16), rgb(62 16 87 / 0.5) 60%, transparent 100%)',
              }}
            />
            <svg viewBox="0 0 400 400" className="absolute inset-0 size-full" fill="none" aria-hidden>
              <circle cx="200" cy="200" r="190" stroke="var(--cdl-border)" strokeWidth="1" />
              <circle cx="200" cy="200" r="150" stroke="var(--cdl-border)" strokeWidth="1" strokeDasharray="2 8" />
              <g className="cdl-spin cdl-spin-slow">
                <circle
                  cx="200"
                  cy="200"
                  r="190"
                  stroke="var(--color-dorado-100)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="220 974"
                />
                <circle cx="390" cy="200" r="6" fill="var(--color-dorado-100)" />
              </g>
            </svg>
            <Isotipo size={176} alt={copy.condor.title} className="relative" />
          </Reveal>

          <div className="flex flex-col gap-4">
            <h3 className="font-titulo text-[2rem] font-bold md:text-[2.5rem]">{copy.condor.title}</h3>
            {copy.condor.paragraphs.map((paragraph) => (
              <p key={paragraph} className="max-w-[60ch] text-base text-ink-muted md:text-[1.5rem] md:leading-[1.45]">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* The three attributes, each with its own drawn glyph. */}
        <ul className="grid gap-px overflow-hidden rounded-block border border-hairline bg-hairline md:grid-cols-3">
          {copy.attributes.map((attribute, index) => {
            const Glyph = GLYPHS[index] ?? CycleGlyph;
            return (
              <li
                key={attribute.title}
                data-light=""
                className="cdl-light flex flex-col gap-4 bg-canvas p-4 [--cdl-light-alpha:0.12] md:p-5"
              >
                <Glyph />
                <h3 className="font-titulo text-2xl font-bold text-accent">{attribute.title}</h3>
                <p className="text-base text-ink-muted">{attribute.body}</p>
              </li>
            );
          })}
        </ul>

        {/* Palette with its weights, then one condor per area. */}
        <div className="grid gap-7 lg:grid-cols-[7fr_5fr] lg:gap-9">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <h3 className="font-titulo text-2xl font-bold md:text-[2rem]">{copy.palette.title}</h3>
              <p className="max-w-[60ch] text-base text-ink-muted">{copy.palette.lead}</p>
            </div>

            {/* The deep purple slice is the page colour itself, so every
                slice carries its share and the frame shows where it starts. */}
            <div aria-hidden className="cdl-grow flex h-16 overflow-hidden rounded-card border border-hairline-strong md:h-24">
              {copy.palette.swatches.map((swatch, index) => (
                <span
                  key={swatch.hex}
                  className="flex h-full items-end border-r border-morado-300/30 p-2 font-titulo text-base font-bold tabular-nums last:border-r-0 md:p-3"
                  style={{
                    width: `${swatch.share}%`,
                    backgroundColor: swatch.hex,
                    color: index === 0 ? 'var(--color-neutro-100)' : 'var(--color-morado-300)',
                    backgroundImage:
                      index === 0
                        ? 'repeating-linear-gradient(135deg, rgb(239 238 234 / 0.06) 0 2px, transparent 2px 10px)'
                        : undefined,
                  }}
                >
                  {swatch.share >= 15 ? `${swatch.share}%` : null}
                </span>
              ))}
            </div>

            <dl className="grid gap-px overflow-hidden rounded-card border border-hairline bg-hairline sm:grid-cols-2">
              {copy.palette.swatches.map((swatch, index, all) => (
                <div
                  key={swatch.hex}
                  data-light=""
                  className={
                    'cdl-light flex items-start gap-3 bg-canvas p-3 [--cdl-light-alpha:0.1]' +
                    (index === all.length - 1 && all.length % 2 === 1 ? ' sm:col-span-2' : '')
                  }
                >
                  <span
                    aria-hidden
                    className="mt-1 size-8 shrink-0 rounded-full border border-hairline-strong"
                    style={{ backgroundColor: swatch.hex }}
                  />
                  <div className="flex flex-col gap-1">
                    <dt className="flex flex-wrap items-baseline gap-x-2 text-base font-medium text-ink">
                      {swatch.name}
                      <span className="font-normal text-ink-faint tabular-nums">
                        {swatch.hex} · {swatch.share}%
                      </span>
                    </dt>
                    <dd className="text-base text-ink-muted">{swatch.role}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <h3 className="font-titulo text-2xl font-bold md:text-[2rem]">{copy.palette.areasTitle}</h3>
              <p className="max-w-[48ch] text-base text-ink-muted">{copy.palette.areasBody}</p>
            </div>
            {/* Seven marks on three columns: the seventh sits in the middle. */}
            <ul className="grid grid-cols-3 gap-2">
              {areas.map((area) => (
                <li
                  key={area.key}
                  data-light=""
                  className="cdl-light flex flex-col items-center gap-2 rounded-card border border-hairline bg-canvas px-2 py-3 text-center last:col-start-2"
                  style={{ '--cdl-light-rgb': area.rgb, '--cdl-light-alpha': '0.22' } as React.CSSProperties}
                >
                  <Image src={area.isotipo} alt="" width={56} height={56} sizes="56px" className="size-14" />
                  <span className="text-base" style={{ color: area.label }}>
                    {area.name[locale]}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Type: one specimen per voice. */}
        <div className="flex flex-col gap-5">
          <h3 className="font-titulo text-2xl font-bold md:text-[2rem]">{copy.type.title}</h3>
          <div className="grid gap-px overflow-hidden rounded-block border border-hairline bg-hairline md:grid-cols-2">
            <div className="flex flex-col gap-4 bg-surface p-4 md:p-5">
              <p aria-hidden className="font-titulo text-[5rem] leading-none font-bold text-accent md:text-[7.5rem]">
                Aa
              </p>
              <p className="font-titulo text-2xl font-bold text-ink md:text-[2rem]">Sansation</p>
              <p className="text-base text-ink-muted">{copy.type.display}</p>
              <p aria-hidden className="font-titulo text-2xl text-ink-faint">{copy.type.sample}</p>
            </div>
            <div className="flex flex-col gap-4 bg-surface p-4 md:p-5">
              <p aria-hidden className="font-texto text-[5rem] leading-none font-light text-lavanda-100 md:text-[7.5rem]">
                Aa
              </p>
              <p className="font-texto text-2xl font-medium text-ink md:text-[2rem]">Helvetica Now</p>
              <p className="text-base text-ink-muted">{copy.type.text}</p>
              <p aria-hidden className="font-texto text-2xl font-light text-ink-faint">{copy.type.sample}</p>
            </div>
          </div>
        </div>

        <p className="max-w-[72ch] text-base text-ink-faint">{copy.note}</p>
      </Container>
    </Section>
  );
}
