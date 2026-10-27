import {
  IconBrandGithub,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconWorld,
} from '@tabler/icons-react';
import Image from 'next/image';

import { careerLabel } from '@/content/careers';
import type { Area } from '@/content/areas';
import type { Member, MemberLinks } from '@/lib/db/members';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionary';
import { initials, mediaUrl } from '@/lib/media';
import type { SocialKey } from '@/lib/social';
import { cn } from '@/lib/utils';

const SOCIAL_ICON: Record<SocialKey, typeof IconWorld> = {
  linkedinUrl: IconBrandLinkedin,
  githubUrl: IconBrandGithub,
  instagramUrl: IconBrandInstagram,
  websiteUrl: IconWorld,
};

/**
 * Public team card. No e-mail: the team page is unauthenticated.
 *
 * `featured` is the area lead's card: it spans two columns on wide screens and
 * puts the photo beside the text instead of above it, so the lead reads first
 * without a badge on top of an arbitrary photograph (a label over an image has
 * no contrast guarantee).
 *
 * Social links only render when the member filled them in, and every URL was
 * validated server-side before it was stored (lib/social.ts).
 */
export function MemberCard({
  member,
  links,
  area,
  locale,
  t,
  featured = false,
}: {
  member: Member;
  links: MemberLinks;
  area: Area;
  locale: Locale;
  t: Dictionary;
  featured?: boolean;
}) {
  const photo = mediaUrl(member.imagePath);
  const career = careerLabel(member.careerKey, locale);
  const lead = member.internalRole !== 'member';
  const role = lead ? t.team.roles[member.internalRole] : member.roleTitle;
  const socials = (Object.keys(SOCIAL_ICON) as SocialKey[]).filter((key) => links[key]);

  return (
    <article
      id={`integrante-${member.id}`}
      className={cn(
        'group relative flex h-full scroll-mt-28 flex-col overflow-hidden rounded-card border border-hairline bg-surface transition-colors duration-300 ease-brand hover:border-hairline-strong',
        featured && 'md:flex-row',
      )}
    >
      <div
        className={cn(
          'relative aspect-[4/5] w-full shrink-0 overflow-hidden bg-surface-raised',
          featured && 'md:aspect-auto md:w-[44%]',
        )}
      >
        {photo ? (
          <Image
            src={photo}
            alt={member.name}
            fill
            sizes={featured ? '(max-width: 768px) 100vw, 30vw' : '(max-width: 640px) 100vw, (max-width: 1280px) 45vw, 22vw'}
            className="object-cover transition-transform duration-500 ease-brand group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <span
            aria-hidden
            className="flex size-full items-center justify-center font-titulo text-[3rem] font-bold"
            style={{ color: area.label }}
          >
            {initials(member.name)}
          </span>
        )}
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-1"
          style={{ backgroundColor: area.accent }}
        />
      </div>

      <div className={cn('flex flex-1 flex-col gap-3 p-4', featured && 'md:p-5')}>
        <div className="flex flex-col gap-1">
          <h3
            className={cn(
              'font-titulo font-bold leading-tight text-balance-tight',
              featured ? 'text-2xl md:text-[2rem]' : 'text-2xl',
            )}
          >
            {member.name}
          </h3>
          {role ? (
            <p className="text-base font-medium" style={lead ? { color: area.label } : undefined}>
              {role}
            </p>
          ) : null}
          {career ? <p className="text-base text-ink-faint">{career}</p> : null}
        </div>

        {links.bio ? (
          <p className="max-w-[60ch] text-base text-ink-muted text-pretty">{links.bio}</p>
        ) : null}

        {socials.length > 0 ? (
          <ul className="mt-auto flex flex-wrap gap-1 pt-1" aria-label={t.team.socialTitle}>
            {socials.map((key) => {
              const Icon = SOCIAL_ICON[key];
              const label = `${t.profile.fields[key]}: ${member.name}`;
              return (
                <li key={key}>
                  <a
                    href={links[key] ?? undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={label}
                    className="inline-flex size-12 items-center justify-center rounded-pill border border-hairline text-ink-muted transition-colors duration-200 ease-brand hover:border-accent hover:text-accent"
                  >
                    <Icon className="icon-brand size-5" aria-hidden />
                  </a>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </article>
  );
}
