/**
 * What the 3D viewer needs to draw one clickable part, prepared on the
 * server (copy resolved for the locale, figures formatted) so the client
 * bundle never carries the dictionaries.
 */
export type ViewerHotspot = {
  key: string;
  position: [number, number, number];
  normal: [number, number, number];
  materials: string[];
  name: string;
  body: string;
  areaName: string;
  /** CSS colour for label text (surface-aware variable). */
  areaLabel: string;
  /** CSS colour for bars and borders. */
  areaAccent: string;
  /** Area colour as "R G B", for light and for the 3D glow. */
  areaRgb: string;
  state: { label: string; color: string } | null;
  rows: { label: string; value: string }[];
  provisional: boolean;
  href: string;
};

export type HotspotLabels = {
  title: string;
  hint: string;
  close: string;
  teamLink: string;
  provisional: string;
  noSpecs: string;
};

/**
 * Size of the 3D stage, shared by the viewer, its loading skeleton and its
 * no-WebGL fallback so nothing shifts when the model arrives. Phones get a
 * square stage (the car and the battery pack beside it are a wide subject,
 * so a taller stage was mostly empty); wider screens a tall one.
 */
export const STAGE_SIZE =
  'aspect-square sm:aspect-[4/3] md:aspect-auto md:h-[75vh] md:min-h-[32rem]';

/**
 * The studio's world colour (Blender "Estudio", linear 0.004 / 0.004 / 0.005)
 * as it comes out of the AgX view transform: what the 3D scene shows behind
 * the car. The stage and its skeleton wear it too, so nothing flashes while
 * the model loads.
 */
export const STAGE_SURFACE = 'bg-[#040406]';
