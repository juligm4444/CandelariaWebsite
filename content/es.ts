import type { AreaKey } from './areas';

/**
 * Spanish copy. This file is the source of truth for the dictionary shape:
 * `content/en.ts` is type-checked against it, so a missing English string is a
 * compile error rather than a blank panel in production.
 *
 * Voice rules (brand manual §1): short sentences, the fact before the
 * adjective, no double exclamation marks, no sustained capitals outside
 * labels, no emoji. Nothing here invents a measurement the team has not
 * published; unvalidated figures live behind an explicit status label.
 */

/** Validation state of one row on the vehicle status board. */
export type ValidationState = 'validated' | 'simulated' | 'pending';

const subsystem = (area: AreaKey, title: string, objective: string, challenge: string) => ({
  area,
  title,
  objective,
  challenge,
});

export const es = {
  meta: {
    siteName: 'Candelaria Solar Car',
    titleTemplate: '%s | Candelaria Solar Car',
    description:
      'Semillero de investigación interdisciplinario de la Universidad de los Andes que diseña, construye y valida un vehículo solar de competencia.',
  },

  common: {
    loading: 'Cargando',
    retry: 'Intentar de nuevo',
    loadError: 'No pudimos cargar esta información. Vuelve a intentarlo en un momento.',
    skipToContent: 'Saltar al contenido',
    close: 'Cerrar',
    required: 'Obligatorio',
    optional: 'opcional',
    back: 'Volver',
    save: 'Guardar',
    saving: 'Guardando',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    delete: 'Eliminar',
    open: 'Abrir',
    language: 'Idioma',
    languageSwitch: 'Cambiar a inglés',
  },

  loader: {
    caption: 'Semillero de investigación · Universidad de los Andes',
    /** The three attributes of the isotipo (manual §1), one at a time. */
    attributes: [
      { title: 'Ciclo', body: 'Energía que no se detiene' },
      { title: 'Facetas', body: 'Precisión técnica, como la retícula de una celda' },
      { title: 'Dirección', body: 'La mirada siempre al frente' },
    ],
    areasLabel: 'Siete áreas, un solo ciclo',
  },

  nav: {
    home: 'Inicio',
    vehicle: 'Vehículo',
    team: 'Equipo',
    publications: 'Bitácora',
    about: 'Nosotros',
    support: 'Apoyo',
    supportCta: 'Apoyar',
    account: 'Cuenta',
    profile: 'Perfil',
    purchases: 'Compras',
    dashboard: 'Panel',
    login: 'Entrar',
    register: 'Crear cuenta',
    logout: 'Cerrar sesión',
    openMenu: 'Abrir menú',
    closeMenu: 'Cerrar menú',
    primary: 'Navegación principal',
  },

  footer: {
    tagline: 'Energía que no se detiene.',
    institution: 'Universidad de los Andes',
    institutionNote: 'Semillero adscrito a la Facultad de Ingeniería.',
    sectionSite: 'El proyecto',
    sectionCommunity: 'Comunidad',
    sectionLegal: 'Legal',
    privacy: 'Privacidad',
    terms: 'Términos',
    brand: 'Manual de marca',
    contact: 'Escríbenos',
    rights: 'Candelaria Solar Car. Todos los derechos reservados.',
    builtBy: 'Sitio construido por el área de Diseño.',
  },

  home: {
    hero: {
      badge: 'Semillero de investigación · Universidad de los Andes',
      title: 'Energía que no se detiene',
      lead: 'Diseñamos, construimos y validamos un vehículo solar de competencia.',
      primary: 'Ver el vehículo',
      secondary: 'Conocer el semillero',
      routeTitle: 'Hecho para cruzar un continente con el sol',
      routeBody:
        'El Bridgestone World Solar Challenge recorre unos 3.000 km de Darwin a Adelaida. Cada vatio que entra por el techo cuenta.',
      specsNote: 'Valores provisionales de la ficha técnica.',
      specsCta: 'Ver la ficha técnica',
      caption: 'Render conceptual del monoplaza. No es el vehículo final de Candelaria.',
    },
    pillars: {
      title: 'Tres cosas a la vez',
      lead:
        'El vehículo es el entregable visible. Detrás hay una escuela de ingeniería aplicada y una comunidad que la sostiene.',
      items: [
        {
          title: 'Un vehículo de competencia',
          body:
            'Un monoplaza solar diseñado desde cero, con el objetivo de salir a pista en el Bridgestone World Solar Challenge.',
        },
        {
          title: 'Una escuela de ingeniería aplicada',
          body:
            'Estudiantes de ingeniería, diseño y administración resolviendo el mismo problema con criterios verificables.',
        },
        {
          title: 'Una comunidad que lo financia',
          body:
            'Quien apoya recibe trazabilidad de en qué se usó su aporte y acceso a los avances antes que nadie.',
        },
      ],
    },
    labs: {
      title: 'Donde se define la física del carro',
      lead: 'Tres áreas responden por cuánta energía entra, cuánta se guarda y cuánta se pierde.',
      items: [
        { area: 'celdas', body: 'Arreglo de paneles de referencia (6 m²), cálculo de potencia y caracterización con SCADA y KIOSOL.' },
        { area: 'chasis', body: 'Monocasco en fibra de carbono y forma exterior del carenado.' },
        { area: 'baterias', body: 'Banco 13S7P de 48 V y 35 Ah, BMS y caracterización del motor BLDC de 1000 W.' },
      ] as { area: AreaKey; body: string }[],
      cta: 'Ver el área',
    },
    updates: {
      eyebrow: 'Bitácora',
      title: 'Lo último que publicamos',
      lead: 'Avances técnicos y decisiones del proyecto, escritos por el área responsable.',
      cta: 'Toda la bitácora',
      emptyTitle: 'Todavía no hay publicaciones',
      emptyBody:
        'Los líderes de área publican desde el panel interno. En cuanto haya una entrada, aparece aquí.',
    },
    support: {
      title: 'Hoy el proyecto se financia entre todos',
      body:
        'La Universidad de los Andes respalda al semillero y el resto lo sostienen sus integrantes. Un aporte recurrente cambia qué tan rápido podemos validar.',
      cta: 'Apoyar el proyecto',
      secondary: 'Patrocinio para empresas',
    },
    institutional: {
      label: 'Con el respaldo de',
    },
  },

  vehicle: {
    hero: {
      title: 'Arquitectura del vehículo',
      lead:
        'Cinco subsistemas que comparten un presupuesto energético. Mejorar uno a costa de otro no cuenta como mejora.',
      viewerLabel: 'Modelo tridimensional del vehículo solar de Candelaria',
      viewerHint: 'Arrastra para girar · rueda o pellizco para acercar',
      viewerFallback:
        'Tu navegador no tiene la aceleración gráfica (WebGL) activada, así que el modelo 3D no se puede mostrar. El resto de la página funciona igual.',
      viewerLoading: 'Cargando el modelo',
      viewerDisclaimer:
        'Modelo tridimensional actualizado del vehículo. La geometría puede cambiar mientras Chasis y Diseño cierran el exterior.',
      targetLabel: 'Objetivo de competencia',
      target: 'Bridgestone World Solar Challenge, clase Challenger',
    },
    hotspots: {
      title: 'Partes del vehículo',
      hint: 'Toca un punto brillante, o elige una parte aquí, para ver sus especificaciones.',
      close: 'Cerrar',
      teamLink: 'Ver el área',
      provisional: 'Cifras provisionales',
      noSpecs: 'Esta parte todavía no publica cifras técnicas.',
      items: {
        array: {
          name: 'Arreglo solar',
          body: 'Convierte la luz del sol en electricidad. Celdas calcula, selecciona y caracteriza los paneles que lo forman.',
        },
        cockpit: {
          name: 'Habitáculo y cúpula',
          body: 'Donde va el piloto: visibilidad, controles a mano y ventilación sin perjudicar la aerodinámica.',
        },
        battery: {
          name: 'Banco de baterías',
          body: 'Guarda la energía del arreglo para entregarla cuando el vehículo la necesita. Está en ensamblaje, con soldadura por puntos.',
        },
        motor: {
          name: 'Tren motriz',
          body: 'Un motor sin escobillas (BLDC) convierte la energía almacenada en movimiento. Está en pruebas de caracterización en banco.',
        },
        shell: {
          name: 'Chasis y carenado',
          body: 'La estructura que carga todo lo demás y la forma que atraviesa el aire.',
        },
      },
    },
    specs: {
      eyebrow: 'Ficha técnica',
      title: 'Especificaciones',
      lead:
        'Las cifras de las áreas que ya corroboraron sus datos: captación solar y almacenamiento de energía. Las demás áreas se suman aquí cuando entreguen los suyos.',
      provisional: 'Valores provisionales',
      provisionalNote:
        'Estas cifras son provisionales y no corresponden todavía a mediciones del vehículo de Candelaria. Se reemplazan cuando cada área publique sus valores.',
      groupTitles: {
        chasis: 'Chasis y carenado',
        baterias: 'Baterías y tracción',
        celdas: 'Celdas y arreglo solar',
      } as Partial<Record<AreaKey, string>>,
      labels: {
        length: 'Longitud',
        width: 'Ancho',
        height: 'Altura',
        mass: 'Masa sin piloto',
        drag: 'Coeficiente de arrastre (Cd)',
        frontalArea: 'Área frontal',
        monocoque: 'Monocasco',
        configuration: 'Configuración',
        chemistry: 'Celda',
        capacity: 'Capacidad nominal',
        motor: 'Motor',
        motorPower: 'Potencia nominal del motor',
        motorSpeed: 'Velocidad nominal del motor',
        motorCurrent: 'Corriente nominal del motor',
        dailyEnergy: 'Energía generada por día',
        busCurrent: 'Corriente hacia el bus',
        voltage: 'Tensión nominal',
        energy: 'Energía almacenada',
        cellTech: 'Tecnología de celda',
        arrayArea: 'Área del arreglo',
        cellEfficiency: 'Eficiencia de celda',
        peakPower: 'Potencia pico del arreglo',
      } as Record<string, string>,
    },
    subsystems: {
      title: '¿Qué resuelve cada subsistema y qué área responde por él?',
      lead:
        'Los frentes con datos corroborados. Cada uno tiene un área responsable, un objetivo y un desafío que todavía no está resuelto.',
      objectiveLabel: 'Objetivo',
      challengeLabel: 'Desafío técnico',
      progressLabel: 'Avance',
      progressNote:
        'El porcentaje de avance es provisional: lo reemplaza cada área cuando publique su propio criterio de cierre.',
      teamLink: 'Ver el área',
      items: [
        subsystem(
          'baterias',
          'Gestión de energía y BMS',
          'Almacenar la energía en un banco de iones de litio 13S7P (48 V, 35 Ah, 1680 Wh) y entregar al motor la potencia que pide.',
          'Seleccionar e integrar el BMS, definir el material de recubrimiento óptimo y probar con equipos de protección.',
        ),
        subsystem(
          'celdas',
          'Captación solar y MPPT',
          'Ajustar el voltaje del arreglo al bus de 48 V y extraer la máxima potencia con un convertidor DC/DC con MPPT (boost o buck, por definir con Electrónica).',
          'Pasar de estimaciones de ingeniería a cifras medidas: caracterizar el panel en el SCADA de la universidad y con baterías en KIOSOL, y con eso cotizar y justificar el panel.',
        ),
        subsystem(
          'chasis',
          'Estructura y monocasco',
          'Proteger al piloto ante impactos con la menor masa estructural posible.',
          'Definir la secuencia de laminado de la fibra para resistir las cargas dinámicas sin sobredimensionar.',
        ),
        subsystem(
          'diseno',
          'Habitáculo y ergonomía',
          'Que el piloto conduzca jornadas largas con buena visibilidad, controles a mano y temperatura tolerable.',
          'Ventilar el habitáculo sin perjudicar el coeficiente de arrastre del carenado.',
        ),
        subsystem(
          'logistica',
          'Telemetría y operación',
          'Llevar los datos del vehículo al equipo de carrera en tiempo real para decidir la velocidad de cada tramo.',
          'Mantener el enlace con el vehículo en zonas sin cobertura celular.',
        ),
      ],
    },
    regulation: {
      eyebrow: 'Reglamento',
      title: 'Cumplimiento del reglamento de carrera',
      lead:
        'Cada restricción del reglamento, contrastada con la cifra actual del vehículo y con el área que responde por ella.',
      note:
        'Límites de referencia de la clase Challenger del Bridgestone World Solar Challenge, por verificar contra la edición vigente del reglamento. Las cifras del vehículo son provisionales: salen de la ficha técnica de esta página.',
      columns: {
        requirement: 'Requisito',
        limit: 'Límite',
        current: 'Vehículo',
        margin: 'Margen',
        state: 'Estado',
        area: 'Área',
      },
      notApplicable: 'No aplica',
      complies: 'Cumple',
      exceeds: 'Excede',
      rows: {
        arrayArea: 'Superficie del arreglo solar',
        length: 'Longitud total',
        width: 'Ancho total',
        packMass: 'Masa del paquete de baterías',
        egress: 'Salida del piloto sin asistencia',
        visibility: 'Campo visual del piloto',
        electrical: 'Protocolo de seguridad eléctrica',
      } as Record<string, string>,
    },
    status: {
      legend: {
        validated: 'Validado',
        simulated: 'En simulación',
        pending: 'Por definir',
      },
    },
  },

  team: {
    hero: {
      title: 'Quién construye el carro',
      lead:
        'Siete áreas con responsabilidades separadas y una sola reunión semanal donde se cruzan.',
    },
    areasTitle: 'Las áreas',
    dutiesTitle: 'Responsabilidades',
    membersTitle: 'Integrantes',
    memberCount: {
      one: '1 integrante',
      other: '{{count}} integrantes',
    },
    roles: {
      leader: 'Líder',
      coleader: 'Co-líder',
      member: 'Integrante',
    },
    socialTitle: 'Enlaces',
    emptyTitle: 'Esta área aún no tiene integrantes publicados',
    emptyBody:
      'Los perfiles aparecen cuando el líder del área los agrega desde el panel interno.',
    photoPending: 'Sin foto de perfil',
    explorer: {
      ringLabel: 'Áreas del semillero',
      ringPointer: 'Arrastra para girar el anillo o haz clic en un logo para ver el área.',
      ringTouch: 'Desliza para girar el anillo o toca un logo para ver el área.',
      previous: 'Integrantes anteriores',
      next: 'Más integrantes',
      logLink: 'Bitácora del área',
      showBack: 'Ver los enlaces de {{name}}',
      showFront: 'Volver a la foto de {{name}}',
      noLinks: 'Todavía no publicó enlaces.',
      newTab: 'se abre en una pestaña nueva',
      summary: {
        one: '{{areas}} áreas y 1 integrante activo',
        other: '{{areas}} áreas y {{count}} integrantes activos',
      },
      ring: {
        roleDescription: 'carrusel',
        previous: 'Girar hacia atrás',
        next: 'Girar hacia adelante',
        pause: 'Pausar el carrusel',
        play: 'Reanudar el carrusel',
        hintPointer: 'Pasa el cursor para detenerlo y usa la rueda para girarlo. Clic en una tarjeta para darle la vuelta.',
        hintTouch: 'Desliza para girarlo. Toca una tarjeta para darle la vuelta.',
      },
    },
    howWeWork: {
      title: 'Cómo trabajamos',
      lead: 'Las áreas son independientes en su alcance y dependientes en sus decisiones.',
      controls: {
        group: 'Prácticas del semillero',
        pause: 'Pausar la secuencia',
        play: 'Reanudar la secuencia',
      },
      items: [
        {
          title: 'Una reunión semanal',
          body: 'Cada semana las siete áreas cruzan avances y bloqueos en una sola mesa.',
        },
        {
          title: 'Criterio de cierre',
          body: 'Cada área publica qué tiene que pasar para dar por cerrada una pieza.',
        },
        {
          title: 'Todo queda escrito',
          body: 'Las decisiones se documentan en la bitácora para la siguiente generación.',
        },
        {
          title: 'Revisión cruzada',
          body: 'Ningún subsistema se aprueba sin que lo revise el área que depende de él.',
        },
      ],
    },
    faq: {
      title: 'Preguntas frecuentes',
      items: [
        {
          q: '¿Cómo contacto a un área en particular?',
          a: 'Escríbenos desde la página de contacto. El mensaje llega al Comité, que lo reenvía al área correspondiente.',
        },
        {
          q: '¿Dónde se publican los avances de cada área?',
          a: 'En la bitácora. Cada entrada la firma el área que hizo el trabajo y se puede filtrar por área y por año.',
        },
        {
          q: '¿Comprar una membresía me hace parte del semillero?',
          a: 'No. Una membresía es una forma de apoyo: te da una cuenta para seguir el proyecto y gestionar tu aporte, pero no te vincula al equipo.',
        },
      ],
    },
  },

  publications: {
    hero: {
      title: 'Bitácora',
      lead:
        'Avances técnicos, decisiones de diseño y resultados de validación, escritos por el área que los produjo.',
    },
    featured: {
      region: 'Destacado de la bitácora',
      latest: 'Lo último',
      mostRead: 'Lo más leído',
      reads: {
        one: '1 lectura',
        other: '{{count}} lecturas',
      },
      read: 'Leer la entrada',
      pause: 'Pausar el destacado',
      play: 'Reanudar el destacado',
    },
    filters: {
      area: 'Área',
      allAreas: 'Todas las áreas',
      year: 'Año',
      allYears: 'Todos los años',
      order: 'Orden',
      newest: 'Más recientes',
      oldest: 'Más antiguas',
      searchLabel: 'Buscar en la bitácora',
      searchPlaceholder: 'Tema, componente, material o ensayo',
      searchShortcut: 'Pulsa / para buscar',
      clearSearch: 'Borrar la búsqueda',
      updating: 'Actualizando resultados',
      searchFor: '«{{q}}»',
      clear: 'Limpiar filtros',
      resultCount: {
        one: '1 publicación',
        other: '{{count}} publicaciones',
      },
    },
    card: {
      read: 'Leer',
      by: 'Por',
      pdf: 'PDF técnico',
      team: 'Ver en Equipo',
    },
    emptyTitle: 'Todavía no hay publicaciones',
    emptyBody:
      'Cuando un líder de área publique su primera entrada desde el panel interno, aparecerá en esta lista.',
    emptyFilteredTitle: 'Ninguna publicación coincide con el filtro',
    emptyFilteredBody: 'Prueba con otra área u otro año.',
    pagination: {
      label: 'Paginación de la bitácora',
      previous: 'Anterior',
      next: 'Siguiente',
      page: 'Página {{page}} de {{total}}',
    },
    detail: {
      coverAlt: 'Imagen de portada de «{{title}}»',
      backToList: 'Volver a la bitácora',
      abstract: 'Resumen',
      downloadPdf: 'Descargar PDF',
      area: 'Área',
      author: 'Autor',
      published: 'Publicado',
      notFoundTitle: 'Esta publicación no existe',
      notFoundBody: 'El enlace puede estar roto o la entrada se retiró.',
    },
  },

  about: {
    hero: {
      title: 'Empezó por una competencia',
      lead:
        'Y terminó siendo la forma en que un grupo de estudiantes aprende a construir cosas que funcionan.',
    },
    origin: {
      title: 'Qué es Candelaria',
      paragraphs: [
        'Candelaria es un semillero de investigación interdisciplinario de la Universidad de los Andes, formado en 2022 alrededor de una pregunta concreta: si un grupo de estudiantes puede diseñar y construir un vehículo que se mueva solo con el sol.',
        'La respuesta corta es que todavía lo estamos averiguando. La respuesta larga es que el proceso de averiguarlo resultó más valioso que la respuesta, porque obliga a tomar decisiones de ingeniería con datos y a defenderlas frente a otras seis áreas.',
        'Hoy el semillero reúne estudiantes y egresados de ingeniería, diseño y administración. Nadie trabaja aquí por una nota. El entregable es un carro que funcione.',
      ],
    },
    mission: {
      label: 'Misión',
      title: 'Formar ingeniería aplicada con un entregable real',
      body:
        'Sostener un proyecto técnico de largo plazo donde cada decisión se justifica con un modelo, una medición o un reglamento, y donde el aprendizaje se queda en la universidad cuando una generación se gradúa.',
    },
    vision: {
      label: 'Visión',
      title: 'Ser referencia regional en movilidad solar universitaria',
      body:
        'Llegar a la línea de salida del Bridgestone World Solar Challenge con un vehículo diseñado y construido en Colombia, y dejar documentado todo lo que hizo falta para lograrlo.',
    },
    identity: {
      eyebrow: 'Identidad',
      title: 'Cómo se construyó la marca',
      lead:
        'Un símbolo, una paleta y dos tipografías, definidos en el Manual de Marca v1.0. Cada decisión tiene una razón, y aquí está.',
      condor: {
        title: 'Por qué un cóndor',
        paragraphs: [
          'El cóndor andino es el ave nacional de Colombia y el símbolo más reconocible de los Andes, la cordillera que le da nombre a la universidad.',
          'Es también un planeador: pasa horas en el aire aprovechando corrientes térmicas, casi sin batir las alas. Un vehículo solar vive de la misma idea, sacar el máximo de una energía que no se puede desperdiciar.',
        ],
      },
      attributes: [
        { title: 'Ciclo', body: 'El cóndor se envuelve sobre sí mismo hasta cerrar un círculo: energía que no se detiene.' },
        { title: 'Facetas', body: 'Los planos de las plumas remiten a la precisión técnica y a la retícula de una celda solar.' },
        { title: 'Dirección', body: 'La mirada al frente comunica ambición y avance. El círculo no gira en el vacío: va hacia algún lado.' },
      ],
      palette: {
        title: 'Una paleta con proporciones',
        lead:
          'El manual no solo fija los colores: fija cuánto pesa cada uno en una pieza. El dorado es acento, nunca protagonista.',
        swatches: [
          { name: 'Morado profundo', hex: '#1E0A29', share: 45, role: 'Identidad. El cielo antes del amanecer, el lienzo de todo.' },
          { name: 'Neutro', hex: '#EFEEEA', share: 30, role: 'Aire. Da espacio para leer.' },
          { name: 'Dorado', hex: '#FFB938', share: 15, role: 'Identidad y acento. El sol que el carro convierte en movimiento.' },
          { name: 'Violeta', hex: '#A634DA', share: 6, role: 'Acompaña. El brillo de una celda bajo la luz.' },
          { name: 'Lavanda', hex: '#D4BCFA', share: 4, role: 'Acompaña. Suaviza el contraste.' },
        ],
        areasTitle: 'Un cóndor por área',
        areasBody:
          'Cada área usa el mismo símbolo en su propio color, solo para piezas internas y siempre junto a su nombre. Hacia afuera se usa el cóndor dorado.',
      },
      type: {
        title: 'Dos voces tipográficas',
        display: 'Sansation habla en títulos: geométrica, técnica, con aire de ingeniería.',
        text: 'Helvetica Now lleva los textos: neutra, legible y sin adornos, para que el dato vaya primero.',
        sample: 'Energía que no se detiene',
      },
      note: 'Los significados de los colores son una lectura propuesta del manual, pendiente de validación con el área de Diseño.',
    },
    timeline: {
      eyebrow: 'Recorrido',
      title: 'De una reunión a un vehículo',
      lead: 'Los hitos que ordenaron el semillero, de los primeros planos a la pista.',
      provisional: 'Fechas y eventos provisionales: el Comité confirma el recorrido oficial.',
      imagePending: 'Foto del hito · próximamente',
      next: 'Próximo',
      items: [
        {
          when: '2022',
          title: 'La primera reunión',
          body:
            'Un grupo de estudiantes de ingeniería se organiza alrededor de una pregunta: ¿podemos construir un carro que se mueva solo con el sol? No hay áreas, no hay procesos y casi no hay presupuesto.',
        },
        {
          when: '2023',
          title: 'Siete áreas, una mesa',
          body:
            'El grupo se divide en Chasis, Celdas, Baterías, Diseño, Logística, Recursos Humanos y Comité. Nace la reunión semanal donde todas cruzan avances y bloqueos.',
        },
        {
          when: '2024',
          title: 'Una identidad propia',
          body:
            'Diseño publica el Manual de Marca v1.0: el cóndor que cierra un círculo, la paleta morado y dorado y las reglas para que cada pieza hable igual.',
        },
        {
          when: '2025',
          title: 'Primeras celdas a prueba',
          body:
            'Celdas monta su primer banco de ensayo y mide paneles de muestra bajo condiciones controladas. Las primeras diferencias entre modelo y medición quedan en la bitácora.',
        },
        {
          when: '2026',
          title: 'El monocasco toma forma',
          body:
            'Chasis cierra la geometría del monocasco y empieza la fabricación de moldes. El sitio web pasa a ser la bitácora pública del proyecto.',
        },
        {
          when: '2027',
          title: 'Salir a pista',
          body:
            'Integrar los subsistemas, validar el vehículo completo y llevarlo a su primera prueba en pista. Todo lo demás se subordina a eso.',
          upcoming: true,
        },
      ],
    },
    values: {
      eyebrow: 'Código de cultura',
      title: 'Lo que no se negocia',
      lead: 'Cinco principios que ordenan cada reunión, cada compra y cada decisión de diseño.',
      items: [
        {
          title: 'El dato antes del adjetivo',
          body:
            'Una afirmación técnica sin medición ni modelo detrás no entra en una presentación ni en este sitio.',
          tags: 'Modelo · Medición · Reglamento',
        },
        {
          title: 'Interdisciplina de verdad',
          body:
            'Diseño y administración no son áreas de apoyo. Tienen voto en las decisiones que afectan su alcance.',
          tags: 'Revisión cruzada · Voto por área',
        },
        {
          title: 'Seguridad primero',
          body:
            'Alta tensión, baterías de litio y manufactura con fibra. El protocolo se cumple antes de encender nada.',
          tags: 'Protocolo eléctrico · Manufactura',
        },
        {
          title: 'El error se publica',
          body:
            'Cuando una medición contradice el modelo, se documenta la diferencia. Es la parte que realmente enseña.',
          tags: 'Bitácora · Validación',
        },
        {
          title: 'El conocimiento se queda',
          body:
            'Cada semestre rota gente. Lo que no quedó escrito se pierde, así que escribirlo es parte del trabajo.',
          tags: 'Documentación · Relevo generacional',
        },
      ],
    },
    impact: {
      title: 'El semillero en cifras',
      lead: 'Contadas directamente de la base de datos del sitio, no escritas a mano.',
      areas: 'Áreas de trabajo',
      years: 'Años de actividad',
      members: 'Integrantes activos',
      careers: 'Carreras representadas',
      publications: 'Entradas en la bitácora',
      unavailable: 'Sin datos',
      yearsNote: 'Desde 2022, año de fundación pendiente de confirmar con el Comité.',
    },
    valuesBand: {
      items: ['Innovación', 'Interdisciplina', 'Energía limpia', 'Rigor'],
      label: 'Valores del semillero',
    },
    support: {
      title: 'Si quieres que esto avance más rápido',
      body:
        'El semillero se financia con el respaldo de la universidad y el esfuerzo de sus integrantes. Un aporte recurrente se traduce directamente en componentes y horas de prueba.',
      cta: 'Ver las formas de apoyo',
    },
  },

  support: {
    hero: {
      title: 'Lo que tu aporte compra',
      lead:
        'Celdas para probar, fibra para laminar y horas de pista. Nada de esto llega solo con entusiasmo.',
      primary: 'Elegir una membresía',
      secondary: 'Patrocinio para empresas',
    },
    allocation: {
      title: 'A dónde va el dinero',
      lead: 'Logística lleva la trazabilidad por área y la reporta cada semestre.',
      provisional: 'Distribución provisional',
      provisionalNote:
        'Los porcentajes son una referencia de planeación, no el reporte de ejecución. Se reemplazan con el informe semestral de Logística.',
      chartLabel: 'Distribución del presupuesto por destino',
      centre: 'del presupuesto',
      items: [
        {
          title: 'Componentes',
          body: 'Celdas fotovoltaicas, celdas de litio, electrónica de potencia e instrumentación.',
        },
        {
          title: 'Manufactura',
          body: 'Fibra de carbono, resinas, moldes y tiempo de máquina para fabricar el monocasco.',
        },
        {
          title: 'Validación',
          body: 'Alquiler de pista, equipos de medición y transporte del vehículo a las pruebas.',
        },
      ],
    },
    plans: {
      eyebrow: 'Membresías',
      title: 'Apoyo recurrente',
      lead:
        'Tres niveles, pensados desde los atributos del isotipo. Se cancelan cuando quieras, sin trámite. Una membresía es una forma de apoyo: te da una cuenta de seguimiento, no te hace integrante del semillero.',
      recommended: 'Más elegida',
      perMonth: 'al mes',
      cta: 'Elegir este nivel',
      ctaCurrent: 'Tu membresía actual',
      disabled: 'No disponible por ahora',
      includes: 'Incluye',
      processing: 'Abriendo el pago',
    },
    contact: {
      title: 'Patrocinio institucional',
      body:
        'Si representas una empresa o una facultad y quieres aportar material, servicios o financiación, el Comité responde directamente.',
      cta: 'Escribir al Comité',
    },
    sponsor: {
      stepsTitle: 'Cómo funciona una alianza',
      steps: [
        { title: 'Nos escribes', body: 'Cuéntanos con el formulario qué te gustaría aportar y qué esperas de la alianza.' },
        { title: 'El Comité arma la propuesta', body: 'Aporte económico, material o de servicios: la propuesta se construye contigo.' },
        { title: 'Trazabilidad', body: 'El uso del aporte queda en el informe semestral de Logística.' },
        { title: 'Visibilidad acordada', body: 'Tu marca en el vehículo y en las piezas del semillero, en los términos pactados.' },
      ],
      formTitle: 'Solicitud de alianza',
      name: 'Nombre y apellido',
      organization: 'Empresa u organización',
      email: 'Correo corporativo',
      modality: 'Modalidad de interés',
      modalities: {
        economic: 'Aporte económico',
        material: 'Material o componentes',
        services: 'Servicios (manufactura, pruebas, transporte)',
        academic: 'Alianza académica o de investigación',
        other: 'Otra',
      },
      proposal: 'Propuesta',
      proposalHint: 'Qué te gustaría aportar y qué esperas de la alianza. Mínimo 20 caracteres.',
      submit: 'Enviar solicitud',
      submitting: 'Enviando',
      success: 'Recibimos tu solicitud. El Comité te responde por correo.',
    },
  },

  /**
   * Shared messages for the membership checkout. There used to be a merch
   * cart and a one-off donation too; Polar does not accept physical goods or
   * donations as a product category (see content/catalog.ts), so both are
   * gone and only the messages the membership checkout still needs survive
   * here.
   */
  payments: {
    unavailable: 'Los pagos están desactivados temporalmente. Vuelve a intentarlo más tarde.',
    loginRequiredBody: 'Entra o crea una cuenta para continuar con el pago.',
  },

  purchases: {
    hero: {
      title: 'Tu membresía',
      lead: 'Historial completo de tus aportes recurrentes.',
    },
    membershipTitle: 'Membresía',
    noMembershipTitle: 'No tienes una membresía activa',
    noMembershipBody: 'Un aporte recurrente da continuidad al presupuesto del semillero.',
    noMembershipCta: 'Ver membresías',
    historyTitle: 'Historial',
    emptyTitle: 'Todavía no hay movimientos',
    emptyBody: 'Cuando se registre tu primer cobro, aparecerá aquí.',
    manage: 'Gestionar la suscripción',
    manageNote: 'Se abre el portal de facturación de Polar.',
    columns: {
      date: 'Fecha',
      concept: 'Concepto',
      amount: 'Monto',
      status: 'Estado',
      reference: 'Referencia',
    },
    status: {
      active: 'Activa',
      canceled: 'Cancelada',
      past_due: 'Pago pendiente',
      incomplete: 'Incompleta',
      pending: 'Pendiente',
      succeeded: 'Completado',
      failed: 'Fallido',
      refunded: 'Devuelto',
    },
    types: {
      subscription: 'Membresía',
    },
    nextBilling: 'Próximo cobro',
  },

  auth: {
    login: {
      title: 'Entrar',
      lead: 'Accede a tu perfil, tus aportes y, si eres del equipo, al panel interno.',
      email: 'Correo electrónico',
      emailPlaceholder: 'tu.correo@uniandes.edu.co',
      password: 'Contraseña',
      passwordPlaceholder: 'Tu contraseña',
      submit: 'Entrar',
      submitting: 'Entrando',
      forgot: '¿Olvidaste tu contraseña?',
      noAccount: '¿Todavía no tienes cuenta?',
      registerLink: 'Crear una',
      errors: {
        invalid: 'Correo o contraseña incorrectos.',
        tooMany: 'Demasiados intentos. Espera unos minutos antes de volver a probar.',
        unverified: 'Confirma tu correo antes de entrar. Revisa tu bandeja.',
        generic: 'No pudimos iniciar la sesión. Vuelve a intentarlo.',
      },
    },
    register: {
      title: 'Crear cuenta',
      lead: 'Con una cuenta puedes apoyar al semillero y seguir los avances desde dentro.',
      name: 'Nombre completo',
      namePlaceholder: 'Nombre y apellido',
      email: 'Correo electrónico',
      password: 'Contraseña',
      passwordHint: 'Mínimo 12 caracteres. Usa algo que no estés usando en otro sitio.',
      confirmPassword: 'Confirmar contraseña',
      submit: 'Crear cuenta',
      submitting: 'Creando la cuenta',
      hasAccount: '¿Ya tienes cuenta?',
      loginLink: 'Entrar',
      internalNotice:
        'Tu correo está en la lista del semillero. Después de entrar, completa tu perfil de integrante.',
      externalNotice:
        'La cuenta se crea como apoyo externo. Si eres del equipo, usa tu correo institucional.',
      errors: {
        emailTaken: 'Ya existe una cuenta con este correo.',
        nameRequired: 'Escribe tu nombre completo.',
        emailInvalid: 'Revisa el formato del correo.',
        passwordShort: 'La contraseña debe tener al menos 12 caracteres.',
        passwordWeak: 'Elige una contraseña menos predecible.',
        passwordMismatch: 'Las contraseñas no coinciden.',
        generic: 'No pudimos crear la cuenta. Vuelve a intentarlo.',
      },
      success: 'Cuenta creada. Te enviamos un correo para confirmar la dirección.',
    },
    forgot: {
      title: 'Restablecer la contraseña',
      lead: 'Escribe tu correo y te enviamos un enlace para definir una nueva.',
      submit: 'Enviar el enlace',
      submitting: 'Enviando',
      backToLogin: 'Volver a entrar',
      sent:
        'Si ese correo tiene una cuenta, el enlace ya está en camino. El enlace caduca en una hora.',
    },
    reset: {
      title: 'Nueva contraseña',
      lead: 'Define la contraseña con la que vas a entrar de ahora en adelante.',
      password: 'Nueva contraseña',
      confirmPassword: 'Confirmar la nueva contraseña',
      submit: 'Guardar la contraseña',
      submitting: 'Guardando',
      success: 'Contraseña actualizada. Ya puedes entrar.',
      invalidLink: 'El enlace caducó o ya se usó. Pide uno nuevo.',
      errors: {
        generic: 'No pudimos actualizar la contraseña. Pide un enlace nuevo.',
      },
    },
    verify: {
      title: 'Confirma tu correo',
      lead:
        'Escribe el correo de tu cuenta y te enviamos un enlace de confirmación. Ábrelo desde el mismo dispositivo.',
      resend: 'Enviar el enlace de confirmación',
      resending: 'Enviando',
      resent:
        'Si ese correo tiene una cuenta pendiente de confirmar, el enlace ya está en camino.',
      error: 'No pudimos enviar el correo. Vuelve a intentarlo en un momento.',
    },
  },

  profile: {
    hero: {
      title: 'Tu perfil',
      lead: 'Gestiona tus datos, tu foto y, si eres del equipo, tu información de área.',
    },
    sections: {
      account: 'Cuenta',
      member: 'Perfil de integrante',
      links: 'Enlaces',
      supporter: 'Apoyo',
      danger: 'Cerrar sesión',
    },
    fields: {
      name: 'Nombre completo',
      email: 'Correo electrónico',
      emailLocked: 'El correo no se puede cambiar desde aquí.',
      area: 'Área',
      areaPlaceholder: 'Selecciona tu área',
      career: 'Carrera',
      careerPlaceholder: 'Selecciona tu carrera',
      role: 'Rol en el área',
      rolePlaceholder: 'Por ejemplo: simulación aerodinámica',
      photo: 'Foto de perfil',
      photoHint: 'JPG, PNG o WebP. Máximo 5 MB.',
      photoChange: 'Cambiar la foto',
      cardTitle: 'Tu tarjeta en Equipo',
      cardHint: 'Esto se publica en la página de Equipo. Deja vacío lo que no quieras mostrar.',
      bio: 'Bio corta',
      bioHint: 'Qué haces en el semillero, en una o dos frases. Máximo 280 caracteres.',
      linkedinUrl: 'LinkedIn',
      githubUrl: 'GitHub',
      instagramUrl: 'Instagram',
      websiteUrl: 'Sitio personal',
      linkError: 'Revisa los enlaces: deben empezar por https:// y apuntar a la plataforma correcta.',
      bioError: 'La bio no puede pasar de 280 caracteres.',
    },
    links: {
      platform: 'Plataforma',
      url: 'Dirección',
      platformPlaceholder: 'Selecciona una plataforma',
      urlPlaceholder: 'https://',
      add: 'Añadir enlace',
      duplicate: 'Ya tienes un enlace de esa plataforma.',
      invalidUrl: 'La dirección debe empezar por https://',
      empty: 'Todavía no agregaste enlaces.',
    },
    supporter: {
      title: 'Tu nivel de apoyo',
      tierLabel: 'Nivel actual',
      totalLabel: 'Aportado hasta hoy',
      monthsLabel: 'Meses de membresía',
      progress: '{{percent}} % hacia {{tier}}',
      maxTier: 'Alcanzaste el nivel más alto.',
      remaining: 'Faltan {{amount}} para {{tier}}.',
      explain: 'El nivel se calcula sobre los aportes acumulados y los meses de membresía.',
      tiers: {
        visitor: 'Visitante',
        supporter: 'Apoyo',
        bronze: 'Bronce',
        silver: 'Plata',
        gold: 'Oro',
        core: 'Núcleo',
      },
    },
    updateSuccess: 'Perfil actualizado.',
    updateError: 'No pudimos guardar los cambios. Vuelve a intentarlo.',
    externalBadge: 'Apoyo externo',
  },

  dashboard: {
    hero: {
      title: 'Panel interno',
      lead: 'Publicaciones y gestión del área. Visible solo para integrantes del semillero.',
    },
    tabs: {
      publications: 'Publicaciones',
      members: 'Integrantes',
    },
    publications: {
      mine: 'Mis publicaciones',
      area: 'Publicaciones del área',
      create: 'Nueva publicación',
      emptyMine: 'Todavía no publicaste nada.',
      emptyArea: 'El área aún no tiene publicaciones.',
      form: {
        title: 'Nueva publicación',
        nameEs: 'Título en español',
        nameEn: 'Título en inglés',
        abstractEs: 'Resumen en español',
        abstractEn: 'Resumen en inglés',
        pdf: 'Archivo PDF',
        pdfHint: 'Solo PDF. Máximo 10 MB.',
        image: 'Imagen de portada',
        imageHint: 'JPG, PNG o WebP. Máximo 5 MB.',
        submit: 'Publicar',
        submitting: 'Publicando',
      },
      created: 'Publicación creada.',
      createError: 'No pudimos crear la publicación.',
      deleted: 'Publicación eliminada.',
      deleteError: 'No pudimos eliminar la publicación.',
      confirmDelete: 'Esta acción elimina la publicación de forma permanente.',
    },
    members: {
      title: 'Integrantes del área',
      invite: 'Invitar por correo',
      inviteLabel: 'Correo de la persona',
      inviteRole: 'Rol inicial',
      inviteSubmit: 'Enviar invitación',
      invited: 'Invitación registrada. La persona ya puede crear su cuenta.',
      inviteError: 'No pudimos registrar esta invitación.',
      inviteDomainError: 'Solo puedes invitar correos institucionales (dominio autorizado).',
      remove: 'Revocar acceso',
      removed: 'Acceso revocado.',
      removeError: 'No pudimos revocar el acceso.',
      confirmRemove: 'La persona pierde el acceso al panel y deja de aparecer en el equipo.',
      promote: 'Asignar co-líder',
      demote: 'Quitar co-líder',
      transfer: 'Transferir liderazgo',
      confirmTransfer: 'Vas a dejar de ser líder del área. La acción no se revierte sola.',
      onlyLeader: 'Solo el líder del área puede hacer esto.',
      updated: 'Cambio aplicado.',
      updateError: 'No pudimos aplicar el cambio.',
    },
    noAreaTitle: 'Tu cuenta no tiene área asignada',
    noAreaBody: 'Pide al líder de tu área que te agregue desde este mismo panel.',
  },

  contact: {
    routes: [
      {
        title: 'Patrocinio y alianzas',
        body: 'Para empresas e instituciones: hay un formulario propio con la modalidad de aporte.',
        href: '/support#patrocinio-bloque',
        cta: 'Ir al formulario de alianza',
      },
      {
        title: 'Avances técnicos',
        body: 'Antes de escribir, revisa la bitácora: cada área publica ahí sus resultados.',
        href: '/publications',
        cta: 'Abrir la bitácora',
      },
      {
        title: 'Membresías',
        body: 'Si ya apoyas al proyecto, tu cuenta muestra tu membresía y el portal de facturación.',
        href: '/purchases',
        cta: 'Ver mi membresía',
      },
    ],
    hero: {
      title: 'Escríbenos',
      lead: 'El mensaje llega al área que corresponde. Respondemos en días hábiles.',
    },
    topicLabel: 'Tema',
    topics: {
      general: 'Consulta general',
      rrhh: 'Recursos Humanos',
      comite: 'Patrocinio o alianza',
      prensa: 'Prensa',
    },
    name: 'Tu nombre',
    email: 'Tu correo',
    message: 'Mensaje',
    messageHint: 'Cuéntanos en pocas líneas qué necesitas.',
    submit: 'Enviar',
    submitting: 'Enviando',
    success: 'Mensaje enviado. Te respondemos a este correo.',
    error: 'No pudimos enviar el mensaje. Inténtalo de nuevo en un momento.',
    rateLimited: 'Demasiados mensajes seguidos. Espera unos minutos.',
  },

  legal: {
    privacyTitle: 'Privacidad',
    termsTitle: 'Términos de uso',
    updated: 'Última actualización',
  },

  notFound: {
    title: 'Esta página no existe',
    lead: 'El enlace puede estar roto o la página se movió.',
    cta: 'Volver al inicio',
    secondary: 'Ver las publicaciones',
  },

  error: {
    title: 'Algo falló de nuestro lado',
    lead: 'El error quedó registrado. Vuelve a cargar la página o inténtalo en un momento.',
    cta: 'Recargar',
  },
};

export type Dictionary = typeof es;
