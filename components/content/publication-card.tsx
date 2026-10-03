import Image from 'next/image';
import Link from 'next/link';

import { areaByKey } from '@/content/areas';
import type { Publication } from '@/lib/db/publications';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionary';
import { mediaUrl } from '@/lib/media';
import { formatDate } from '@/lib/utils';

/**
 * Publication card. Editorial rather than boxed: the cover sits above a
 * hairline, and the area label carries the area colour as its only accent.
 */
export function PublicationCard({
  publication,
  locale,
  t,
  priority,
}: {
  publication: Publication;
  locale: Locale;
  t: Dictionary;
  priority?: boolean;
}) {
  const area = areaByKey.get(publication.areaKey);
  const cover = mediaUrl(publication.coverPath);

  return (
    <article className="group flex h-full flex-col">
      <Link
        href={`/publications/${publication.slug}`}
        className="flex h-full flex-col gap-3 rounded-block p-1"
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-card border border-hairline bg-surface">
          {cover ? (
            <Image
              src={cover}
              alt=""
              fill
              priority={priority}
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-500 ease-brand group-hover:scale-[1.03]"
            />
          ) : (
            <div className="halo-brand size-full" aria-hidden />
          )}
        </div>

        <div className="flex items-baseline gap-3">
          {area ? (
            <span className="text-base font-medium uppercase" style={{ color: area.label }}>
              {area.name[locale]}
            </span>
          ) : null}
          <time dateTime={publication.publishedAt} className="text-base text-ink-faint">
            {formatDate(publication.publishedAt, locale)}
          </time>
        </div>

        <h3 className="font-titulo text-2xl font-bold leading-tight transition-colors duration-200 ease-brand group-hover:text-accent">
          {publication.title}
        </h3>

        <p className="line-clamp-3 text-base text-ink-muted">{publication.abstract}</p>

        {publication.authorName ? (
          <p className="mt-auto pt-2 text-base text-ink-faint">
            {t.publications.card.by} {publication.authorName}
          </p>
        ) : null}
      </Link>
    </article>
  );
}
