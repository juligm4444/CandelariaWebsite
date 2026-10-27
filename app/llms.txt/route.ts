import { areas } from '@/content/areas';
import { es } from '@/content/es';
import { SITE_NAME, SITE_URL, SOCIAL_PROFILES, UNIVERSITY } from '@/content/site';
import { formatSpec, vehicleSpecs } from '@/content/vehicle-specs';
import { listPublications } from '@/lib/db/publications';

/**
 * /llms.txt (llmstxt.org): a plain Markdown map of the site for language
 * models and AI search. Built from the same sources as the pages (the
 * Spanish dictionary, the areas, the spec sheet and the log), so it cannot
 * say something the site does not.
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  const t = es;
  const published = await listPublications('es', { perPage: 20 }).catch(() => ({ items: [] }));

  const specs = vehicleSpecs
    .map((block) => {
      const title = t.vehicle.specs.groupTitles[block.area] ?? block.area;
      const rows = block.rows
        .map((row) => `  - ${t.vehicle.specs.labels[row.key] ?? row.key}: ${formatSpec(row, 'es')}`)
        .join('\n');
      return `- ${title}${block.provisional ? ' (valores provisionales)' : ''}\n${rows}`;
    })
    .join('\n');

  const lines = [
    `# ${SITE_NAME}`,
    '',
    `> ${t.home.hero.badge}. ${t.home.hero.lead} Objetivo de competencia: ${t.vehicle.hero.target}.`,
    '',
    `${SITE_NAME} es un semillero de investigación interdisciplinario de la ${UNIVERSITY.name} (${UNIVERSITY.url}). El sitio está en español e inglés; el idioma se elige con un selector, no con la URL.`,
    '',
    '## Páginas',
    '',
    `- [Vehículo](${SITE_URL}/vehicle): ${t.vehicle.hero.lead}`,
    `- [Equipo](${SITE_URL}/team): ${t.team.hero.lead}`,
    `- [Bitácora](${SITE_URL}/publications): ${t.publications.hero.lead}`,
    `- [Nosotros](${SITE_URL}/about): historia, identidad de marca y valores del semillero.`,
    `- [Apoyo](${SITE_URL}/support): membresías y patrocinio.`,
    `- [Escríbenos](${SITE_URL}/contact): contacto para patrocinios, alianzas y prensa.`,
    '',
    '## Áreas',
    '',
    ...areas.map((area) => `- [${area.name.es}](${SITE_URL}/team?area=${area.key}): ${area.brief.es}`),
    '',
    '## Especificaciones del vehículo',
    '',
    'Las cifras marcadas como provisionales no son mediciones del vehículo de Candelaria.',
    '',
    specs,
    '',
    ...(published.items.length > 0
      ? [
          '## Entradas recientes de la bitácora',
          '',
          ...published.items.map(
            (item) => `- [${item.title}](${SITE_URL}/publications/${item.slug}): ${item.abstract.slice(0, 200)}`,
          ),
          '',
        ]
      : []),
    '## Enlaces',
    '',
    ...SOCIAL_PROFILES.map((profile) => `- [${profile.label}](${profile.href})`),
    `- [Mapa del sitio](${SITE_URL}/sitemap.xml)`,
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
