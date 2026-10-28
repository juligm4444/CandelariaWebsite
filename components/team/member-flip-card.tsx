'use client';

import {
  IconBrandGithub,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconRotate,
  IconWorld,
} from '@tabler/icons-react';
import Image from 'next/image';
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  type MotionValue,
} from 'motion/react';
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type RefObject,
} from 'react';

import type { SocialKey } from '@/lib/social';
import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/lib/use-reduced-motion';

import type { CardArea, CardLabels, CardMember } from './types';

/**
 * Member card in the brand's ID-card proportion (324 x 512, manual §8),
 * with the behaviour of Originkit's "Flip Gallery":
 *
 * - it tilts under the pointer with the "repel" effect (the side under the
 *   cursor tips away), springs back on leave, and a glare of light follows
 *   the pointer across the face;
 * - a click flips it: on the left half it turns backward, on the right half
 *   forward, so the rotation keeps accumulating in the direction clicked.
 *
 * On hover a line of light in the area colour also runs round the edge.
 *
 * Front: photo, full name, role, and the lead badge only for leaders and
 * co-leaders. Back: only the member's links, as icons that glow on hover and
 * open in a new tab without flipping the card.
 *
 * Keyboard: each face carries a real button that flips the card, and the face
 * turned away is `inert`, so focus never lands on something invisible. With a
 * mouse the button stays hidden (click either half instead) until it receives
 * keyboard focus; on touch screens it stays visible as the tap target.
 * Reduced motion: no tilt, and the flip becomes a short crossfade.
 */

const HALF_TURN = 180;
const PERSPECTIVE = 900;
const TILT_LIMIT = 10;
const HOVER_SCALE = 1.04;
const FLIP_EASE = [0.77, 0, 0.175, 1] as const;

const SOCIAL_ICON: Record<SocialKey, typeof IconWorld> = {
  linkedinUrl: IconBrandLinkedin,
  githubUrl: IconBrandGithub,
  instagramUrl: IconBrandInstagram,
  websiteUrl: IconWorld,
};
/** Slot order of the 2 x 2 square on the back face. */
const SOCIAL_KEYS = Object.keys(SOCIAL_ICON) as SocialKey[];

function Glare({ background, opacity }: { background: MotionValue<string>; opacity: MotionValue<number> }) {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-20 rounded-card"
      style={{ background, opacity }}
    />
  );
}

/** A line of light that runs round the card's edge while it is hovered (.cdl-trace). */
function Trace({ rgb }: { rgb: string }) {
  return <span aria-hidden className="cdl-trace" style={{ '--trace-rgb': rgb } as CSSProperties} />;
}

function FlipButton({
  label,
  onFlip,
  buttonRef,
  tabIndex,
}: {
  label: string;
  onFlip: () => void;
  buttonRef: RefObject<HTMLButtonElement | null>;
  tabIndex?: number;
}) {
  return (
    <button
      ref={buttonRef}
      tabIndex={tabIndex}
      type="button"
      aria-label={label}
      title={label}
      onClick={(event) => {
        event.stopPropagation();
        onFlip();
      }}
      className="cdl-glow absolute right-3 top-3 z-30 inline-flex size-12 items-center justify-center rounded-pill border border-neutro-100/24 bg-morado-300/55 text-neutro-100 backdrop-blur-sm hover:border-dorado-100 hover:text-dorado-100 pointer-fine:pointer-events-none pointer-fine:opacity-0 pointer-fine:focus-visible:pointer-events-auto pointer-fine:focus-visible:opacity-100"
    >
      <IconRotate className="icon-brand size-5" aria-hidden />
    </button>
  );
}

function Face({
  hidden,
  back,
  reduce,
  children,
  className,
}: {
  hidden: boolean;
  back?: boolean;
  reduce: boolean;
  children: ReactNode;
  className?: string;
}) {
  const style: CSSProperties = reduce
    ? { opacity: hidden ? 0 : 1, transition: 'opacity 200ms ease' }
    : {
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        transform: back ? 'rotateY(180deg)' : undefined,
      };
  return (
    <div
      inert={hidden}
      aria-hidden={hidden || undefined}
      className={cn('absolute inset-0 overflow-hidden rounded-card border', className)}
      style={style}
    >
      {children}
    </div>
  );
}

export function MemberFlipCard({
  member,
  area,
  labels,
  highlight = false,
  anchor = true,
  focusable = true,
  width,
}: {
  member: CardMember;
  area: CardArea;
  labels: CardLabels;
  /** Briefly lit when the card is the target of a deep link. */
  highlight?: boolean;
  /** Carries the `#integrante-<id>` anchor. Off for repeated copies. */
  anchor?: boolean;
  /** False for decorative copies: they still flip under the pointer but stay out of the tab order. */
  focusable?: boolean;
  /** Card width in px; the height follows the 324 x 512 proportion. */
  width?: number;
}) {
  const reduce = Boolean(usePrefersReducedMotion());
  const [angle, setAngle] = useState(0);
  const showingBack = Math.abs(Math.round(angle / HALF_TURN)) % 2 === 1;

  // Tilt and glare live in motion values: pointer moves never re-render.
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const lift = useMotionValue(1);
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(30);
  const glareLevel = useMotionValue(0);
  const spring = { stiffness: 220, damping: 22, mass: 0.6 };
  const tiltX = useSpring(rotateX, spring);
  const tiltY = useSpring(rotateY, spring);
  const scale = useSpring(lift, spring);
  const glareOpacity = useSpring(glareLevel, { stiffness: 160, damping: 26 });
  const glare = useMotionTemplate`radial-gradient(380px circle at ${glareX}% ${glareY}%, rgba(255, 241, 214, 0.26), rgba(255, 185, 56, 0.08) 38%, transparent 62%)`;

  const flip = (direction: 1 | -1) => setAngle((current) => current + direction * HALF_TURN);

  // Flipping with the button hides the button that had focus (its face turns away and
  // becomes inert), so focus moves to the matching button on the face that
  // is now showing.
  const frontButton = useRef<HTMLButtonElement>(null);
  const backButton = useRef<HTMLButtonElement>(null);
  const refocus = useRef(false);
  const flipFromButton = (direction: 1 | -1) => {
    refocus.current = true;
    flip(direction);
  };
  useEffect(() => {
    if (!refocus.current) return;
    refocus.current = false;
    (showingBack ? backButton : frontButton).current?.focus({ preventScroll: true });
  }, [showingBack]);

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reduce || event.pointerType !== 'mouse') return;
    const box = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - box.left) / box.width;
    const py = (event.clientY - box.top) / box.height;
    // "Repel": the side under the pointer tips away from it.
    rotateX.set(-(py - 0.5) * TILT_LIMIT * 2);
    rotateY.set((px - 0.5) * TILT_LIMIT * 2);
    lift.set(HOVER_SCALE);
    glareX.set(px * 100);
    glareY.set(py * 100);
    glareLevel.set(1);
  };

  const onPointerLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    lift.set(1);
    glareLevel.set(0);
  };

  const onClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.defaultPrevented) return;
    const box = event.currentTarget.getBoundingClientRect();
    flip(event.clientX - box.left < box.width / 2 ? -1 : 1);
  };

  const label = (template: string) => template.replace('{{name}}', member.name);
  const lead = member.position;
  const links = new Map(member.links.map(({ key, href }) => [key, href]));

  return (
    <div
      id={anchor ? `integrante-${member.id}` : undefined}
      className="w-[17rem] shrink-0 scroll-mt-32"
      style={{ perspective: `${PERSPECTIVE}px`, width }}
    >
      <motion.div
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onClick={onClick}
        style={{ rotateX: tiltX, rotateY: tiltY, scale, transformStyle: 'preserve-3d' }}
        className={cn(
          'cdl-card relative aspect-[324/512] w-full cursor-pointer select-none rounded-card',
          highlight && 'cdl-card-highlight',
        )}
      >
        <motion.div
          animate={reduce ? undefined : { rotateY: angle }}
          transition={{ duration: 0.72, ease: FLIP_EASE }}
          style={{ transformStyle: 'preserve-3d' }}
          className="relative size-full"
        >
          {/* Front: photo, name, role, lead badge. */}
          <Face hidden={showingBack} reduce={reduce} className="border-hairline bg-surface">
            <FlipButton
              label={label(labels.showBack)}
              onFlip={() => flipFromButton(1)}
              buttonRef={frontButton}
              tabIndex={focusable ? undefined : -1}
            />
            <div className="relative h-[64%] overflow-hidden bg-surface-raised">
              {member.photo ? (
                <Image
                  src={member.photo}
                  alt={member.name}
                  fill
                  sizes="272px"
                  draggable={false}
                  className="object-cover"
                />
              ) : (
                <div
                  aria-hidden
                  className="flex size-full items-center justify-center"
                  style={{
                    background: `radial-gradient(70% 60% at 50% 35%, rgb(${area.rgb} / 0.28), transparent 75%)`,
                  }}
                >
                  <span className="font-titulo text-[4rem] font-bold" style={{ color: area.label }}>
                    {member.initials}
                  </span>
                </div>
              )}
              <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-surface to-transparent" />
            </div>

            <div className="flex flex-col gap-1 px-3 pb-4 pt-1">
              {lead ? (
                <span
                  className={cn(
                    'mb-1 self-start rounded-pill px-2 py-0.5 text-base font-medium',
                    lead === 'leader' ? 'bg-dorado-100 text-morado-300' : 'border border-dorado-100 text-dorado-100',
                  )}
                >
                  {lead === 'leader' ? labels.leader : labels.coleader}
                </span>
              ) : null}
              <h3 className="line-clamp-2 font-titulo text-2xl leading-tight font-bold text-ink">{member.name}</h3>
              {member.role ? <p className="line-clamp-2 text-base text-ink-muted">{member.role}</p> : null}
            </div>

            <span aria-hidden className="absolute inset-x-0 bottom-0 h-1.5" style={{ backgroundColor: area.accent }} />
            <Trace rgb={area.rgb} />
            <Glare background={glare} opacity={glareOpacity} />
          </Face>

          {/* Back: the member's links as icons, nothing else. The four marks
              always sit in the same 2 x 2 square, each in its own slot: the
              ones the member has are live links, the rest are dimmed, so the
              layout never changes with how many links someone has and a
              member with none never reads as broken. Names for assistive tech
              stay in the labels. */}
          <Face hidden={!showingBack} back reduce={reduce} className="border-hairline-strong bg-morado-200">
            <FlipButton
              label={label(labels.showFront)}
              onFlip={() => flipFromButton(-1)}
              buttonRef={backButton}
              tabIndex={focusable ? undefined : -1}
            />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{ background: `radial-gradient(90% 60% at 50% 45%, rgb(${area.rgb} / 0.34), transparent 72%)` }}
            />
            <h3 className="sr-only">{`${labels.linksTitle}: ${member.name}`}</h3>
            <div className="relative flex h-full items-center justify-center p-4">
              <ul className="grid grid-cols-2 gap-3">
                {SOCIAL_KEYS.map((key) => {
                  const Icon = SOCIAL_ICON[key];
                  const href = links.get(key);
                  if (!href) {
                    return (
                      <li
                        key={key}
                        aria-hidden
                        className="inline-flex size-16 items-center justify-center rounded-pill border border-dashed border-neutro-100/40 text-neutro-100 opacity-25"
                      >
                        <Icon className="icon-brand size-8" />
                      </li>
                    );
                  }
                  const name = `${labels.social[key]}: ${member.name} (${labels.newTab})`;
                  return (
                    <li key={key}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        tabIndex={focusable ? undefined : -1}
                        aria-label={name}
                        title={labels.social[key]}
                        onClick={(event) => event.stopPropagation()}
                        className="cdl-glow inline-flex size-16 items-center justify-center rounded-pill border border-neutro-100/24 bg-morado-300/40 text-neutro-100 hover:border-dorado-100 hover:text-dorado-100"
                      >
                        <Icon className="icon-brand size-8" aria-hidden />
                      </a>
                    </li>
                  );
                })}
              </ul>
              {member.links.length === 0 ? <p className="sr-only">{labels.noLinks}</p> : null}
            </div>
            <span aria-hidden className="absolute inset-x-0 bottom-0 h-1.5" style={{ backgroundColor: area.accent }} />
            <Trace rgb={area.rgb} />
            <Glare background={glare} opacity={glareOpacity} />
          </Face>
        </motion.div>
      </motion.div>
    </div>
  );
}
