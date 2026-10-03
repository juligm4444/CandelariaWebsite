import type { Locale } from '@/lib/i18n/config';

/**
 * Privacy notice and terms.
 *
 * Written from what this codebase actually does, not from a template: every
 * item below maps to a concrete call in lib/. If the processing changes, this
 * file changes with it.
 *
 * It has not been reviewed by a lawyer. See docs/MANUAL_SETUP.md, "Revisión
 * legal", before treating it as final.
 */
export const LEGAL_UPDATED = '2026-10-02';

export type LegalSection = { heading: string; body: string[] };

type Doc = Record<Locale, { title: string; intro: string; sections: LegalSection[] }>;

export const privacy: Doc = {
  es: {
    title: 'Aviso de privacidad',
    intro:
      'Este aviso describe qué datos personales trata el sitio de Candelaria Solar Car, con qué finalidad y durante cuánto tiempo. Aplica a candelaria.website y a sus subdominios.',
    sections: [
      {
        heading: 'Responsable',
        body: [
          'Semillero Candelaria Solar Car, Universidad de los Andes, Bogotá, Colombia. Para cualquier solicitud sobre tus datos, usa el formulario de contacto del sitio y selecciona el tema correspondiente.',
        ],
      },
      {
        heading: 'Qué datos tratamos',
        body: [
          'Cuenta: nombre, correo electrónico y contraseña cifrada con un algoritmo de derivación de claves. La contraseña nunca se guarda en texto plano ni se puede recuperar, solo restablecer.',
          'Perfil de integrante, solo para miembros del semillero: área, rol dentro del área, carrera y foto de perfil si la subes.',
          'Sesión: dirección IP y agente de usuario del navegador, asociados a cada sesión activa, para poder cerrarla y para limitar intentos de acceso.',
          'Aportes: monto, moneda, estado y fecha de cada aporte o pedido. Los datos de tu tarjeta nunca pasan por este sitio: el pago ocurre en Polar.sh.',
          'Mensajes de contacto: nombre, correo y el texto que escribas.',
        ],
      },
      {
        heading: 'Para qué los usamos',
        body: [
          'Autenticarte y mantener tu sesión abierta.',
          'Mostrar tu perfil en la página de equipo, si eres integrante del semillero.',
          'Procesar y acreditar tus aportes, y calcular tu nivel de apoyo.',
          'Responder tus mensajes.',
          'Detectar y frenar abuso: límites de intentos de acceso, de pagos y de mensajes.',
        ],
      },
      {
        heading: 'Con quién los compartimos',
        body: [
          'Supabase: alojamiento de la base de datos y de los archivos que subes. Los datos quedan en la región que el semillero configuró en Supabase.',
          'Polar.sh: pasarela de pagos. Recibe tu correo y tu nombre para emitir el recibo, y es quien trata los datos de tu medio de pago.',
          'Resend: envío de correos transaccionales, como la confirmación de correo y el restablecimiento de contraseña.',
          'PostHog: analítica de uso. No capturamos grabaciones de sesión, no capturamos el contenido de los formularios y respetamos la señal Do Not Track del navegador.',
          'Vercel: alojamiento del sitio y registros de operación.',
          'No vendemos datos personales ni los cedemos con fines publicitarios.',
        ],
      },
      {
        heading: 'Cookies',
        body: [
          'Sesión: una cookie estrictamente necesaria que mantiene tu sesión iniciada. Sin ella no puedes entrar.',
          'Idioma: una cookie de preferencia que recuerda si navegas en español o en inglés.',
          'Analítica: PostHog usa almacenamiento local y cookies propias para distinguir visitas. Si tu navegador envía Do Not Track, no se inicializa.',
        ],
      },
      {
        heading: 'Cuánto tiempo los conservamos',
        body: [
          'Cuenta y perfil: mientras la cuenta exista.',
          'Sesiones: 14 días desde el último uso, o hasta que cierres sesión.',
          'Registros de aportes: mientras lo exija la obligación contable del semillero.',
          'Registro de auditoría de acciones sensibles: 24 meses.',
        ],
      },
      {
        heading: 'Tus derechos',
        body: [
          'Puedes pedir acceso, corrección, actualización o supresión de tus datos, y revocar tu autorización, conforme a la Ley 1581 de 2012 de Colombia.',
          'Escríbenos desde el formulario de contacto con el tema "Consulta general". Respondemos en los plazos que fija la norma.',
          'Si tu solicitud afecta un registro contable de un aporte, conservaremos el mínimo necesario para cumplir esa obligación y eliminaremos el resto.',
        ],
      },
    ],
  },
  en: {
    title: 'Privacy notice',
    intro:
      'This notice describes which personal data the Candelaria Solar Car site processes, for what purpose and for how long. It applies to candelaria.website and its subdomains.',
    sections: [
      {
        heading: 'Controller',
        body: [
          'Candelaria Solar Car research group, Universidad de los Andes, Bogotá, Colombia. For any request about your data, use the contact form on this site and pick the matching topic.',
        ],
      },
      {
        heading: 'What we process',
        body: [
          'Account: name, e-mail address and a password hashed with a key-derivation function. The password is never stored in clear text and cannot be recovered, only reset.',
          'Member profile, for group members only: area, role within the area, degree programme and a profile photo if you upload one.',
          'Session: IP address and browser user agent, attached to each active session, so you can end it and so access attempts can be limited.',
          'Contributions: amount, currency, status and date of each contribution or order. Your card details never pass through this site: payment happens on Polar.sh.',
          'Contact messages: name, e-mail and the text you write.',
        ],
      },
      {
        heading: 'Why we use it',
        body: [
          'To authenticate you and keep your session open.',
          'To show your profile on the team page, if you are a member of the group.',
          'To process and credit your contributions, and to compute your support level.',
          'To answer your messages.',
          'To detect and stop abuse: limits on sign-in attempts, payments and messages.',
        ],
      },
      {
        heading: 'Who we share it with',
        body: [
          'Supabase: database hosting and storage for the files you upload. Data stays in the region the group configured in Supabase.',
          'Polar.sh: payment gateway. It receives your e-mail and name to issue the receipt, and it is the party that processes your payment details.',
          'Resend: transactional e-mail, such as address confirmation and password reset.',
          'PostHog: usage analytics. We do not capture session recordings, we do not capture form contents, and we respect the browser Do Not Track signal.',
          'Vercel: site hosting and operational logs.',
          'We do not sell personal data and we do not share it for advertising.',
        ],
      },
      {
        heading: 'Cookies',
        body: [
          'Session: a strictly necessary cookie that keeps you signed in. Without it you cannot sign in.',
          'Language: a preference cookie remembering whether you browse in Spanish or English.',
          'Analytics: PostHog uses local storage and first-party cookies to tell visits apart. If your browser sends Do Not Track, it never initialises.',
        ],
      },
      {
        heading: 'How long we keep it',
        body: [
          'Account and profile: for as long as the account exists.',
          'Sessions: 14 days from last use, or until you sign out.',
          'Contribution records: for as long as the group accounting obligation requires.',
          'Audit log of sensitive actions: 24 months.',
        ],
      },
      {
        heading: 'Your rights',
        body: [
          'You may request access, correction, update or deletion of your data, and withdraw your consent, under Colombian Law 1581 of 2012.',
          'Write to us from the contact form with the "General enquiry" topic. We answer within the statutory deadlines.',
          'If your request touches the accounting record of a contribution, we keep the minimum needed for that obligation and delete the rest.',
        ],
      },
    ],
  },
};

export const terms: Doc = {
  es: {
    title: 'Términos de uso',
    intro:
      'Estos términos regulan el uso del sitio de Candelaria Solar Car, incluidas las cuentas, los aportes y la tienda.',
    sections: [
      {
        heading: 'Quiénes somos',
        body: [
          'Candelaria Solar Car es un semillero de investigación estudiantil de la Universidad de los Andes. No es una empresa y no persigue ánimo de lucro.',
        ],
      },
      {
        heading: 'Cuentas',
        body: [
          'Debes dar información veraz y mantener tu contraseña en secreto. Eres responsable de la actividad que ocurra con tu cuenta.',
          'Las cuentas de integrante del semillero solo se crean por invitación de un líder de área o con un correo institucional autorizado. Intentar obtener acceso interno por otra vía implica la suspensión de la cuenta.',
          'Podemos suspender una cuenta que incumpla estos términos o que ponga en riesgo la operación del sitio.',
        ],
      },
      {
        heading: 'Aportes y membresías',
        body: [
          'Los aportes son voluntarios y financian materiales, manufactura y pruebas del vehículo. No otorgan participación, propiedad ni derecho de decisión sobre el proyecto.',
          'Las membresías se cobran por periodos mensuales a través de Polar.sh y puedes cancelarlas en cualquier momento desde el portal de facturación. La cancelación evita el siguiente cobro y no genera reembolso del periodo en curso.',
          'Los beneficios de cada nivel se cumplen dentro del calendario académico del semillero.',
        ],
      },
      {
        heading: 'Tienda',
        body: [
          'La equipación se produce por tandas. El tiempo de entrega se confirma por correo después de la compra.',
          'Si un artículo llega defectuoso, escríbenos dentro de los 30 días siguientes a la entrega y lo reponemos o devolvemos el importe.',
        ],
      },
      {
        heading: 'Contenido y propiedad intelectual',
        body: [
          'La marca, el isotipo y el sistema visual de Candelaria son propiedad del semillero y no pueden usarse sin autorización escrita.',
          'Las publicaciones técnicas son de sus autores. Puedes citarlas indicando el autor, el área y el enlace a esta página.',
        ],
      },
      {
        heading: 'Límites',
        body: [
          'El sitio se ofrece tal cual. Las cifras marcadas como "en simulación" o "por definir" son estimaciones internas y no constituyen una especificación técnica publicada.',
          'No respondemos por interrupciones del servicio causadas por terceros de los que depende el sitio.',
        ],
      },
      {
        heading: 'Ley aplicable',
        body: [
          'Estos términos se rigen por la ley colombiana. Cualquier controversia se resolverá ante los jueces competentes de Bogotá.',
        ],
      },
    ],
  },
  en: {
    title: 'Terms of use',
    intro:
      'These terms govern the use of the Candelaria Solar Car site, including accounts, contributions and the store.',
    sections: [
      {
        heading: 'Who we are',
        body: [
          'Candelaria Solar Car is a student research group at Universidad de los Andes. It is not a company and it is not for profit.',
        ],
      },
      {
        heading: 'Accounts',
        body: [
          'You must give accurate information and keep your password secret. You are responsible for activity under your account.',
          'Group member accounts are created only by invitation from an area lead or with an authorised institutional e-mail. Attempting to obtain internal access any other way results in suspension.',
          'We may suspend an account that breaches these terms or puts the operation of the site at risk.',
        ],
      },
      {
        heading: 'Contributions and memberships',
        body: [
          'Contributions are voluntary and fund materials, manufacturing and vehicle testing. They grant no equity, ownership or decision rights over the project.',
          'Memberships are charged monthly through Polar.sh and can be cancelled at any time from the billing portal. Cancelling stops the next charge and does not refund the current period.',
          'The benefits of each level are delivered within the academic calendar of the group.',
        ],
      },
      {
        heading: 'Store',
        body: [
          'Kit is produced in batches. Delivery time is confirmed by e-mail after purchase.',
          'If an item arrives faulty, write to us within 30 days of delivery and we will replace it or refund it.',
        ],
      },
      {
        heading: 'Content and intellectual property',
        body: [
          'The Candelaria brand, mark and visual system belong to the group and may not be used without written permission.',
          'Technical publications belong to their authors. You may cite them naming the author, the area and the link to this site.',
        ],
      },
      {
        heading: 'Limits',
        body: [
          'The site is provided as is. Figures marked "in simulation" or "to be defined" are internal estimates and are not a published technical specification.',
          'We are not liable for service interruptions caused by the third parties the site depends on.',
        ],
      },
      {
        heading: 'Governing law',
        body: [
          'These terms are governed by Colombian law. Any dispute will be resolved before the competent courts of Bogotá.',
        ],
      },
    ],
  },
};
