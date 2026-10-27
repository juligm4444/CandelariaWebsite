import type { Locale } from '@/lib/i18n/config';

/**
 * The seven working areas of the semillero, plus the institutional mark.
 *
 * `accent` is the area colour exactly as the brand manual publishes it (§3).
 * It paints bars, hairlines and borders, never a full background and never a
 * long paragraph.
 *
 * `label` is the same colour derived for TEXT with the manual's own HSL rule
 * (§4.2). The published values do not all clear 4.5:1 as 16px type, and none
 * of them clear it on Neutro 100. Because it resolves to a CSS variable, the
 * `.on-paper` scope swaps it automatically: one component reads correctly on
 * both surface families without knowing which one it is on.
 */
export type AreaKey =
  | 'comite'
  | 'rrhh'
  | 'diseno'
  | 'chasis'
  | 'celdas'
  | 'logistica'
  | 'baterias';

export type Area = {
  key: AreaKey;
  /** Matches `teams.name_key` in the database so DB rows can be joined to copy. */
  dbKeys: string[];
  /** Published palette value. Bars, borders and hairlines only. */
  accent: string;
  /** Contrast-checked tone for label text. Surface-aware. */
  label: string;
  /**
   * The published colour as an "R G B" triplet, for interaction light that
   * needs an alpha channel (`rgb(var(--cdl-light-rgb) / a)`).
   */
  rgb: string;
  isotipo: string;
  /**
   * Banner photograph, for the areas that have one (the three that set the
   * physics of the car). Same 16:9 source size for all of them, so banners
   * built from them always match.
   */
  cover?: { src: string; alt: Record<Locale, string> };
  name: Record<Locale, string>;
  /** One sentence. What this area is responsible for. */
  brief: Record<Locale, string>;
  /** Three responsibilities. Verb first, no adjectives before the fact. */
  duties: Record<Locale, [string, string, string]>;
};

export const areas: Area[] = [
  {
    key: 'comite',
    dbKeys: ['Committee', 'Comité', 'Executive Committee', 'comite', 'committee'],
    accent: 'var(--color-area-comite)',
    label: 'var(--cdl-label-comite)',
    rgb: '232 73 15',
    isotipo: '/brand/areas/comite.webp',
    name: { es: 'Comité', en: 'Committee' },
    brief: {
      es: 'Fija el rumbo del semillero y resuelve las decisiones que cruzan varias áreas.',
      en: 'Sets the direction of the semillero and settles the decisions that cross several areas.',
    },
    duties: {
      es: [
        'Define el objetivo de cada semestre y el criterio con el que se declara cumplido.',
        'Resuelve los bloqueos que una sola área no puede cerrar por su cuenta.',
        'Sostiene la relación con la universidad, con aliados académicos y con la industria.',
      ],
      en: [
        'Defines the goal of each term and the criterion that declares it met.',
        'Resolves the blockers a single area cannot close on its own.',
        'Holds the relationship with the university, academic allies and industry.',
      ],
    },
  },
  {
    key: 'celdas',
    dbKeys: ['Cells', 'Celdas', 'cells', 'solar'],
    accent: 'var(--color-area-celdas)',
    label: 'var(--cdl-label-celdas)',
    rgb: '79 108 240',
    isotipo: '/brand/areas/celdas.webp',
    cover: {
      src: '/img/celdas.webp',
      alt: {
        es: 'Panel solar monocristalino en primer plano, con la rejilla de celdas iluminada por una luz dorada.',
        en: 'Close-up of a monocrystalline solar panel, its cell grid lit by golden light.',
      },
    },
    name: { es: 'Celdas', en: 'Cells' },
    brief: {
      es: 'Calcula, selecciona y caracteriza la generación solar que alimenta al carro.',
      en: 'Calculates, selects and characterises the solar generation that powers the car.',
    },
    duties: {
      es: [
        'Calcula la potencia que debe entregar el motor y la energía que debe generar el sistema.',
        'Compara tecnologías y proveedores de celdas y paneles, y estima la radiación solar en las rutas de prueba.',
        'Simula el sistema de potencia (paneles, baterías y motor) en Matlab/Simulink y Typhoon HIL.',
      ],
      en: [
        'Calculates the power the motor must deliver and the energy the system must generate.',
        'Compares cell and panel technologies and suppliers, and estimates the solar radiation on the test routes.',
        'Simulates the power system (panels, batteries and motor) in Matlab/Simulink and Typhoon HIL.',
      ],
    },
  },
  {
    key: 'baterias',
    dbKeys: ['Batteries', 'Baterías', 'baterias', 'battery', 'batteries'],
    accent: 'var(--color-area-baterias)',
    label: 'var(--cdl-label-baterias)',
    rgb: '18 160 60',
    isotipo: '/brand/areas/baterias.webp',
    cover: {
      src: '/img/baterias.webp',
      alt: {
        es: 'Celdas de litio unidas por sus terminales de níquel, iluminadas en dorado y morado.',
        en: 'Lithium cells joined by their nickel terminals, lit in gold and purple.',
      },
    },
    name: { es: 'Baterías', en: 'Batteries' },
    brief: {
      es: 'Construye el banco de baterías y caracteriza el motor que mueve al vehículo.',
      en: 'Builds the battery bank and characterises the motor that moves the vehicle.',
    },
    duties: {
      es: [
        'Ensambla el banco de baterías de iones de litio 13S7P (48 V, 35 Ah) con soldadura por puntos y soportes impresos en 3D.',
        'Caracteriza el motor BLDC de 1000 W en banco de pruebas: curvas de corriente, potencia, RPM y torque.',
        'Integra el sistema de gestión de baterías (BMS), el recubrimiento y los equipos de protección.',
      ],
      en: [
        'Assembles the 13S7P lithium-ion battery bank (48 V, 35 Ah) by spot welding, with 3D-printed holders.',
        'Characterises the 1000 W BLDC motor on a test bench: current, power, RPM and torque curves.',
        'Integrates the battery management system (BMS), the casing and the protection equipment.',
      ],
    },
  },
  {
    key: 'chasis',
    dbKeys: ['Chassis', 'Chasis', 'chasis', 'chassis'],
    accent: 'var(--color-area-chasis)',
    label: 'var(--cdl-label-chasis)',
    rgb: '175 184 189',
    isotipo: '/brand/areas/chasis.webp',
    cover: {
      src: '/img/fibra.webp',
      alt: {
        es: 'Tejido de fibra de carbono con un reflejo de luz dorada sobre la trama.',
        en: 'Carbon fibre weave with a pool of golden light across the pattern.',
      },
    },
    name: { es: 'Chasis', en: 'Chassis' },
    brief: {
      es: 'Construye la estructura que carga todo lo demás y la forma que atraviesa el aire.',
      en: 'Builds the structure that carries everything else and the shape that cuts the air.',
    },
    duties: {
      es: [
        'Diseña la carrocería y la itera contra resultados de simulación aerodinámica.',
        'Verifica rigidez, masa y respuesta estructural antes de autorizar manufactura.',
        'Define los criterios de seguridad del habitáculo y la jaula.',
      ],
      en: [
        'Designs the body shell and iterates it against aerodynamic simulation results.',
        'Verifies stiffness, mass and structural response before authorising manufacture.',
        'Defines the safety criteria for the cockpit and the roll cage.',
      ],
    },
  },
  {
    key: 'logistica',
    dbKeys: ['Logistics', 'Logística', 'logistica', 'logistics'],
    accent: 'var(--color-area-logistica)',
    label: 'var(--cdl-label-logistica)',
    rgb: '28 196 220',
    isotipo: '/brand/areas/logistica.webp',
    name: { es: 'Logística', en: 'Logistics' },
    brief: {
      es: 'Mantiene el presupuesto, el inventario y los procesos para que el trabajo no se detenga.',
      en: 'Keeps the budget, the inventory and the processes so the work never stops.',
    },
    duties: {
      es: [
        'Controla presupuesto, recaudo y desembolsos con trazabilidad por área.',
        'Planifica compras, importaciones e inventario de componentes críticos.',
        'Documenta los procesos internos y mide cuánto tardan de verdad.',
      ],
      en: [
        'Controls budget, income and disbursements with traceability per area.',
        'Plans purchases, imports and the inventory of critical components.',
        'Documents internal processes and measures how long they actually take.',
      ],
    },
  },
  {
    key: 'diseno',
    dbKeys: ['Design', 'Diseño', 'diseno', 'design'],
    accent: 'var(--color-area-diseno)',
    label: 'var(--cdl-label-diseno)',
    rgb: '247 107 179',
    isotipo: '/brand/areas/diseno.webp',
    name: { es: 'Diseño', en: 'Design' },
    brief: {
      es: 'Define cómo se ve y cómo se lee Candelaria, del carro al sitio que estás usando.',
      en: 'Defines how Candelaria looks and reads, from the car to the site you are using.',
    },
    duties: {
      es: [
        'Mantiene el manual de marca y audita cada pieza antes de publicarla.',
        'Diseña el exterior del vehículo junto con Chasis y los elementos cosméticos.',
        'Produce la mercancía oficial y el sitio web del semillero.',
      ],
      en: [
        'Maintains the brand manual and audits every piece before it ships.',
        'Designs the vehicle exterior alongside Chassis, plus the cosmetic elements.',
        'Produces the official merchandise and the semillero website.',
      ],
    },
  },
  {
    key: 'rrhh',
    dbKeys: ['Human Resources', 'Recursos Humanos', 'rrhh', 'talento'],
    accent: 'var(--color-area-rrhh)',
    label: 'var(--cdl-label-rrhh)',
    rgb: '179 92 203',
    isotipo: '/brand/areas/rrhh.webp',
    name: { es: 'Recursos Humanos', en: 'Human Resources' },
    brief: {
      es: 'Consigue el talento que falta y cuida el que ya está dentro.',
      en: 'Finds the talent that is missing and looks after the talent already here.',
    },
    duties: {
      es: [
        'Abre convocatorias con perfiles claros y acompaña el proceso de selección.',
        'Diseña el onboarding para que alguien nuevo aporte en su primera semana.',
        'Sostiene bienestar, reconocimiento y la presencia del semillero en la universidad.',
      ],
      en: [
        'Opens calls with clear profiles and runs the selection process.',
        'Designs onboarding so a new member contributes in their first week.',
        'Holds wellbeing, recognition and the semillero presence inside the university.',
      ],
    },
  },
];

export const areaByKey = new Map(areas.map((area) => [area.key, area]));

/** Resolves a database team name (either language) to a known area. */
export function matchArea(teamName: string | null | undefined): Area | undefined {
  if (!teamName) return undefined;
  const needle = teamName.trim().toLowerCase();
  return areas.find((area) =>
    area.dbKeys.some((candidate) => candidate.toLowerCase() === needle),
  );
}
