import type { Dictionary } from './es';

/**
 * English copy. Typed against the Spanish dictionary, so any key added there
 * and missing here fails `npm run typecheck` instead of rendering blank.
 */
export const en: Dictionary = {
  meta: {
    siteName: 'Candelaria Solar Car',
    titleTemplate: '%s | Candelaria Solar Car',
    description:
      'An interdisciplinary research group at Universidad de los Andes that designs, builds and validates a competition solar vehicle.',
  },

  common: {
    loading: 'Loading',
    retry: 'Try again',
    loadError: 'We could not load this. Please try again in a moment.',
    skipToContent: 'Skip to content',
    close: 'Close',
    required: 'Required',
    optional: 'optional',
    back: 'Back',
    save: 'Save',
    saving: 'Saving',
    cancel: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
    open: 'Open',
    language: 'Language',
    languageSwitch: 'Switch to Spanish',
  },

  loader: {
    caption: 'Research group · Universidad de los Andes',
    attributes: [
      { title: 'Cycle', body: 'Energy that never stops' },
      { title: 'Facets', body: 'Technical precision, like the grid of a cell' },
      { title: 'Direction', body: 'Eyes always ahead' },
    ],
    areasLabel: 'Seven areas, one cycle',
  },

  nav: {
    home: 'Home',
    vehicle: 'Vehicle',
    team: 'Team',
    publications: 'Log',
    about: 'About',
    support: 'Support',
    supportCta: 'Support us',
    account: 'Account',
    profile: 'Profile',
    purchases: 'Orders',
    dashboard: 'Dashboard',
    login: 'Sign in',
    register: 'Create account',
    logout: 'Sign out',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    primary: 'Primary navigation',
  },

  footer: {
    tagline: 'Energy that never stops.',
    institution: 'Universidad de los Andes',
    institutionNote: 'Research group hosted by the School of Engineering.',
    sectionSite: 'The project',
    sectionCommunity: 'Community',
    sectionLegal: 'Legal',
    privacy: 'Privacy',
    terms: 'Terms',
    brand: 'Brand manual',
    contact: 'Contact us',
    rights: 'Candelaria Solar Car. All rights reserved.',
    builtBy: 'Site built by the Design area.',
  },

  home: {
    hero: {
      badge: 'Research group · Universidad de los Andes',
      title: 'Energy that never stops',
      lead: 'We design, build and validate a competition solar vehicle.',
      primary: 'See the vehicle',
      secondary: 'Meet the group',
      routeTitle: 'Built to cross a continent on sunlight',
      routeBody:
        'The Bridgestone World Solar Challenge runs about 3,000 km from Darwin to Adelaide. Every watt that comes in through the roof counts.',
      specsNote: 'Provisional values from the data sheet.',
      specsCta: 'See the data sheet',
      caption: 'Concept render of the single-seater. Not the final Candelaria vehicle.',
    },
    pillars: {
      title: 'Three things at once',
      lead:
        'The vehicle is the visible deliverable. Behind it there is a school of applied engineering and a community funding it.',
      items: [
        {
          title: 'A competition vehicle',
          body:
            'A single-seat solar car designed from scratch, aimed at the starting line of the Bridgestone World Solar Challenge.',
        },
        {
          title: 'A school of applied engineering',
          body:
            'Engineering, design and management students solving the same problem against verifiable criteria.',
        },
        {
          title: 'A community that funds it',
          body:
            'Supporters get traceability on where their contribution went, and early access to every advance.',
        },
      ],
    },
    labs: {
      title: 'Where the physics of the car is decided',
      lead: 'Three areas own how much energy comes in, how much is stored and how much is lost.',
      items: [
        { area: 'celdas', body: 'Reference panel array (6 m²), power calculations and characterisation with SCADA and KIOSOL.' },
        { area: 'chasis', body: 'Carbon-fibre monocoque and the outer shape of the fairing.' },
        { area: 'baterias', body: '13S7P 48 V, 35 Ah bank, BMS and characterisation of the 1000 W BLDC motor.' },
      ],
      cta: 'See the area',
    },
    updates: {
      eyebrow: 'Log',
      title: 'The latest we published',
      lead: 'Technical advances and project decisions, written by the area responsible for them.',
      cta: 'The full log',
      emptyTitle: 'No publications yet',
      emptyBody:
        'Area leads publish from the internal dashboard. The first entry will show up right here.',
    },
    support: {
      title: 'Today the project is funded between all of us',
      body:
        'Universidad de los Andes backs the group and its members carry the rest. A recurring contribution changes how fast we can validate.',
      cta: 'Support the project',
      secondary: 'Sponsorship for companies',
    },
    institutional: {
      label: 'Backed by',
    },
  },

  vehicle: {
    hero: {
      title: 'Vehicle architecture',
      lead:
        'Five subsystems sharing one energy budget. Improving one at the expense of another does not count as an improvement.',
      viewerLabel: 'Three-dimensional model of the Candelaria solar vehicle',
      viewerHint: 'Drag to rotate · scroll or pinch to zoom',
      viewerFallback:
        'Your browser has graphics acceleration (WebGL) turned off, so the 3D model cannot be shown. The rest of the page works as usual.',
      viewerLoading: 'Loading the model',
      viewerDisclaimer:
        'Updated three-dimensional model of the vehicle. The geometry may change while Chassis and Design close the exterior.',
      targetLabel: 'Competition target',
      target: 'Bridgestone World Solar Challenge, Challenger class',
    },
    hotspots: {
      title: 'Parts of the vehicle',
      hint: 'Tap a glowing point, or pick a part here, to see its specifications.',
      close: 'Close',
      teamLink: 'See the area',
      provisional: 'Provisional figures',
      noSpecs: 'This part does not publish technical figures yet.',
      items: {
        array: {
          name: 'Solar array',
          body: 'Turns sunlight into electricity. Cells calculates, selects and characterises the panels that make it up.',
        },
        cockpit: {
          name: 'Cockpit and canopy',
          body: 'Where the driver sits: visibility, controls at hand and ventilation without hurting the aerodynamics.',
        },
        battery: {
          name: 'Battery bank',
          body: 'Stores the energy from the array to deliver it when the vehicle needs it. Being assembled, by spot welding.',
        },
        motor: {
          name: 'Drivetrain',
          body: 'A brushless DC (BLDC) motor turns the stored energy into motion. Undergoing characterisation tests on a bench.',
        },
        shell: {
          name: 'Chassis and fairing',
          body: 'The structure that carries everything else and the shape that cuts through the air.',
        },
      },
    },
    specs: {
      eyebrow: 'Data sheet',
      title: 'Specifications',
      lead:
        'Figures from the areas that have corroborated their data: solar capture and energy storage. The other areas join this sheet as they hand theirs over.',
      provisional: 'Provisional values',
      provisionalNote:
        'These figures are provisional and are not yet measurements of the Candelaria vehicle. They are replaced as each area publishes its values.',
      groupTitles: {
        chasis: 'Chassis and fairing',
        baterias: 'Batteries and traction',
        celdas: 'Cells and solar array',
      },
      labels: {
        length: 'Length',
        width: 'Width',
        height: 'Height',
        mass: 'Mass without driver',
        drag: 'Drag coefficient (Cd)',
        frontalArea: 'Frontal area',
        monocoque: 'Monocoque',
        configuration: 'Configuration',
        chemistry: 'Cell',
        capacity: 'Nominal capacity',
        motor: 'Motor',
        motorPower: 'Motor rated power',
        motorSpeed: 'Motor rated speed',
        motorCurrent: 'Motor rated current',
        dailyEnergy: 'Energy generated per day',
        busCurrent: 'Current into the bus',
        voltage: 'Nominal voltage',
        energy: 'Stored energy',
        cellTech: 'Cell technology',
        arrayArea: 'Array area',
        cellEfficiency: 'Cell efficiency',
        peakPower: 'Peak array power',
      },
    },
    subsystems: {
      title: 'What does each subsystem solve, and which area owns it?',
      lead:
        'The fronts with corroborated data. Each has an owning area, a goal and a challenge that is still open.',
      objectiveLabel: 'Goal',
      challengeLabel: 'Technical challenge',
      progressLabel: 'Progress',
      progressNote:
        'The progress percentage is provisional: each area replaces it once it publishes its own closing criterion.',
      teamLink: 'See the area',
      items: [
        {
          area: 'baterias',
          title: 'Energy management and BMS',
          objective:
            'Store the energy in a 13S7P lithium-ion bank (48 V, 35 Ah, 1680 Wh) and deliver the power the motor asks for.',
          challenge:
            'Selecting and integrating the BMS, choosing the best casing material and testing with protection equipment.',
        },
        {
          area: 'celdas',
          title: 'Solar capture and MPPT',
          objective:
            'Match the array voltage to the 48 V bus and extract maximum power with a DC/DC converter with MPPT (boost or buck, to be defined with Electronics).',
          challenge: 'Moving from engineering estimates to measured figures: characterise the panel on the university SCADA and with batteries on KIOSOL, then quote and justify the panel.',
        },
        {
          area: 'chasis',
          title: 'Structure and monocoque',
          objective: 'Protect the driver in an impact with the lowest possible structural mass.',
          challenge:
            'Defining the fibre lay-up sequence to carry dynamic loads without over-building.',
        },
        {
          area: 'diseno',
          title: 'Cockpit and ergonomics',
          objective:
            'Let the driver handle long stints with good visibility, controls within reach and a bearable temperature.',
          challenge: 'Ventilating the cockpit without hurting the drag coefficient of the fairing.',
        },
        {
          area: 'logistica',
          title: 'Telemetry and operation',
          objective:
            'Bring vehicle data to the race team in real time to decide the speed of every leg.',
          challenge: 'Keeping the link to the vehicle in areas with no cellular coverage.',
        },
      ],
    },
    regulation: {
      eyebrow: 'Regulations',
      title: 'Compliance with the race regulations',
      lead:
        'Every constraint in the regulations, checked against the current vehicle figure and the area that owns it.',
      note:
        'Reference limits for the Challenger class of the Bridgestone World Solar Challenge, to be verified against the current edition of the regulations. Vehicle figures are provisional: they come from the data sheet on this page.',
      columns: {
        requirement: 'Requirement',
        limit: 'Limit',
        current: 'Vehicle',
        margin: 'Margin',
        state: 'Status',
        area: 'Area',
      },
      notApplicable: 'N/A',
      complies: 'Complies',
      exceeds: 'Exceeds',
      rows: {
        arrayArea: 'Solar array area',
        length: 'Overall length',
        width: 'Overall width',
        packMass: 'Battery pack mass',
        egress: 'Unassisted driver egress',
        visibility: 'Driver field of view',
        electrical: 'Electrical safety protocol',
      },
    },
    status: {
      legend: {
        validated: 'Validated',
        simulated: 'In simulation',
        pending: 'To be defined',
      },
    },
  },

  team: {
    hero: {
      title: 'Who builds the car',
      lead:
        'Seven areas with separate responsibilities and a single weekly meeting where they intersect.',
    },
    areasTitle: 'The areas',
    dutiesTitle: 'Responsibilities',
    membersTitle: 'Members',
    memberCount: {
      one: '1 member',
      other: '{{count}} members',
    },
    roles: {
      leader: 'Lead',
      coleader: 'Co-lead',
      member: 'Member',
    },
    socialTitle: 'Links',
    emptyTitle: 'This area has no published members yet',
    emptyBody: 'Profiles appear once the area lead adds them from the internal dashboard.',
    photoPending: 'No profile photo',
    explorer: {
      ringLabel: 'The semillero areas',
      ringPointer: 'Drag to turn the ring, or click a logo to see the area.',
      ringTouch: 'Swipe to turn the ring, or tap a logo to see the area.',
      previous: 'Previous members',
      next: 'More members',
      logLink: 'The area log',
      showBack: 'See the links of {{name}}',
      showFront: 'Back to the photo of {{name}}',
      noLinks: 'No links published yet.',
      newTab: 'opens in a new tab',
      summary: {
        one: '{{areas}} areas and 1 active member',
        other: '{{areas}} areas and {{count}} active members',
      },
      ring: {
        roleDescription: 'carousel',
        previous: 'Turn back',
        next: 'Turn forward',
        pause: 'Pause the carousel',
        play: 'Resume the carousel',
        hintPointer: 'Hover to stop it and use the wheel to turn it. Click a card to flip it.',
        hintTouch: 'Swipe to turn it. Tap a card to flip it.',
      },
    },
    howWeWork: {
      title: 'How we work',
      lead: 'Areas are independent in scope and interdependent in their decisions.',
      controls: {
        group: 'How the semillero works',
        pause: 'Pause the sequence',
        play: 'Resume the sequence',
      },
      items: [
        {
          title: 'One weekly meeting',
          body: 'Every week the seven areas share progress and blockers at a single table.',
        },
        {
          title: 'A closing criterion',
          body: 'Each area publishes what has to happen before a part counts as closed.',
        },
        {
          title: 'Everything is written down',
          body: 'Decisions are documented in the log for the next generation.',
        },
        {
          title: 'Cross review',
          body: 'No subsystem is approved until the area that depends on it reviews it.',
        },
      ],
    },
    faq: {
      title: 'Frequently asked questions',
      items: [
        {
          q: 'How do I reach a specific area?',
          a: 'Write to us from the contact page. The message reaches the Committee, which forwards it to the right area.',
        },
        {
          q: 'Where does each area publish its progress?',
          a: 'In the log. Every entry is signed by the area that did the work, and you can filter by area and by year.',
        },
        {
          q: 'Does buying a membership make me part of the group?',
          a: 'No. A membership is a way to support us: it gives you an account to follow the project and manage your contribution, but it does not make you a team member.',
        },
      ],
    },
  },

  publications: {
    hero: {
      title: 'Log',
      lead:
        'Technical advances, design decisions and validation results, written by the area that produced them.',
    },
    featured: {
      region: 'Featured in the log',
      latest: 'Latest',
      mostRead: 'Most read',
      reads: {
        one: '1 read',
        other: '{{count}} reads',
      },
      read: 'Read the entry',
      pause: 'Pause the featured entries',
      play: 'Resume the featured entries',
    },
    filters: {
      area: 'Area',
      allAreas: 'All areas',
      year: 'Year',
      allYears: 'All years',
      order: 'Order',
      newest: 'Newest first',
      oldest: 'Oldest first',
      searchLabel: 'Search the log',
      searchPlaceholder: 'Topic, component, material or test',
      searchShortcut: 'Press / to search',
      clearSearch: 'Clear the search',
      updating: 'Updating results',
      searchFor: '“{{q}}”',
      clear: 'Clear filters',
      resultCount: {
        one: '1 publication',
        other: '{{count}} publications',
      },
    },
    card: {
      read: 'Read',
      by: 'By',
      pdf: 'Technical PDF',
      team: 'See on Team page',
    },
    emptyTitle: 'No publications yet',
    emptyBody:
      'Once an area lead publishes their first entry from the internal dashboard, it will show up in this list.',
    emptyFilteredTitle: 'No publication matches this filter',
    emptyFilteredBody: 'Try another area or another year.',
    pagination: {
      label: 'Log pagination',
      previous: 'Previous',
      next: 'Next',
      page: 'Page {{page}} of {{total}}',
    },
    detail: {
      coverAlt: 'Cover image for “{{title}}”',
      backToList: 'Back to the log',
      abstract: 'Abstract',
      downloadPdf: 'Download PDF',
      area: 'Area',
      author: 'Author',
      published: 'Published',
      notFoundTitle: 'This publication does not exist',
      notFoundBody: 'The link may be broken or the entry was withdrawn.',
    },
  },

  about: {
    hero: {
      title: 'It started with a race',
      lead:
        'And became the way a group of students learns to build things that work.',
    },
    origin: {
      title: 'What Candelaria is',
      paragraphs: [
        'Candelaria is an interdisciplinary research group at Universidad de los Andes, founded in 2022 around one concrete question: can a group of students design and build a vehicle that runs on sunlight alone.',
        'The short answer is that we are still finding out. The long answer is that finding out turned out to be worth more than the answer, because it forces engineering decisions backed by data and defended in front of six other areas.',
        'Today the group brings together students and alumni from engineering, design and management. Nobody works here for a grade. The deliverable is a car that works.',
      ],
    },
    mission: {
      label: 'Mission',
      title: 'Teach applied engineering with a real deliverable',
      body:
        'Sustain a long-term technical project where every decision is justified by a model, a measurement or a regulation, and where the learning stays at the university when a generation graduates.',
    },
    vision: {
      label: 'Vision',
      title: 'Become a regional reference in university solar mobility',
      body:
        'Reach the starting line of the Bridgestone World Solar Challenge with a vehicle designed and built in Colombia, and leave documented everything it took to get there.',
    },
    identity: {
      eyebrow: 'Identity',
      title: 'How the brand was built',
      lead:
        'One symbol, one palette and two typefaces, set in the Brand Manual v1.0. Every decision has a reason, and here it is.',
      condor: {
        title: 'Why a condor',
        paragraphs: [
          'The Andean condor is Colombia’s national bird and the best-known symbol of the Andes, the mountain range the university is named after.',
          'It is also a glider: it stays aloft for hours on thermal currents, barely flapping its wings. A solar vehicle lives by the same idea, getting the most out of energy it cannot afford to waste.',
        ],
      },
      attributes: [
        { title: 'Cycle', body: 'The condor wraps around itself until it closes a circle: energy that does not stop.' },
        { title: 'Facets', body: 'The planes of the feathers point to technical precision and to the grid of a solar cell.' },
        { title: 'Direction', body: 'The forward gaze speaks of ambition and progress. The circle does not spin in place: it is going somewhere.' },
      ],
      palette: {
        title: 'A palette with proportions',
        lead:
          'The manual does not only set the colours: it sets how much each one weighs in a piece. Gold is an accent, never the lead.',
        swatches: [
          { name: 'Deep purple', hex: '#1E0A29', share: 45, role: 'Identity. The sky before dawn, the canvas for everything.' },
          { name: 'Neutral', hex: '#EFEEEA', share: 30, role: 'Air. Room to read.' },
          { name: 'Gold', hex: '#FFB938', share: 15, role: 'Identity and accent. The sun the car turns into motion.' },
          { name: 'Violet', hex: '#A634DA', share: 6, role: 'Supporting. The glint of a cell in the light.' },
          { name: 'Lavender', hex: '#D4BCFA', share: 4, role: 'Supporting. Softens the contrast.' },
        ],
        areasTitle: 'One condor per area',
        areasBody:
          'Each area uses the same symbol in its own colour, only for internal pieces and always beside its name. Outward, the gold condor is used.',
      },
      type: {
        title: 'Two typographic voices',
        display: 'Sansation speaks in headings: geometric, technical, with an engineering air.',
        text: 'Helvetica Now carries the text: neutral, legible and unadorned, so the data comes first.',
        sample: 'Energy that does not stop',
      },
      note: 'The meanings of the colours are a proposed reading of the manual, pending validation with the Design area.',
    },
    timeline: {
      eyebrow: 'Journey',
      title: 'From a meeting to a vehicle',
      lead: 'The milestones that shaped the group, from the first drawings to the track.',
      provisional: 'Provisional dates and events: the Committee confirms the official record.',
      imagePending: 'Milestone photo · coming soon',
      next: 'Next',
      items: [
        {
          when: '2022',
          title: 'The first meeting',
          body:
            'A group of engineering students organises around one question: can we build a car that runs on sunlight alone? No areas, no processes and almost no budget.',
        },
        {
          when: '2023',
          title: 'Seven areas, one table',
          body:
            'The group splits into Chassis, Cells, Batteries, Design, Logistics, Human Resources and Committee. The weekly meeting where they all cross progress and blockers is born.',
        },
        {
          when: '2024',
          title: 'An identity of its own',
          body:
            'Design publishes the Brand Manual v1.0: the condor closing a circle, the purple and gold palette and the rules that make every piece speak alike.',
        },
        {
          when: '2025',
          title: 'First cells under test',
          body:
            'Cells builds its first test bench and measures sample panels under controlled conditions. The first gaps between model and measurement go into the log.',
        },
        {
          when: '2026',
          title: 'The monocoque takes shape',
          body:
            'Chassis closes the monocoque geometry and starts making the moulds. The website becomes the project’s public log.',
        },
        {
          when: '2027',
          title: 'Getting on track',
          body:
            'Integrate the subsystems, validate the complete vehicle and take it to its first track test. Everything else is subordinate to that.',
          upcoming: true,
        },
      ],
    },
    values: {
      eyebrow: 'Culture code',
      title: 'What is not negotiable',
      lead: 'Five principles that order every meeting, every purchase and every design decision.',
      items: [
        {
          title: 'The fact before the adjective',
          body:
            'A technical claim with no measurement or model behind it does not make it into a presentation or onto this site.',
          tags: 'Model · Measurement · Regulation',
        },
        {
          title: 'Real interdisciplinarity',
          body:
            'Design and management are not support areas. They vote on the decisions that affect their scope.',
          tags: 'Cross review · One vote per area',
        },
        {
          title: 'Safety first',
          body:
            'High voltage, lithium batteries and fibre manufacturing. The protocol is followed before anything is switched on.',
          tags: 'Electrical protocol · Manufacturing',
        },
        {
          title: 'Errors get published',
          body:
            'When a measurement contradicts the model, the gap is documented. That is the part that actually teaches.',
          tags: 'Log · Validation',
        },
        {
          title: 'Knowledge stays',
          body:
            'People rotate every term. What was not written down is lost, so writing it is part of the job.',
          tags: 'Documentation · Generational handover',
        },
      ],
    },
    impact: {
      title: 'The group in numbers',
      lead: 'Counted straight from the site database, not typed in by hand.',
      areas: 'Working areas',
      years: 'Years of activity',
      members: 'Active members',
      careers: 'Degrees represented',
      publications: 'Log entries',
      unavailable: 'No data',
      yearsNote: 'Since 2022; the founding year is still to be confirmed with the Committee.',
    },
    valuesBand: {
      items: ['Innovation', 'Interdisciplinarity', 'Clean energy', 'Rigour'],
      label: 'Values of the group',
    },
    support: {
      title: 'If you want this to move faster',
      body:
        'The group runs on university backing and the effort of its members. A recurring contribution converts directly into components and testing hours.',
      cta: 'See the ways to support',
    },
  },

  support: {
    hero: {
      title: 'What your contribution buys',
      lead:
        'Cells to test, carbon fibre to laminate and hours on track. None of this arrives on enthusiasm alone.',
      primary: 'Choose a membership',
      secondary: 'Sponsorship for companies',
    },
    allocation: {
      title: 'Where the money goes',
      lead: 'Logistics keeps traceability per area and reports it every term.',
      provisional: 'Provisional split',
      provisionalNote:
        'The percentages are a planning reference, not the spending report. They are replaced by the Logistics report every term.',
      centre: 'of the budget',
      chartLabel: 'Budget split by destination',
      items: [
        {
          title: 'Components',
          body: 'Photovoltaic cells, lithium cells, power electronics and instrumentation.',
        },
        {
          title: 'Manufacturing',
          body: 'Carbon fibre, resins, moulds and machine time to build the monocoque.',
        },
        {
          title: 'Validation',
          body: 'Track rental, measurement equipment and transporting the vehicle to tests.',
        },
      ],
    },
    plans: {
      eyebrow: 'Memberships',
      title: 'Recurring support',
      lead:
        'Three levels, named after the attributes of the mark. Cancel whenever you want, no paperwork. A membership is a way to support us: it gives you an account to follow along, it does not make you a member of the group.',
      recommended: 'Most chosen',
      perMonth: 'per month',
      cta: 'Choose this level',
      ctaCurrent: 'Your current membership',
      disabled: 'Not available right now',
      includes: 'Includes',
      processing: 'Opening payment',
    },
    contact: {
      title: 'Institutional sponsorship',
      body:
        'If you represent a company or a faculty and want to contribute materials, services or funding, the Committee answers directly.',
      cta: 'Write to the Committee',
    },
    sponsor: {
      stepsTitle: 'How a partnership works',
      steps: [
        { title: 'You write to us', body: 'Tell us through the form what you would like to contribute and what you expect from the partnership.' },
        { title: 'The Committee builds the proposal', body: 'Funding, materials or services: the proposal is built with you.' },
        { title: 'Traceability', body: 'How the contribution is used goes into the Logistics term report.' },
        { title: 'Agreed visibility', body: 'Your brand on the vehicle and on the group’s pieces, on the agreed terms.' },
      ],
      formTitle: 'Partnership request',
      name: 'Full name',
      organization: 'Company or organisation',
      email: 'Work email',
      modality: 'Type of contribution',
      modalities: {
        economic: 'Funding',
        material: 'Materials or components',
        services: 'Services (manufacturing, testing, transport)',
        academic: 'Academic or research partnership',
        other: 'Other',
      },
      proposal: 'Proposal',
      proposalHint: 'What you would like to contribute and what you expect from the partnership. At least 20 characters.',
      submit: 'Send request',
      submitting: 'Sending',
      success: 'We received your request. The Committee will reply by email.',
    },
  },

  payments: {
    unavailable: 'Payments are temporarily disabled. Please try again later.',
    loginRequiredBody: 'Sign in or create an account to continue with payment.',
  },

  purchases: {
    hero: {
      title: 'Your membership',
      lead: 'Full history of your recurring contributions.',
    },
    membershipTitle: 'Membership',
    noMembershipTitle: 'You have no active membership',
    noMembershipBody: 'A recurring contribution gives continuity to the group budget.',
    noMembershipCta: 'See memberships',
    historyTitle: 'History',
    emptyTitle: 'No movements yet',
    emptyBody: 'Once your first charge is recorded, it will appear here.',
    manage: 'Manage the subscription',
    manageNote: 'Opens the Polar billing portal.',
    columns: {
      date: 'Date',
      concept: 'Concept',
      amount: 'Amount',
      status: 'Status',
      reference: 'Reference',
    },
    status: {
      active: 'Active',
      canceled: 'Cancelled',
      past_due: 'Payment due',
      incomplete: 'Incomplete',
      pending: 'Pending',
      succeeded: 'Completed',
      failed: 'Failed',
      refunded: 'Refunded',
    },
    types: {
      subscription: 'Membership',
    },
    nextBilling: 'Next charge',
  },

  auth: {
    login: {
      title: 'Sign in',
      lead: 'Reach your profile, your contributions and, if you are on the team, the dashboard.',
      email: 'E-mail',
      emailPlaceholder: 'your.name@uniandes.edu.co',
      password: 'Password',
      passwordPlaceholder: 'Your password',
      submit: 'Sign in',
      submitting: 'Signing in',
      forgot: 'Forgot your password?',
      noAccount: 'No account yet?',
      registerLink: 'Create one',
      errors: {
        invalid: 'Wrong e-mail or password.',
        tooMany: 'Too many attempts. Wait a few minutes before trying again.',
        unverified: 'Confirm your e-mail before signing in. Check your inbox.',
        generic: 'We could not start the session. Please try again.',
      },
    },
    register: {
      title: 'Create account',
      lead: 'With an account you can support the group and follow progress from the inside.',
      name: 'Full name',
      namePlaceholder: 'First and last name',
      email: 'E-mail',
      password: 'Password',
      passwordHint: 'At least 12 characters. Use something you are not using elsewhere.',
      confirmPassword: 'Confirm password',
      submit: 'Create account',
      submitting: 'Creating the account',
      hasAccount: 'Already have an account?',
      loginLink: 'Sign in',
      internalNotice:
        'Your e-mail is on the group list. After signing in, complete your member profile.',
      externalNotice:
        'The account is created as external support. If you are on the team, use your institutional e-mail.',
      errors: {
        emailTaken: 'An account with this e-mail already exists.',
        nameRequired: 'Enter your full name.',
        emailInvalid: 'Check the e-mail format.',
        passwordShort: 'The password must be at least 12 characters.',
        passwordWeak: 'Pick a less predictable password.',
        passwordMismatch: 'The passwords do not match.',
        generic: 'We could not create the account. Please try again.',
      },
      success: 'Account created. We sent you an e-mail to confirm the address.',
    },
    forgot: {
      title: 'Reset your password',
      lead: 'Enter your e-mail and we will send a link to set a new one.',
      submit: 'Send the link',
      submitting: 'Sending',
      backToLogin: 'Back to sign in',
      sent: 'If that e-mail has an account, the link is on its way. It expires in one hour.',
    },
    reset: {
      title: 'New password',
      lead: 'Set the password you will sign in with from now on.',
      password: 'New password',
      confirmPassword: 'Confirm the new password',
      submit: 'Save the password',
      submitting: 'Saving',
      success: 'Password updated. You can sign in now.',
      invalidLink: 'The link expired or was already used. Request a new one.',
      errors: {
        generic: 'We could not update the password. Request a new link.',
      },
    },
    verify: {
      title: 'Confirm your e-mail',
      lead:
        'Enter your account e-mail and we will send a confirmation link. Open it from the same device.',
      resend: 'Send the confirmation link',
      resending: 'Sending',
      resent: 'If that e-mail has an account pending confirmation, the link is on its way.',
      error: 'We could not send the e-mail. Please try again in a moment.',
    },
  },

  profile: {
    hero: {
      title: 'Your profile',
      lead: 'Manage your details, your photo and, if you are on the team, your area information.',
    },
    sections: {
      account: 'Account',
      member: 'Member profile',
      links: 'Links',
      supporter: 'Support',
      danger: 'Sign out',
    },
    fields: {
      name: 'Full name',
      email: 'E-mail',
      emailLocked: 'The e-mail cannot be changed from here.',
      area: 'Area',
      areaPlaceholder: 'Select your area',
      career: 'Degree',
      careerPlaceholder: 'Select your degree',
      role: 'Role in the area',
      rolePlaceholder: 'For example: aerodynamic simulation',
      photo: 'Profile photo',
      photoHint: 'JPG, PNG or WebP. 5 MB maximum.',
      photoChange: 'Change the photo',
      cardTitle: 'Your card on the Team page',
      cardHint: 'This is published on the Team page. Leave blank anything you do not want to show.',
      bio: 'Short bio',
      bioHint: 'What you do in the group, in one or two sentences. 280 characters at most.',
      linkedinUrl: 'LinkedIn',
      githubUrl: 'GitHub',
      instagramUrl: 'Instagram',
      websiteUrl: 'Personal website',
      linkError: 'Check the links: they must start with https:// and point at the right platform.',
      bioError: 'The bio cannot be longer than 280 characters.',
    },
    links: {
      platform: 'Platform',
      url: 'Address',
      platformPlaceholder: 'Select a platform',
      urlPlaceholder: 'https://',
      add: 'Add link',
      duplicate: 'You already have a link for that platform.',
      invalidUrl: 'The address must start with https://',
      empty: 'You have not added any links yet.',
    },
    supporter: {
      title: 'Your support level',
      tierLabel: 'Current level',
      totalLabel: 'Contributed so far',
      monthsLabel: 'Months of membership',
      progress: '{{percent}} % towards {{tier}}',
      maxTier: 'You reached the highest level.',
      remaining: '{{amount}} to go for {{tier}}.',
      explain: 'The level is computed from accumulated contributions and months of membership.',
      tiers: {
        visitor: 'Visitor',
        supporter: 'Supporter',
        bronze: 'Bronze',
        silver: 'Silver',
        gold: 'Gold',
        core: 'Core',
      },
    },
    updateSuccess: 'Profile updated.',
    updateError: 'We could not save the changes. Please try again.',
    externalBadge: 'External support',
  },

  dashboard: {
    hero: {
      title: 'Internal dashboard',
      lead: 'Publications and area management. Visible only to members of the group.',
    },
    tabs: {
      publications: 'Publications',
      members: 'Members',
    },
    publications: {
      mine: 'My publications',
      area: 'Area publications',
      create: 'New publication',
      emptyMine: 'You have not published anything yet.',
      emptyArea: 'The area has no publications yet.',
      form: {
        title: 'New publication',
        nameEs: 'Spanish title',
        nameEn: 'English title',
        abstractEs: 'Spanish abstract',
        abstractEn: 'English abstract',
        pdf: 'PDF file',
        pdfHint: 'PDF only. 10 MB maximum.',
        image: 'Cover image',
        imageHint: 'JPG, PNG or WebP. 5 MB maximum.',
        submit: 'Publish',
        submitting: 'Publishing',
      },
      created: 'Publication created.',
      createError: 'We could not create the publication.',
      deleted: 'Publication deleted.',
      deleteError: 'We could not delete the publication.',
      confirmDelete: 'This permanently removes the publication.',
    },
    members: {
      title: 'Area members',
      invite: 'Invite by e-mail',
      inviteLabel: 'Person e-mail',
      inviteRole: 'Initial role',
      inviteSubmit: 'Send invitation',
      invited: 'Invitation recorded. The person can create their account now.',
      inviteError: 'We could not record this invitation.',
      inviteDomainError: 'You can only invite institutional e-mail addresses (allowed domain).',
      remove: 'Revoke access',
      removed: 'Access revoked.',
      removeError: 'We could not revoke the access.',
      confirmRemove: 'The person loses dashboard access and stops appearing on the team page.',
      promote: 'Make co-lead',
      demote: 'Remove co-lead',
      transfer: 'Transfer the lead',
      confirmTransfer: 'You will stop being the area lead. This does not revert on its own.',
      onlyLeader: 'Only the area lead can do this.',
      updated: 'Change applied.',
      updateError: 'We could not apply the change.',
    },
    noAreaTitle: 'Your account has no area assigned',
    noAreaBody: 'Ask your area lead to add you from this same dashboard.',
  },

  contact: {
    routes: [
      {
        title: 'Sponsorship and partnerships',
        body: 'For companies and institutions: there is a dedicated form with the type of contribution.',
        href: '/support#patrocinio-bloque',
        cta: 'Go to the partnership form',
      },
      {
        title: 'Technical progress',
        body: 'Before writing, check the log: every area publishes its results there.',
        href: '/publications',
        cta: 'Open the log',
      },
      {
        title: 'Memberships',
        body: 'If you already support the project, your account shows your membership and the billing portal.',
        href: '/purchases',
        cta: 'See my membership',
      },
    ],
    hero: {
      title: 'Write to us',
      lead: 'The message reaches the right area. We reply on working days.',
    },
    topicLabel: 'Topic',
    topics: {
      general: 'General enquiry',
      rrhh: 'Human Resources',
      comite: 'Sponsorship or partnership',
      prensa: 'Press',
    },
    name: 'Your name',
    email: 'Your e-mail',
    message: 'Message',
    messageHint: 'Tell us in a few lines what you need.',
    submit: 'Send',
    submitting: 'Sending',
    success: 'Message sent. We will reply to this address.',
    error: 'We could not send the message. Please try again in a moment.',
    rateLimited: 'Too many messages in a row. Wait a few minutes.',
  },

  legal: {
    privacyTitle: 'Privacy',
    termsTitle: 'Terms of use',
    updated: 'Last updated',
  },

  notFound: {
    title: 'This page does not exist',
    lead: 'The link may be broken or the page moved.',
    cta: 'Back to home',
    secondary: 'See the publications',
  },

  error: {
    title: 'Something failed on our side',
    lead: 'The error was logged. Reload the page or try again in a moment.',
    cta: 'Reload',
  },
};
