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

const statusRow = (label: string, state: ValidationState) => ({ label, state });
const subsystem = (area: AreaKey, title: string, body: string) => ({ area, title, body });

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

  nav: {
    home: 'Inicio',
    vehicle: 'Vehículo',
    team: 'Equipo',
    publications: 'Publicaciones',
    about: 'Nosotros',
    support: 'Apoyo',
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
      title: 'Energía que no se detiene',
      lead:
        'Semillero interdisciplinario de la Universidad de los Andes. Diseñamos, construimos y validamos un vehículo solar de competencia.',
      primary: 'Ver el vehículo',
      secondary: 'Conocer el semillero',
      isotipoAlt: 'Isotipo institucional de Candelaria Solar Car: un cóndor que cierra un círculo',
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
    areas: {
      eyebrow: 'Estructura',
      title: 'Siete áreas, un vehículo',
      lead:
        'Cada área responde por una parte del problema y publica su propio criterio de cierre.',
      cta: 'Ver el equipo completo',
      hint: 'Desliza para ver todas las áreas',
    },
    method: {
      title: 'Cómo avanza una decisión',
      lead:
        'Ninguna pieza entra al carro sin pasar por estos tres filtros. El orden no se negocia.',
      steps: [
        {
          verb: 'Modelar',
          body:
            'La propuesta empieza como un modelo con supuestos escritos. Si no se puede simular, no se puede discutir.',
        },
        {
          verb: 'Construir',
          body:
            'Se fabrica la pieza o el subsistema mínimo que permita medir algo real, no la versión final.',
        },
        {
          verb: 'Validar',
          body:
            'Se compara la medición contra el modelo. La diferencia se documenta y se publica, incluso cuando incomoda.',
        },
      ],
    },
    updates: {
      eyebrow: 'Bitácora',
      title: 'Lo último que publicamos',
      lead: 'Avances técnicos y decisiones del proyecto, escritos por el área responsable.',
      cta: 'Todas las publicaciones',
      emptyTitle: 'Todavía no hay publicaciones',
      emptyBody:
        'Los líderes de área publican desde el panel interno. En cuanto haya una entrada, aparece aquí.',
    },
    values: {
      items: ['Innovación', 'Interdisciplina', 'Energía limpia', 'Rigor'],
      label: 'Valores del semillero',
    },
    support: {
      title: 'Hoy el proyecto se financia entre todos',
      body:
        'La Universidad de los Andes respalda al semillero y el resto lo sostienen sus integrantes. Un aporte recurrente cambia qué tan rápido podemos validar.',
      cta: 'Apoyar el proyecto',
    },
    institutional: {
      label: 'Con el respaldo de',
    },
  },

  vehicle: {
    hero: {
      title: 'Arquitectura del vehículo',
      lead:
        'Cuatro subsistemas que comparten un presupuesto energético. Mejorar uno a costa de otro no cuenta como mejora.',
      viewerLabel: 'Modelo tridimensional esquemático de un vehículo solar de clase Challenger',
      viewerHint: 'Arrastra para girar el modelo',
      viewerLoading: 'Cargando el modelo',
      viewerDisclaimer:
        'Modelo esquemático de la clase, no del vehículo de Candelaria. Lo reemplazamos por el modelo real cuando Chasis cierre la geometría exterior.',
      targetLabel: 'Objetivo de competencia',
      target: 'Bridgestone World Solar Challenge, clase Challenger',
    },
    subsystems: {
      title: 'Qué resuelve cada subsistema',
      lead: 'Cada bloque tiene un responsable, un criterio de cierre y una fecha.',
      items: [
        subsystem(
          'celdas',
          'Captación solar',
          'El arreglo fotovoltaico y el modelo de radiación que estima cuánta energía entra en cada tramo de la ruta.',
        ),
        subsystem(
          'baterias',
          'Almacenamiento y tracción',
          'El paquete de celdas, el tren motriz y el sistema de gestión que decide cuándo entregar y cuándo guardar.',
        ),
        subsystem(
          'chasis',
          'Estructura y aerodinámica',
          'El monocasco que carga todo lo demás y la forma exterior que define cuánta energía se pierde contra el aire.',
        ),
        subsystem(
          'logistica',
          'Telemetría y operación',
          'La instrumentación a bordo y el procedimiento de pista que convierte los datos en una decisión de carrera.',
        ),
      ],
    },
    status: {
      eyebrow: 'Estado técnico',
      title: 'Qué está cerrado y qué no',
      lead:
        'Publicamos cifras solo cuando el área responsable cierra su validación. Hasta entonces, el estado se muestra tal cual.',
      note:
        'Las celdas marcadas como pendientes se llenan desde el panel interno cuando el área publica su medición.',
      legend: {
        validated: 'Validado',
        simulated: 'En simulación',
        pending: 'Por definir',
      },
      groups: [
        {
          title: 'Estructura',
          rows: [
            statusRow('Arquitectura del monocasco', 'simulated'),
            statusRow('Masa objetivo del chasis', 'pending'),
            statusRow('Coeficiente aerodinámico', 'simulated'),
          ],
        },
        {
          title: 'Energía',
          rows: [
            statusRow('Distribución del arreglo solar', 'simulated'),
            statusRow('Eficiencia medida del arreglo', 'pending'),
            statusRow('Capacidad del paquete de baterías', 'pending'),
          ],
        },
        {
          title: 'Operación',
          rows: [
            statusRow('Protocolo de seguridad eléctrica', 'validated'),
            statusRow('Instrumentación a bordo', 'simulated'),
            statusRow('Estrategia de carrera', 'pending'),
          ],
        },
      ],
    },
    constraints: {
      title: 'Las reglas que no elegimos',
      body:
        'El reglamento de la competencia fija el área solar disponible, las dimensiones del vehículo y los requisitos de seguridad del habitáculo. Todo el diseño se mueve dentro de ese margen.',
      cta: 'Ver quién construye cada parte',
    },
  },

  team: {
    hero: {
      title: 'Quién construye el carro',
      lead:
        'Siete áreas con responsabilidades separadas y una sola reunión semanal donde se cruzan.',
    },
    areasTitle: 'Las áreas',
    dutiesTitle: 'De qué responde',
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
    filterAll: 'Todas las áreas',
    join: {
      title: 'Las convocatorias abren cada semestre',
      body:
        'Recursos Humanos publica los perfiles que faltan al inicio de cada periodo académico. No necesitas ser de ingeniería.',
      cta: 'Escribir a Recursos Humanos',
    },
  },

  publications: {
    hero: {
      title: 'Publicaciones',
      lead:
        'Avances técnicos, decisiones de diseño y resultados de validación, escritos por el área que los produjo.',
    },
    filters: {
      title: 'Filtrar',
      area: 'Área',
      allAreas: 'Todas las áreas',
      year: 'Año',
      allYears: 'Todos los años',
      apply: 'Aplicar',
      clear: 'Limpiar filtros',
      resultCount: {
        one: '1 publicación',
        other: '{{count}} publicaciones',
      },
    },
    card: {
      read: 'Leer',
      by: 'Por',
    },
    emptyTitle: 'Todavía no hay publicaciones',
    emptyBody:
      'Cuando un líder de área publique su primera entrada desde el panel interno, aparecerá en esta lista.',
    emptyFilteredTitle: 'Ninguna publicación coincide con el filtro',
    emptyFilteredBody: 'Prueba con otra área u otro año.',
    pagination: {
      previous: 'Anterior',
      next: 'Siguiente',
      page: 'Página {{page}} de {{total}}',
    },
    detail: {
      backToList: 'Volver a publicaciones',
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
    chapters: {
      eyebrow: 'Recorrido',
      title: 'Tres capítulos',
      items: [
        {
          when: '2022',
          title: 'El origen',
          body:
            'Un grupo de estudiantes se organiza para competir. No hay áreas, no hay procesos y casi no hay presupuesto.',
        },
        {
          when: 'Hoy',
          title: 'Siete áreas, un vehículo',
          body:
            'La estructura por áreas separa responsabilidades y hace que las decisiones queden escritas. El diseño del vehículo avanza por subsistemas.',
        },
        {
          when: 'Siguiente',
          title: 'Salir a pista',
          body:
            'Cerrar la validación de cada subsistema, integrarlos y llevar el carro a competencia. Todo lo demás se subordina a eso.',
        },
      ],
    },
    values: {
      title: 'Lo que no se negocia',
      items: [
        {
          title: 'El dato antes del adjetivo',
          body:
            'Una afirmación técnica sin medición ni modelo detrás no entra en una presentación ni en este sitio.',
        },
        {
          title: 'Interdisciplina de verdad',
          body:
            'Diseño y administración no son áreas de apoyo. Tienen voto en las decisiones que afectan su alcance.',
        },
        {
          title: 'Seguridad primero',
          body:
            'Alta tensión, baterías de litio y manufactura con fibra. El protocolo se cumple antes de encender nada.',
        },
        {
          title: 'El error se publica',
          body:
            'Cuando una medición contradice el modelo, se documenta la diferencia. Es la parte que realmente enseña.',
        },
        {
          title: 'El conocimiento se queda',
          body:
            'Cada semestre rota gente. Lo que no quedó escrito se pierde, así que escribirlo es parte del trabajo.',
        },
      ],
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
    },
    allocation: {
      title: 'A dónde va el dinero',
      lead: 'Logística lleva la trazabilidad por área y la reporta cada semestre.',
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
        'Tres niveles, pensados desde los atributos del isotipo. Se cancelan cuando quieras, sin trámite.',
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
    hero: {
      title: 'Escríbenos',
      lead: 'El mensaje llega al área que corresponde. Respondemos en días hábiles.',
    },
    topicLabel: 'Tema',
    topics: {
      general: 'Consulta general',
      rrhh: 'Quiero sumarme al semillero',
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
