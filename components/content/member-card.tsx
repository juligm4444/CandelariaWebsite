import Image from 'next/image';

import { careerLabel } from '@/content/careers';
import type { Area } from '@/content/areas';
import type { Member } from '@/lib/db/members';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionary';
import { initials, mediaUrl } from '@/lib/media';

/**
 * Member card. No e-mail: the team page is unauthenticated.
 *
 * A member with no photo gets their initials in the area tone, which reads as
 * a deliberate state rather than a missing asset, and avoids the generic
 * avatar glyph.
 *
 * The role is a line of text under the name, not a chip over the photograph:
 * a label on top of an arbitrary image has no contrast guarantee, and the
 * area colour as a filled chip does not clear AA for every area.
 */
export function MemberCard({
  member,
  area,
  locale,
  t,
}: {
  member: Member;
  area: Area;
  locale: Locale;
  t: Dictionary;
}) {
  const photo = mediaUrl(member.imagePath);
  const career = careerLabel(member.careerKey, locale);
  const lead = member.internalRole !== 'member';
  const role = lead ? t.team.roles[member.internalRole] : member.roleTitle;

  return (
    <article className="flex flex-col gap-2">
      <div className="relative aspect-square w-full overflow-hidden rounded-card border border-hairline bg-surface">
        {photo ? (
          <Image
            src={photo}
            alt=""
            fill
            sizes="(max-width: 768px) 45vw, 20vw"
            className="object-cover"
          />
        ) : (
          <span
            aria-hidden
            className="flex size-full items-center justify-center font-titulo text-[2rem] font-bold"
            style={{ color: area.label }}
          >
            {initials(member.name)}
          </span>
        )}
        {lead ? (
          <span
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-1"
            style={{ backgroundColor: area.accent }}
          />
        ) : null}
      </div>

      <h4 className="font-titulo text-base font-bold leading-tight">{member.name}</h4>
      {role ? (
        <p
          className="text-base leading-tight"
          style={lead ? { color: area.label } : undefined}
        >
          {role}
        </p>
      ) : null}
      {career ? <p className="text-base leading-tight text-ink-faint">{career}</p> : null}
    </article>
  );
}
