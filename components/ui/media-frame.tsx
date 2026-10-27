import Image from 'next/image';

import type { MediaSlot } from '@/content/media';
import type { Locale } from '@/lib/i18n/config';
import { cn } from '@/lib/utils';

/**
 * A photograph the team supplies through `content/media.ts`, or, until it
 * does, a framed placeholder in brand colours: a fine grid, a halo and a
 * short note. Never a stock or generated photo standing in for real people.
 */
export function MediaFrame({
  slot,
  locale,
  pendingLabel,
  sizes,
  priority = false,
  rgb = '255 185 56',
  className,
}: {
  slot: MediaSlot;
  locale: Locale;
  /** Shown on the placeholder, e.g. "Foto del equipo · próximamente". */
  pendingLabel: string;
  sizes: string;
  priority?: boolean;
  /** Halo colour of the placeholder, as an "r g b" triplet. */
  rgb?: string;
  className?: string;
}) {
  return (
    <div className={cn('relative overflow-hidden rounded-block border border-hairline bg-surface', className)}>
      {slot.src ? (
        <Image
          src={slot.src}
          alt={slot.alt[locale]}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      ) : (
        <div role="img" aria-label={pendingLabel} className="absolute inset-0">
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background: `radial-gradient(60% 70% at 70% 30%, rgb(${rgb} / 0.22), transparent 70%), radial-gradient(50% 60% at 15% 90%, rgb(166 52 218 / 0.18), transparent 70%)`,
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0 opacity-40 [mask-image:radial-gradient(80%_80%_at_50%_50%,black,transparent)]"
            style={{
              backgroundImage:
                'linear-gradient(var(--cdl-border) 1px, transparent 1px), linear-gradient(90deg, var(--cdl-border) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          <div aria-hidden className="absolute inset-3 rounded-card border border-dashed border-hairline-strong" />
          <p
            aria-hidden
            className="absolute bottom-5 left-5 max-w-[calc(100%-2.5rem)] rounded-card bg-morado-300/70 px-3 py-1 text-base text-neutro-100/80 backdrop-blur-sm"
          >
            {pendingLabel}
          </p>
        </div>
      )}
    </div>
  );
}
