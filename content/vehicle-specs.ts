import type { AreaKey } from './areas';
import type { ValidationState } from './es';
import type { Locale } from '@/lib/i18n/config';

/**
 * Vehicle specification sheet, one block per owning area.
 *
 * PROVISIONAL: every value below is a placeholder chosen to be plausible for
 * the Challenger class, NOT a Candelaria measurement. The page labels the
 * whole sheet as provisional while `provisional` is true. When an area sends
 * its real figures, replace that block's values and set its `provisional`
 * to false; once no block is provisional, the page label disappears on its
 * own.
 *
 * Numbers are stored once here and formatted per locale at render time, so
 * a figure can never drift between the Spanish and English pages. Row labels
 * live in the dictionaries (`vehicle.specs.labels`).
 */

export type SpecRow =
  | { key: string; value: number; unit?: string; fractionDigits?: number }
  | { key: string; text: Record<Locale, string> };

export type SpecBlock = {
  area: AreaKey;
  provisional: boolean;
  rows: SpecRow[];
};

/**
 * Areas whose figures the team has corroborated. Only these reach the site:
 * on /vehicle (the parts of the 3D model, the spec sheet, the subsystem
 * cards, the regulation table) and in the home hero. Every other block below
 * stays here, ready: when an area hands over its data, update its block and
 * add the area to this list.
 *
 * 2026-10-27: Celdas and Baterías.
 */
export const PUBLISHED_AREAS: readonly AreaKey[] = ['celdas', 'baterias'];

export function isPublished(area: AreaKey): boolean {
  return PUBLISHED_AREAS.includes(area);
}

export const vehicleSpecs: SpecBlock[] = [
  {
    area: 'chasis',
    provisional: true,
    rows: [
      { key: 'length', value: 4.99, unit: 'm', fractionDigits: 2 },
      { key: 'width', value: 2.2, unit: 'm', fractionDigits: 2 },
      { key: 'height', value: 1.1, unit: 'm', fractionDigits: 2 },
      { key: 'mass', value: 195, unit: 'kg' },
      { key: 'drag', value: 0.12, fractionDigits: 2 },
      { key: 'frontalArea', value: 0.85, unit: 'm²', fractionDigits: 2 },
      {
        key: 'monocoque',
        text: {
          es: 'Fibra de carbono con núcleo de panal',
          en: 'Carbon fibre with honeycomb core',
        },
      },
    ],
  },
  {
    area: 'baterias',
    provisional: true,
    rows: [
      { key: 'chemistry', text: { es: 'Ion de litio 26650 (3,7 V · 5000 mAh)', en: 'Lithium-ion 26650 (3.7 V · 5000 mAh)' } },
      { key: 'configuration', text: { es: '13S7P (91 celdas)', en: '13S7P (91 cells)' } },
      { key: 'voltage', value: 48, unit: 'V' },
      { key: 'capacity', value: 35, unit: 'Ah' },
      { key: 'energy', value: 1.68, unit: 'kWh', fractionDigits: 2 },
      { key: 'motor', text: { es: 'Kunray BY1020, BLDC', en: 'Kunray BY1020, BLDC' } },
      { key: 'motorPower', value: 1000, unit: 'W' },
      { key: 'motorSpeed', value: 3500, unit: 'RPM' },
      { key: 'motorCurrent', value: 28.8, unit: 'A', fractionDigits: 1 },
    ],
  },
  {
    area: 'celdas',
    provisional: true,
    rows: [
      { key: 'cellTech', text: { es: 'Paneles monocristalinos comerciales', en: 'Commercial monocrystalline panels' } },
      { key: 'arrayArea', value: 6, unit: 'm²', fractionDigits: 1 },
      { key: 'cellEfficiency', text: { es: '18 % – 22 %', en: '18% – 22%' } },
      { key: 'peakPower', text: { es: '1,1 – 1,3 kWp', en: '1.1 – 1.3 kWp' } },
      { key: 'dailyEnergy', text: { es: '4,4 – 6,6 kWh/día (Bogotá)', en: '4.4 – 6.6 kWh/day (Bogotá)' } },
      { key: 'busCurrent', text: { es: '22 – 28 A pico hacia el bus de 48 V', en: '22 – 28 A peak into the 48 V bus' } },
    ],
  },
];

export function formatSpec(row: SpecRow, locale: Locale): string {
  if ('text' in row) return row.text[locale];
  const digits = row.fractionDigits ?? 0;
  const number = new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'es-CO', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(row.value);
  return row.unit ? `${number} ${row.unit}` : number;
}


/**
 * Subsystem status shown on each subsystem card. PROVISIONAL like the spec
 * sheet: `progress` is a placeholder percentage until each area publishes its
 * closing criterion. Keyed by owning area, one subsystem per area.
 */
export const subsystemStatus: Partial<Record<AreaKey, { state: ValidationState; progress: number }>> = {
  baterias: { state: 'simulated', progress: 60 },
  celdas: { state: 'simulated', progress: 55 },
  chasis: { state: 'simulated', progress: 40 },
  diseno: { state: 'pending', progress: 25 },
  logistica: { state: 'simulated', progress: 35 },
};

/**
 * Regulation matrix. Numeric rows compare a reference limit with the matching
 * figure from `vehicleSpecs`, so the margin is computed, never typed in.
 * Reference limits: Bridgestone World Solar Challenge, Challenger class. To be
 * verified against the current edition of the regulations before publishing
 * them as final; the page says so.
 */
export type RegulationRow =
  | {
      key: string;
      area: AreaKey;
      kind: 'max';
      limit: number;
      unit: string;
      fractionDigits: number;
      /** Which spec row holds the vehicle figure. */
      spec: { area: AreaKey; key: string };
    }
  | { key: string; area: AreaKey; kind: 'state'; state: ValidationState };

export const regulationRows: RegulationRow[] = [
  { key: 'arrayArea', area: 'celdas', kind: 'max', limit: 4, unit: 'm²', fractionDigits: 2, spec: { area: 'celdas', key: 'arrayArea' } },
  { key: 'length', area: 'chasis', kind: 'max', limit: 5, unit: 'm', fractionDigits: 2, spec: { area: 'chasis', key: 'length' } },
  { key: 'width', area: 'chasis', kind: 'max', limit: 2.3, unit: 'm', fractionDigits: 2, spec: { area: 'chasis', key: 'width' } },
  { key: 'packMass', area: 'baterias', kind: 'state', state: 'pending' },
  { key: 'egress', area: 'chasis', kind: 'state', state: 'pending' },
  { key: 'visibility', area: 'diseno', kind: 'state', state: 'simulated' },
  { key: 'electrical', area: 'baterias', kind: 'state', state: 'validated' },
];

/** The vehicle figure a numeric regulation row is checked against. */
export function specValue(area: AreaKey, key: string): number | null {
  const row = vehicleSpecs.find((block) => block.area === area)?.rows.find((r) => r.key === key);
  return row && 'value' in row ? row.value : null;
}

export function formatNumber(value: number, locale: Locale, fractionDigits = 0): string {
  return new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'es-CO', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

/**
 * Clickable parts of the 3D model (/vehicle). Geometry only: names and body
 * copy live in the dictionaries (`vehicle.hotspots.items`), figures come
 * from `vehicleSpecs` above, so nothing is typed twice.
 *
 * Coordinates are in the scene file's own units
 * (public/models/vehicle-scene-v1.glb): metres, y up, the platform top at
 * y 0.08, the car's nose towards +z, its body spanning x ±0.38,
 * y 0.09–0.62, z -1.34–1.03, and the battery pack standing on the platform
 * at x -0.8, z -1.5. If the scene is re-exported with things moved, these
 * points move with them.
 *
 * The viewer casts a ray from outside back along `normal` and puts the
 * marker where it meets a surface, so a point only needs to be roughly
 * right: it is the line of sight that matters.
 *
 * Only the parts in `PUBLISHED_PARTS` are shown. The motor is not modelled
 * yet (the file has an empty "Motor" node), so its marker would only point
 * at the shell.
 */
export type HotspotKey = 'array' | 'cockpit' | 'battery' | 'motor' | 'shell';

export type VehicleHotspot = {
  key: HotspotKey;
  area: AreaKey;
  /** Point on the model where the marker sits. */
  position: [number, number, number];
  /**
   * Outward direction of the surface there: the marker hides while it faces
   * away from the camera, and the camera turns to look along it on select.
   */
  normal: [number, number, number];
  /** Materials of the GLB that light up while the part is selected. */
  materials: string[];
  /** Rows of the area's spec block to show; all of them when omitted. */
  specKeys?: string[];
};

/** Parts shown on the model: the ones whose area figures are corroborated. */
export const PUBLISHED_PARTS: readonly HotspotKey[] = ['array', 'battery'];

export const vehicleHotspots: VehicleHotspot[] = [
  {
    key: 'array',
    area: 'celdas',
    position: [0, 0.48, -0.71],
    normal: [0, 1, 0],
    materials: ['Celdas_Solares'],
  },
  {
    key: 'cockpit',
    area: 'diseno',
    position: [0, 0.62, -0.08],
    normal: [0, 1, 0.25],
    materials: ['Vidrio', 'Morado_acento'],
  },
  {
    key: 'battery',
    area: 'baterias',
    position: [-0.8, 0.25, -1.5],
    normal: [-0.8, 0.45, 0.4],
    materials: ['Bateria_celdas', 'Bateria_funda', 'Bateria_soporte', 'Bateria_cable', 'Bateria_aislante'],
    specKeys: ['chemistry', 'configuration', 'voltage', 'capacity', 'energy'],
  },
  {
    key: 'motor',
    area: 'baterias',
    position: [-0.36, 0.25, -1.0],
    normal: [-1, 0.1, -0.35],
    materials: [],
    specKeys: ['motor', 'motorPower', 'motorSpeed', 'motorCurrent'],
  },
  {
    key: 'shell',
    area: 'chasis',
    position: [0, 0.31, 0.99],
    normal: [0, 0.35, 1],
    materials: ['Pintura_Candelaria'],
  },
];
