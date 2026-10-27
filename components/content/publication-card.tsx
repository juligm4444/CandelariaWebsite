import { IconDownload, IconUser, IconUsersGroup } from '@tabler/icons-react';
import Image from 'next/image';
import Link from 'next/link';

import { areaByKey } from '@/content/areas';
import type { Publication } from '@/lib/db/publications';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionary';
import { mediaUrl } from '@/lib/media';
import { formatDate } from '@/lib/utils';

/**
 * Publication card, on a paper insert so the log reads as a stack of
 * technical documents against the deep-purple canvas.
 *
 * The title link is stretched over the whole card with a pseudo-element, and
 * the two secondary actions (PDF, author on the Team page) sit above it with
 * their own focus targets. That keeps one primary link per card without
 * nesting interactive elements.
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
  const pdf = mediaUrl(publication.pdfPath);
  const teamHref = publication.authorId
    ? `/team?area=${publication.areaKey}#integrante-${publication.authorId}`
    : `/team?area=${publication.areaKey}`;

  return (
    <article
      data-light=""
      data-ripple=""
      className="on-paper cdl-light cdl-light-edge cdl-press group relative flex h-full flex-col overflow-hidden rounded-card border border-hairline [--cdl-light-alpha:0.16] [--cdl-light-rgb:166_52_218] hover:-translate-y-1 motion-reduce:hover:translate-y-0"
    >
      {area ? (
        <span aria-hidden className="h-1 w-full" style={{ backgroundColor: area.accent }} />
      ) : null}

      {cover ? (
        <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-hairline">
          <Image
            src={cover}
            alt=""
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        </div>
      ) : null}

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {area ? (
            <span
              className="inline-flex items-center rounded-pill border px-2 py-0.5 text-base font-medium uppercase"
              style={{ color: area.label, borderColor: area.accent }}
            >
              {area.name[locale]}
            </span>
          ) : null}
          <time dateTime={publication.publishedAt} className="text-base text-ink-faint tabular-nums">
            {formatDate(publication.publishedAt, locale)}
          </time>
        </div>

        <h3 className="font-titulo text-2xl font-bold leading-tight text-balance-tight">
          <Link
            href={`/publications/${publication.slug}`}
            className="transition-colors duration-200 ease-brand after:absolute after:inset-0 after:content-[''] group-hover:text-accent"
          >
            {publication.title}
          </Link>
        </h3>

        <p className="line-clamp-3 text-base text-ink-muted">{publication.abstract}</p>

        <div className="mt-auto flex flex-col gap-3 border-t border-hairline pt-3">
          {publication.authorName ? (
            <p className="flex items-center gap-2 text-base text-ink">
              <IconUser className="icon-brand size-5 shrink-0 text-ink-faint" aria-hidden />
              <span className="sr-only">{t.publications.card.by}</span>
              <span className="truncate">{publication.authorName}</span>
            </p>
          ) : null}

          <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
            {pdf ? (
              <a
                href={pdf}
                target="_blank"
                rel="noopener noreferrer"
                data-light=""
                className="cdl-link inline-flex min-h-12 items-center gap-2 text-base font-medium text-ink hover:text-accent"
              >
                <IconDownload className="icon-brand size-5" aria-hidden />
                {t.publications.card.pdf}
              </a>
            ) : (
              <span />
            )}
            <Link
              href={teamHref}
              data-light=""
              className="cdl-link inline-flex min-h-12 items-center gap-2 text-base font-medium text-accent"
            >
              <IconUsersGroup className="icon-brand size-5" aria-hidden />
              {t.publications.card.team}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
