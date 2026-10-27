/**
 * Structured data (schema.org JSON-LD) for search engines and AI crawlers.
 *
 * `<` is escaped to its unicode form, so text that came from the database
 * (a publication title, an abstract) can never close the script element and
 * inject markup. The payload is data, never executed, so it needs no CSP
 * nonce.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
