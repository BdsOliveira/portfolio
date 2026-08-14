/**
 * Sample content for the component contract tests.
 *
 * Deliberately fictional. Tests bind to these fixtures and to contracts/components.md — never
 * to the real portfolio data (FR-046, SC-012), so editing js/data/ can never break a test.
 */

export const profile = {
  name: 'Fixture Person',
  role: 'Fixture Role',
  summary: 'Fixture summary sentence.',
  experienceStartYear: 2022,
  location: 'Fixture City',
  email: 'fixture@example.com',
  socialLinks: [
    {
      platform: 'GitHub',
      url: 'https://github.com/fixture',
      icon: 'icon-github',
      label: 'Fixture Person no GitHub',
    },
    {
      platform: 'LinkedIn',
      url: 'https://www.linkedin.com/in/fixture/',
      icon: 'icon-linkedin',
      label: 'Fixture Person no LinkedIn',
    },
  ],
};

/** Start year in the future — renderHero must throw (contract hero.js). */
export const profileFutureStart = { ...profile, experienceStartYear: new Date().getFullYear() + 1 };

/** Required field absent — renderHero must throw naming the field. */
export const profileMissingStartYear = (() => {
  const { experienceStartYear, ...rest } = profile;
  return rest;
})();

export const projects = [
  {
    id: 'fixture-alpha',
    title: 'Fixture Alpha',
    description: 'First fixture project.',
    technologies: ['Alpha', 'Beta', 'Gamma'],
    repositoryUrl: 'https://github.com/fixture/alpha',
    liveUrl: 'https://alpha.example.com',
    isVisible: true,
  },
  {
    id: 'fixture-beta',
    title: 'Fixture Beta',
    description: 'Second fixture project.',
    technologies: ['Delta', 'Epsilon'],
    isVisible: true,
  },
];

/** Exactly one technology — must render exactly one chip, never a fixed five. */
export const projectSingleTechnology = [
  {
    id: 'fixture-solo',
    title: 'Fixture Solo',
    description: 'Uses one technology.',
    technologies: ['Only'],
    isVisible: true,
  },
];

/** Optional fields absent — no empty link nodes may be produced. */
export const projectNoLinks = [
  {
    id: 'fixture-linkless',
    title: 'Fixture Linkless',
    description: 'No repository and no live deployment.',
    technologies: ['Alpha'],
    isVisible: true,
  },
];

/** Hidden entry — filtered before anything else; siblings reflow with no gap. */
export const projectsWithHidden = [
  ...projects,
  {
    id: 'fixture-hidden',
    title: 'Fixture Hidden',
    description: 'Should never appear.',
    technologies: ['Zeta'],
    isVisible: false,
  },
];

/** Every entry hidden — the component must return null, not an empty list. */
export const projectsAllHidden = [
  {
    id: 'fixture-hidden-only',
    title: 'Fixture Hidden Only',
    description: 'Should never appear.',
    technologies: ['Zeta'],
    isVisible: false,
  },
];

/** Required field absent — render must throw naming entity, field, and id. */
export const projectMissingTitle = [
  {
    id: 'fixture-broken',
    description: 'Has no title.',
    technologies: ['Alpha'],
    isVisible: true,
  },
];

export const projectWithImage = [
  {
    id: 'fixture-imaged',
    title: 'Fixture Imaged',
    description: 'Has a preview image.',
    technologies: ['Alpha'],
    image: 'assets/images/fixture.webp',
    imageAlt: 'Captura de tela do Fixture Imaged',
    isVisible: true,
  },
];

export const skills = [
  { id: 'fixture-group-one', name: 'Fixture Group One', skills: ['One', 'Two', 'Three'] },
  { id: 'fixture-group-two', name: 'Fixture Group Two', skills: ['Four'] },
];

export const certifications = [
  {
    id: 'fixture-cert-full',
    title: 'Fixture Certificate',
    issuer: 'Fixture Institute',
    detail: 'Fixture detail line',
    icon: 'icon-trophy',
    verificationUrl: 'https://example.com/verify/fixture',
  },
  {
    id: 'fixture-cert-minimal',
    title: 'Fixture Minimal Certificate',
    icon: 'icon-certificate',
  },
];

export const experiences = [
  {
    id: 'fixture-job-past',
    company: 'Fixture Corp',
    title: 'Fixture Engineer',
    location: 'Fixture Town, FX · Remoto',
    startDate: '2020-01',
    endDate: '2022-06',
    summary: 'Fixture summary.',
    achievements: ['Fixture achievement one', 'Fixture achievement two'],
  },
  {
    // No `location` — proves the field is genuinely optional (contract E2-2).
    id: 'fixture-job-current',
    company: 'Fixture Labs',
    title: 'Senior Fixture Engineer',
    startDate: '2022-07',
    endDate: null,
  },
];

/**
 * A role that starts after today and has not ended (contract E2-4).
 *
 * Derived from the current date rather than a literal so it never quietly becomes a past date
 * and stops testing what it was written to test.
 */
export const experienceFutureStart = [
  {
    id: 'fixture-job-future',
    company: 'Fixture Futures',
    title: 'Incoming Fixture Engineer',
    location: 'Fixture Bay, FX · Presencial',
    startDate: `${new Date().getFullYear() + 1}-03`,
    endDate: null,
  },
];

export const education = [
  {
    id: 'fixture-degree-complete',
    institution: 'Fixture University',
    qualification: 'Bacharelado em Fixture',
    field: 'Fixture Science',
    startYear: 2015,
    endYear: 2019,
  },
  {
    id: 'fixture-degree-ongoing',
    institution: 'Fixture Institute',
    qualification: 'Pós-graduação em Fixture',
    startYear: 2024,
    endYear: null,
  },
];

/**
 * The remaining date cases from contract D2-2, which `education` above does not reach.
 *
 * The fourth is the one that matters: a completed qualification whose years were never
 * recorded must render no date at all. Rendering it as "Em andamento" would be a false
 * statement, and that is exactly what collapsing "unknown" into null produces.
 */
export const educationDateCases = [
  {
    id: 'fixture-degree-start-only',
    institution: 'Fixture Polytechnic',
    qualification: 'Curso de Fixture',
    startYear: 2018,
    // no endYear at all — started, end not recorded
  },
  {
    id: 'fixture-degree-ongoing-undated',
    institution: 'Fixture Academy',
    qualification: 'Especialização em Fixture',
    endYear: null, // in progress, start not recorded
  },
  {
    id: 'fixture-degree-undated',
    institution: 'Fixture College',
    qualification: 'Técnico em Fixture',
    // neither year — completed, nothing recorded
  },
];

/** The empty-collection path, exercised by every collection component (research R8). */
export const emptyCollection = [];
