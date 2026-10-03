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

  nav: {
    home: 'Home',
    vehicle: 'Vehicle',
    team: 'Team',
    publications: 'Publications',
    about: 'About',
    support: 'Support',
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
      title: 'Energy that never stops',
      lead:
        'An interdisciplinary research group at Universidad de los Andes. We design, build and validate a competition solar vehicle.',
      primary: 'See the vehicle',
      secondary: 'Meet the group',
      isotipoAlt: 'Candelaria Solar Car institutional mark: a condor closing a circle',
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
    areas: {
      eyebrow: 'Structure',
      title: 'Seven areas, one vehicle',
      lead: 'Each area owns a part of the problem and publishes its own closing criterion.',
      cta: 'See the full team',
      hint: 'Swipe to see every area',
    },
    method: {
      title: 'How a decision moves',
      lead:
        'No part reaches the car without clearing these three filters. The order is not negotiable.',
      steps: [
        {
          verb: 'Model',
          body:
            'A proposal starts as a model with written assumptions. If it cannot be simulated, it cannot be discussed.',
        },
        {
          verb: 'Build',
          body:
            'We manufacture the smallest part or subsystem that lets us measure something real, not the final version.',
        },
        {
          verb: 'Validate',
          body:
            'We compare the measurement against the model. The gap gets documented and published, even when it stings.',
        },
      ],
    },
    updates: {
      eyebrow: 'Log',
      title: 'The latest we published',
      lead: 'Technical advances and project decisions, written by the area responsible for them.',
      cta: 'All publications',
      emptyTitle: 'No publications yet',
      emptyBody:
        'Area leads publish from the internal dashboard. The first entry will show up right here.',
    },
    values: {
      items: ['Innovation', 'Interdisciplinarity', 'Clean energy', 'Rigour'],
      label: 'Values of the group',
    },
    support: {
      title: 'Today the project is funded between all of us',
      body:
        'Universidad de los Andes backs the group and its members carry the rest. A recurring contribution changes how fast we can validate.',
      cta: 'Support the project',
    },
    institutional: {
      label: 'Backed by',
    },
  },

  vehicle: {
    hero: {
      title: 'Vehicle architecture',
      lead:
        'Four subsystems sharing one energy budget. Improving one at the expense of another does not count as an improvement.',
      viewerLabel: 'Schematic three-dimensional model of a Challenger-class solar vehicle',
      viewerHint: 'Drag to rotate the model',
      viewerLoading: 'Loading the model',
      viewerDisclaimer:
        'A schematic model of the class, not of the Candelaria vehicle. It is replaced by the real model once Chassis closes the exterior geometry.',
      targetLabel: 'Competition target',
      target: 'Bridgestone World Solar Challenge, Challenger class',
    },
    subsystems: {
      title: 'What each subsystem solves',
      lead: 'Every block has an owner, a closing criterion and a date.',
      items: [
        {
          area: 'celdas',
          title: 'Solar capture',
          body:
            'The photovoltaic array and the radiation model that estimates how much energy arrives on each leg of the route.',
        },
        {
          area: 'baterias',
          title: 'Storage and traction',
          body:
            'The cell pack, the drivetrain and the management system deciding when to deliver power and when to hold it.',
        },
        {
          area: 'chasis',
          title: 'Structure and aerodynamics',
          body:
            'The monocoque that carries everything else, and the outer shape that sets how much energy is lost to the air.',
        },
        {
          area: 'logistica',
          title: 'Telemetry and operation',
          body:
            'On-board instrumentation and the trackside procedure that turns data into a race decision.',
        },
      ],
    },
    status: {
      eyebrow: 'Technical status',
      title: 'What is closed and what is not',
      lead:
        'We publish figures only once the owning area closes its validation. Until then the status is shown as it is.',
      note:
        'Rows marked as pending are filled from the internal dashboard when the area publishes its measurement.',
      legend: {
        validated: 'Validated',
        simulated: 'In simulation',
        pending: 'To be defined',
      },
      groups: [
        {
          title: 'Structure',
          rows: [
            { label: 'Monocoque architecture', state: 'simulated' },
            { label: 'Target chassis mass', state: 'pending' },
            { label: 'Drag coefficient', state: 'simulated' },
          ],
        },
        {
          title: 'Energy',
          rows: [
            { label: 'Solar array layout', state: 'simulated' },
            { label: 'Measured array efficiency', state: 'pending' },
            { label: 'Battery pack capacity', state: 'pending' },
          ],
        },
        {
          title: 'Operation',
          rows: [
            { label: 'Electrical safety protocol', state: 'validated' },
            { label: 'On-board instrumentation', state: 'simulated' },
            { label: 'Race strategy', state: 'pending' },
          ],
        },
      ],
    },
    constraints: {
      title: 'The rules we did not choose',
      body:
        'Competition regulations fix the available solar area, the vehicle dimensions and the cockpit safety requirements. The whole design moves inside that margin.',
      cta: 'See who builds each part',
    },
  },

  team: {
    hero: {
      title: 'Who builds the car',
      lead:
        'Seven areas with separate responsibilities and a single weekly meeting where they intersect.',
    },
    areasTitle: 'The areas',
    dutiesTitle: 'What it owns',
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
    filterAll: 'All areas',
    join: {
      title: 'Applications open every term',
      body:
        'Human Resources publishes the missing profiles at the start of each academic period. You do not need to be an engineer.',
      cta: 'Write to Human Resources',
    },
  },

  publications: {
    hero: {
      title: 'Publications',
      lead:
        'Technical advances, design decisions and validation results, written by the area that produced them.',
    },
    filters: {
      title: 'Filter',
      area: 'Area',
      allAreas: 'All areas',
      year: 'Year',
      allYears: 'All years',
      apply: 'Apply',
      clear: 'Clear filters',
      resultCount: {
        one: '1 publication',
        other: '{{count}} publications',
      },
    },
    card: {
      read: 'Read',
      by: 'By',
    },
    emptyTitle: 'No publications yet',
    emptyBody:
      'Once an area lead publishes their first entry from the internal dashboard, it will show up in this list.',
    emptyFilteredTitle: 'No publication matches this filter',
    emptyFilteredBody: 'Try another area or another year.',
    pagination: {
      previous: 'Previous',
      next: 'Next',
      page: 'Page {{page}} of {{total}}',
    },
    detail: {
      backToList: 'Back to publications',
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
      title: 'It started as a race',
      lead:
        'It ended up being how a group of students learns to build things that actually work.',
    },
    origin: {
      title: 'What Candelaria is',
      paragraphs: [
        'Candelaria is an interdisciplinary research group at Universidad de los Andes, formed in 2022 around one concrete question: whether a group of students can design and build a vehicle that moves on sunlight alone.',
        'The short answer is that we are still finding out. The long answer is that finding out turned out to be worth more than the answer, because it forces engineering decisions backed by data and defended in front of six other areas.',
        'Today the group brings together students and alumni from engineering, design and management. Nobody works here for a grade. The deliverable is a car that works.',
      ],
    },
    mission: {
      label: 'Mission',
      title: 'Teach applied engineering with a real deliverable',
      body:
        'Sustain a long-horizon technical project where every decision is justified by a model, a measurement or a regulation, and where the learning stays in the university after a cohort graduates.',
    },
    vision: {
      label: 'Vision',
      title: 'Become a regional reference in university solar mobility',
      body:
        'Reach the starting line of the Bridgestone World Solar Challenge with a vehicle designed and built in Colombia, and leave a written record of everything it took.',
    },
    chapters: {
      eyebrow: 'Timeline',
      title: 'Three chapters',
      items: [
        {
          when: '2022',
          title: 'The origin',
          body:
            'A group of students organises to compete. There are no areas, no processes and almost no budget.',
        },
        {
          when: 'Today',
          title: 'Seven areas, one vehicle',
          body:
            'The area structure separates responsibilities and puts decisions in writing. The vehicle design advances subsystem by subsystem.',
        },
        {
          when: 'Next',
          title: 'Reach the track',
          body:
            'Close the validation of each subsystem, integrate them and take the car to competition. Everything else is subordinate to that.',
        },
      ],
    },
    values: {
      title: 'What is not negotiable',
      items: [
        {
          title: 'The fact before the adjective',
          body:
            'A technical claim with no measurement or model behind it does not enter a presentation, or this website.',
        },
        {
          title: 'Real interdisciplinarity',
          body:
            'Design and management are not support functions. They hold a vote on decisions affecting their scope.',
        },
        {
          title: 'Safety first',
          body:
            'High voltage, lithium cells and composite manufacturing. The protocol is met before anything is switched on.',
        },
        {
          title: 'Mistakes get published',
          body:
            'When a measurement contradicts the model, the gap is documented. That is the part that actually teaches.',
        },
        {
          title: 'Knowledge stays',
          body:
            'People rotate every term. Whatever was not written down is lost, so writing it down is part of the job.',
        },
      ],
    },
    support: {
      title: 'If you want this to move faster',
      body:
        'The group runs on university backing and the effort of its members. A recurring contribution converts directly into components and testing hours.',
      cta: 'See how to support',
    },
  },

  support: {
    hero: {
      title: 'What your contribution buys',
      lead:
        'Cells to test, carbon fibre to laminate and hours on track. None of this arrives on enthusiasm alone.',
      primary: 'Choose a membership',
    },
    allocation: {
      title: 'Where the money goes',
      lead: 'Logistics keeps traceability per area and reports it every term.',
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
        'Three levels, named after the attributes of the mark. Cancel whenever you want, no paperwork.',
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
    hero: {
      title: 'Write to us',
      lead: 'The message reaches the right area. We reply on working days.',
    },
    topicLabel: 'Topic',
    topics: {
      general: 'General enquiry',
      rrhh: 'I want to join the group',
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
