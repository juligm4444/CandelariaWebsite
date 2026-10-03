import Image from 'next/image';

import { cn } from '@/lib/utils';

/**
 * Brand marks.
 *
 * The repository only holds the isotipo bitmap, so the horizontal lockup below
 * is a provisional reconstruction: isotipo plus the wordmark set in Sansation,
 * at the fixed proportions of the official component. Replace it with the SVG
 * exported from Figma (`Logo/Lockup/Horizontal`) as soon as Design publishes it.
 * See docs/MANUAL_SETUP.md, section "Activos de marca pendientes".
 *
 * Protection area (manual §2.3): x = isotipo height / 4, kept free on all four
 * sides. That is why every mark here carries its own padding and no caller is
 * allowed to put a border or a button inside it.
 */

const ISOTIPO = '/brand/isotipo-institucional.webp';

export function Isotipo({
  size = 40,
  className,
  alt,
  priority,
}: {
  size?: number;
  className?: string;
  alt: string;
  priority?: boolean;
}) {
  return (
    <span
      className={cn('inline-block shrink-0', className)}
      style={{ padding: size / 4 }}
      data-protection-area="isotipo/4"
    >
      <Image
        src={ISOTIPO}
        width={size}
        height={size}
        alt={alt}
        priority={priority}
        sizes={`${size}px`}
        className="h-auto w-full"
      />
    </span>
  );
}

/**
 * Horizontal lockup. Minimum width 200px (manual §2.4), so `compact` only
 * drops the second line of the wordmark, never the mark itself.
 */
export function Lockup({
  size = 40,
  className,
  compact = false,
  priority = false,
}: {
  size?: number;
  className?: string;
  compact?: boolean;
  priority?: boolean;
}) {
  return (
    <span className={cn('inline-flex items-center', className)}>
      <Isotipo size={size} alt="" priority={priority} />
      <span className="flex flex-col justify-center leading-none">
        <span
          className="font-titulo font-bold text-ink"
          style={{ fontSize: size * 0.52, letterSpacing: 0 }}
        >
          CANDELARIA
        </span>
        {compact ? null : (
          <span
            className="font-titulo font-normal text-accent"
            style={{ fontSize: size * 0.3, letterSpacing: 0, marginTop: size * 0.08 }}
          >
            SOLAR CAR
          </span>
        )}
      </span>
    </span>
  );
}

/**
 * Area mark. Same condor in the area colour, always shown next to the area
 * name, which is what the manual requires for internal pieces (§3).
 */
export function AreaMark({
  src,
  name,
  size = 64,
  className,
}: {
  src: string;
  name: string;
  size?: number;
  className?: string;
}) {
  return (
    <span className={cn('inline-block shrink-0', className)} style={{ padding: size / 4 }}>
      <Image
        src={src}
        width={size}
        height={size}
        alt={`Isotipo del área de ${name}`}
        sizes={`${size}px`}
        className="h-auto w-full"
      />
    </span>
  );
}
