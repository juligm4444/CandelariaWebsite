import type { Metadata } from 'next';

import { LegalPage } from '@/components/legal/legal-page';
import { LEGAL_UPDATED, terms } from '@/content/legal';
import { getContent } from '@/lib/i18n/server';

export const metadata: Metadata = {
  title: 'Términos de uso',
  description: 'Términos de uso del sitio de Candelaria Solar Car.',
};

export default async function TermsPage() {
  const { locale, t } = await getContent();
  const doc = terms[locale];

  return (
    <LegalPage
      title={doc.title}
      intro={doc.intro}
      sections={doc.sections}
      updated={LEGAL_UPDATED}
      updatedLabel={t.legal.updated}
      locale={locale}
    />
  );
}
