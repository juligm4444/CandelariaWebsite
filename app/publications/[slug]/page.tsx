import { IconArrowLeft, IconFileTypePdf } from '@tabler/icons-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ViewBeacon } from '@/components/publications/view-beacon';
import { JsonLd } from '@/components/seo/json-ld';
import { ButtonExternal } from '@/components/ui/button';
import { Container, Hairline, Section } from '@/components/ui/layout';
import { areaByKey } from '@/content/areas';
import { getPublicationBySlug } from '@/lib/db/publications';
import { getContent } from '@/lib/i18n/server';
import { mediaUrl } from '@/lib/media';
import { articleJsonLd, pageMetadata } from '@/lib/seo';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const { locale } = await getContent();
  const publication = await getPublicationBySlug(slug, locale).catch(() => null);

  if (!publication) return { title: 'Publicación' };

  const cover = mediaUrl(publication.coverPath);
  const base = pageMetadata({
    title: publication.title,
    description: publication.abstract.slice(0, 180),
    path: `/publications/${publication.slug}`,
    type: 'article',
  });
  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      type: 'article',
      publishedTime: publication.publishedAt,
      ...(cover ? { images: [{ url: cover, alt: publication.title }] } : {}),
    },
  };
}

export default async function PublicationDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const { locale, t } = await getContent();

  const publication = await getPublicationBySlug(slug, locale).catch(() => null);
  if (!publication) notFound();

  const area = areaByKey.get(publication.areaKey);
  const cover = mediaUrl(publication.coverPath);
  const pdf = mediaUrl(publication.pdfPath);

  return (
    <Section surface="paper" space="tight">
      <JsonLd
        data={articleJsonLd({
          slug: publication.slug,
          title: publication.title,
          abstract: publication.abstract,
          publishedAt: publication.publishedAt,
          areaName: area?.name[locale] ?? null,
          authorName: publication.authorName,
          image: cover,
          logLabel: t.publications.hero.title,
        })}
      />
      <ViewBeacon slug={publication.slug} />
      <Container width="reading" className="flex flex-col gap-5">
        <Link
          href="/publications"
          data-light=""
          className="cdl-link inline-flex min-h-12 items-center gap-2 self-start text-base font-medium text-accent"
        >
          <IconArrowLeft className="icon-brand size-5" aria-hidden />
          {t.publications.detail.backToList}
        </Link>

        <article className="flex flex-col gap-5">
          <header className="flex flex-col gap-3">
            <div className="flex flex-wrap items-baseline gap-3">
              {area ? (
                <span className="text-base font-medium uppercase" style={{ color: area.label }}>
                  {area.name[locale]}
                </span>
              ) : null}
              <time dateTime={publication.publishedAt} className="text-base text-ink-faint">
                {formatDate(publication.publishedAt, locale)}
              </time>
            </div>

            <h1 className="text-balance-tight text-[2rem] md:text-[3rem]">{publication.title}</h1>

            {publication.authorName ? (
              <p className="text-base text-ink-muted">
                {t.publications.card.by} {publication.authorName}
              </p>
            ) : null}
          </header>

          {cover ? (
            <Image
              src={cover}
              alt={t.publications.detail.coverAlt.replace('{{title}}', publication.title)}
              width={1280}
              height={720}
              priority
              sizes="(max-width: 760px) 100vw, 760px"
              className="aspect-[16/9] w-full rounded-block border border-hairline object-cover"
            />
          ) : null}

          <Hairline />

          <div className="flex flex-col gap-3">
            <h2 className="font-texto text-base font-medium uppercase text-accent">
              {t.publications.detail.abstract}
            </h2>
            {/* Rendered as plain text, never as HTML: abstracts are written by
                area leads and must not be able to inject markup. */}
            {publication.abstract.split(/\n{2,}/).map((paragraph, index) => (
              <p key={index} className="text-base leading-relaxed text-ink md:text-[1.5rem] md:leading-[1.6]">
                {paragraph}
              </p>
            ))}
          </div>

          {pdf ? (
            <ButtonExternal href={pdf} variant="primary" className="self-start">
              <IconFileTypePdf className="icon-brand size-5" aria-hidden />
              {t.publications.detail.downloadPdf}
            </ButtonExternal>
          ) : null}
        </article>
      </Container>
    </Section>
  );
}
