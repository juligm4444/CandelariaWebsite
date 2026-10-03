import type { Locale } from '@/lib/i18n/config';

/** Undergraduate programmes at Universidad de los Andes, for the member profile. */
export const careers: { key: string; es: string; en: string }[] = [
  { key: 'business_administration', es: 'Administración de Empresas', en: 'Business Administration' },
  { key: 'anthropology', es: 'Antropología', en: 'Anthropology' },
  { key: 'architecture', es: 'Arquitectura', en: 'Architecture' },
  { key: 'art', es: 'Arte', en: 'Art' },
  { key: 'biology', es: 'Biología', en: 'Biology' },
  { key: 'data_science', es: 'Ciencia de Datos', en: 'Data Science' },
  { key: 'political_science', es: 'Ciencia Política', en: 'Political Science' },
  { key: 'law', es: 'Derecho', en: 'Law' },
  { key: 'design', es: 'Diseño', en: 'Design' },
  { key: 'economics', es: 'Economía', en: 'Economics' },
  { key: 'global_studies', es: 'Estudios Globales', en: 'Global Studies' },
  { key: 'philosophy', es: 'Filosofía', en: 'Philosophy' },
  { key: 'physics', es: 'Física', en: 'Physics' },
  { key: 'geosciences', es: 'Geociencias', en: 'Geosciences' },
  { key: 'history', es: 'Historia', en: 'History' },
  { key: 'art_history', es: 'Historia del Arte', en: 'Art History' },
  { key: 'environmental_engineering', es: 'Ingeniería Ambiental', en: 'Environmental Engineering' },
  { key: 'biomedical_engineering', es: 'Ingeniería Biomédica', en: 'Biomedical Engineering' },
  { key: 'civil_engineering', es: 'Ingeniería Civil', en: 'Civil Engineering' },
  {
    key: 'systems_and_computer_engineering',
    es: 'Ingeniería de Sistemas y Computación',
    en: 'Systems and Computer Engineering',
  },
  { key: 'electrical_engineering', es: 'Ingeniería Eléctrica', en: 'Electrical Engineering' },
  { key: 'electronic_engineering', es: 'Ingeniería Electrónica', en: 'Electronic Engineering' },
  { key: 'industrial_engineering', es: 'Ingeniería Industrial', en: 'Industrial Engineering' },
  { key: 'mechanical_engineering', es: 'Ingeniería Mecánica', en: 'Mechanical Engineering' },
  { key: 'chemical_engineering', es: 'Ingeniería Química', en: 'Chemical Engineering' },
  { key: 'languages_and_culture', es: 'Lenguas y Cultura', en: 'Languages and Culture' },
  { key: 'literature', es: 'Literatura', en: 'Literature' },
  { key: 'mathematics', es: 'Matemáticas', en: 'Mathematics' },
  { key: 'medicine', es: 'Medicina', en: 'Medicine' },
  { key: 'microbiology', es: 'Microbiología', en: 'Microbiology' },
  { key: 'music', es: 'Música', en: 'Music' },
  { key: 'digital_narratives', es: 'Narrativas Digitales', en: 'Digital Narratives' },
  { key: 'psychology', es: 'Psicología', en: 'Psychology' },
  { key: 'chemistry', es: 'Química', en: 'Chemistry' },
];

const byKey = new Map(careers.map((career) => [career.key, career]));

export function careerLabel(key: string | null | undefined, locale: Locale): string | null {
  if (!key) return null;
  const career = byKey.get(key);
  return career ? career[locale] : null;
}

export function isCareerKey(value: unknown): boolean {
  return typeof value === 'string' && byKey.has(value);
}
