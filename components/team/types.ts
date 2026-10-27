import type { AreaKey } from '@/content/areas';
import type { SocialKey } from '@/lib/social';

/**
 * Plain data the Team page hands to its client components. Everything is
 * resolved on the server (photo URL, career label, plural forms), so the
 * client bundle carries no dictionary and no database types.
 */

export type CardMember = {
  id: string;
  name: string;
  /** The member's own role in the area, free text ("rol"). */
  role: string | null;
  /** Only for leads ("cargo"): leader or co-leader. */
  position: 'leader' | 'coleader' | null;
  photo: string | null;
  initials: string;
  links: { key: SocialKey; href: string }[];
};

export type CardArea = {
  name: string;
  accent: string;
  label: string;
  rgb: string;
};

export type CardLabels = {
  leader: string;
  coleader: string;
  /** "{{name}}" is replaced. */
  showBack: string;
  showFront: string;
  linksTitle: string;
  noLinks: string;
  newTab: string;
  social: Record<SocialKey, string>;
};

export type RingLabels = {
  roleDescription: string;
  label: string;
  previous: string;
  next: string;
  pause: string;
  play: string;
  hintPointer: string;
  hintTouch: string;
};

export type ExplorerArea = CardArea & {
  key: AreaKey;
  brief: string;
  duties: string[];
  countLabel: string;
  members: CardMember[];
};

export type ExplorerLabels = {
  /** Under the logo ring: its group label and the hint for each kind of pointer. */
  ringHint: { label: string; pointer: string; touch: string };
  dutiesTitle: string;
  membersTitle: string;
  emptyTitle: string;
  emptyBody: string;
  previous: string;
  next: string;
  logLink: string;
  card: CardLabels;
  ring: Omit<RingLabels, 'label'>;
};
