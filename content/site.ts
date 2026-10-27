/**
 * Facts about the organisation that more than one surface repeats: the
 * footer, the structured data every page carries and /llms.txt. Edit them
 * here once.
 */

export const SITE_NAME = 'Candelaria Solar Car';

/** Production origin, used when `APP_URL` is not set. */
export const SITE_URL = (process.env.APP_URL ?? 'https://candelaria.website').replace(/\/+$/, '');

export const UNIVERSITY = {
  name: 'Universidad de los Andes',
  url: 'https://uniandes.edu.co',
};

export type SocialProfile = {
  key: 'instagram' | 'linkedin' | 'github';
  label: string;
  href: string;
};

export const SOCIAL_PROFILES: SocialProfile[] = [
  { key: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/candelaria_solarcar/' },
  { key: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/company/candelaria-auto-solar/' },
  { key: 'github', label: 'GitHub', href: 'https://github.com/juligm4444/CandelariaWebsite' },
];
