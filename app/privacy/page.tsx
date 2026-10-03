import type { Metadata } from 'next';

import { LegalPage } from '@/components/legal/legal-page';
import { LEGAL_UPDATED, privacy } from '@/content/legal';
import { getContent } from '@/lib/i18n/server';

export const metadata: Metadata = {
  title: 'Privacidad',
  description: 'Qué datos personales trata el sitio de Candelaria Solar Car y con qué finalidad.',
};

export default async function PrivacyPage() {
  const { locale, t } = await getContent();
  const doc = privacy[locale];

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
