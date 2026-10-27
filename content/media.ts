/**
 * Photographs the team still has to supply, in one place.
 *
 * Drop the file in `public/media/` and set `src` here (for example
 * `'/media/hito-2026.webp'`). While `src` is null the page shows a framed
 * placeholder in brand colours instead, never a stock or generated photo of
 * people or of the vehicle.
 *
 * Recommended size: timeline images 1600 x 1200 (4:3). WebP or AVIF, under
 * 400 KB each.
 */

export type MediaSlot = {
  src: string | null;
  alt: { es: string; en: string };
};

/** One per entry of `about.timeline.items`, in the same order. */
export const timelineMedia: MediaSlot[] = [
  { src: null, alt: { es: 'Primera reunión del semillero.', en: 'The group’s first meeting.' } },
  { src: null, alt: { es: 'Organigrama de las siete áreas.', en: 'Chart of the seven areas.' } },
  { src: null, alt: { es: 'Sesión de diseño de la identidad.', en: 'Identity design session.' } },
  { src: null, alt: { es: 'Prueba de celdas en el laboratorio.', en: 'Cell test in the lab.' } },
  { src: null, alt: { es: 'Molde del chasis en el taller.', en: 'Chassis mould in the workshop.' } },
  { src: null, alt: { es: 'El vehículo en pista.', en: 'The vehicle on track.' } },
];
