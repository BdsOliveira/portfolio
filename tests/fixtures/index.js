/**
 * Sample content for the component contract tests.
 *
 * Deliberately fictional. Tests bind to these fixtures and to contracts/components.md — never
 * to the real portfolio data (FR-046, SC-012), so editing js/data/ can never break a test.
 */

export const profile = {
  name: 'Fixture Person',
  role: 'Fixture Role',
  headline: 'Fixture positioning statement about value.',
  summary: 'Fixture summary sentence.',
  about: ['Fixture about paragraph one.', 'Fixture about paragraph two.'],
  availability: 'Fixture availability statement',
  experienceStartYear: 2022,
  location: 'Fixture City',
  email: 'fixture@example.com',
  // `cvUrl` deliberately absent — it mirrors the shipped state, where every CV affordance is
  // pruned rather than rendered inert (contract I3-2).
  primaryCta: { label: 'Fixture primary action', href: '#contact' },
  secondaryCta: { label: 'Fixture secondary action', href: 'https://github.com/fixture' },
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

/** No availability stated — the Hero must render nothing in its place (FR-013). */
export const profileNoAvailability = (() => {
  const { availability, ...rest } = profile;
  return rest;
})();

/** A CV link exists — every affordance pointing at one must survive pruning (contract I3-2). */
export const profileWithCv = { ...profile, cvUrl: 'https://example.com/fixture-cv.pdf' };

/**
 * WorkEntry fixtures — the Selected Work section.
 *
 * The shipped collection is empty (FR-025), so these are the *only* exercise the populated path
 * ever gets. Thin coverage here would not fail anything until the owner supplies real case
 * studies, which is exactly when a defect costs most (research R11, plan.md risk 4).
 */
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

/** Every field populated — the full case study (contract W3-3). */
export const projectFullCaseStudy = [
  {
    id: 'fixture-complete',
    title: 'Fixture Complete',
    description: 'A fixture carrying every supported field.',
    tagline: 'Fixture tagline line.',
    problem: 'Fixture problem statement.',
    solution: 'Fixture solution statement.',
    contribution: 'Fixture contribution statement.',
    architecture: 'Fixture architecture statement.',
    result: 'Fixture result statement.',
    technologies: ['Alpha', 'Beta'],
    repositoryUrl: 'https://github.com/fixture/complete',
    liveUrl: 'https://complete.example.com',
    caseStudyUrl: 'https://blog.example.com/fixture-complete',
    image: 'assets/images/fixture.webp',
    imageAlt: 'Captura de tela do Fixture Complete',
    isVisible: true,
  },
];

/**
 * The two required fields and nothing else (contract W3-1, FR-021).
 *
 * Note the absent `isVisible`: it must render, because only an explicit `false` hides an entry
 * (contract W3-2).
 */
export const projectMinimal = [
  {
    id: 'fixture-minimal',
    title: 'Fixture Minimal',
    description: 'Carries only the two required fields.',
  },
];

/** Every optional field this entry could carry, for the per-field omission sweep below. */
export const WORK_OPTIONAL_FIELDS = [
  'tagline',
  'problem',
  'solution',
  'contribution',
  'architecture',
  'result',
  'technologies',
  'repositoryUrl',
  'liveUrl',
  'caseStudyUrl',
  'image',
  'imageAlt',
  'isVisible',
];

/**
 * The full case study with exactly one optional field removed, once per field (SC-005).
 *
 * Generated rather than hand-written so a field added to the schema cannot be quietly left
 * untested — add it to WORK_OPTIONAL_FIELDS and the sweep covers it.
 *
 * `image`/`imageAlt` are dropped together when either is named: `imageAlt` without `image` is
 * meaningless, and the schema rejects `image` without `imageAlt`.
 */
export const projectWithoutField = (field) => {
  const entry = { ...projectFullCaseStudy[0], id: `fixture-sans-${field.toLowerCase()}` };

  delete entry[field];
  if (field === 'image' || field === 'imageAlt') {
    delete entry.image;
    delete entry.imageAlt;
  }

  return [entry];
};

/** None of the five case-study parts — the card must contain no <dl> at all (contract W3-5). */
export const projectNoCaseStudy = [
  {
    id: 'fixture-no-parts',
    title: 'Fixture No Parts',
    description: 'Has a description but no case-study parts.',
    technologies: ['Alpha'],
  },
];

/** Two of the five parts. The three absent ones must leave no orphaned label or separator. */
export const projectPartialCaseStudy = [
  {
    id: 'fixture-partial',
    title: 'Fixture Partial',
    description: 'Carries problem and result but neither solution nor architecture.',
    problem: 'Fixture problem statement.',
    result: 'Fixture result statement.',
  },
];

/** Every case-study key present but declared out of order — render order must not follow it. */
export const projectPartsOutOfOrder = [
  {
    id: 'fixture-shuffled',
    title: 'Fixture Shuffled',
    description: 'Declares the case-study parts in the wrong order.',
    result: 'Fixture result statement.',
    architecture: 'Fixture architecture statement.',
    contribution: 'Fixture contribution statement.',
    solution: 'Fixture solution statement.',
    problem: 'Fixture problem statement.',
  },
];

/** Only a case-study link — proves each link type stands alone (contract W3-7). */
export const projectCaseStudyLinkOnly = [
  {
    id: 'fixture-case-study-link',
    title: 'Fixture Case Study Link',
    description: 'Reachable only through its written case study.',
    caseStudyUrl: 'https://blog.example.com/fixture-case-study',
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

/**
 * CommunityActivity fixtures.
 *
 * Like Selected Work, the shipped collection is empty (FR-038), so these are the only exercise
 * the populated path gets (research R11).
 */
export const community = [
  {
    id: 'fixture-user-group',
    organisation: 'Fixture User Group',
    contribution: 'Fixture organiser',
    period: '2021 – atual',
    description: 'Fixture description of the involvement.',
    links: [{ label: 'Site do Fixture User Group', url: 'https://fixture-group.example.com' }],
    metrics: [
      { value: 240, unit: 'membros' },
      { value: 12, unit: 'encontros organizados' },
    ],
  },
  {
    // Required fields only — every optional one absent at once.
    id: 'fixture-mentorship',
    organisation: 'Fixture Mentorship',
    contribution: 'Fixture mentor',
  },
];

/**
 * A zero-valued metric. THE case a truthiness check gets wrong (FR-036, contract CM3-5).
 *
 * `0` is a real measurement — "zero incidentes", "zero talks este ano" — and must render. If a
 * test using this fixture passes against an implementation written as `if (metric.value)`, the
 * test is wrong, not the code.
 */
export const communityZeroMetric = [
  {
    id: 'fixture-zero-metric',
    organisation: 'Fixture Zero',
    contribution: 'Fixture contributor',
    metrics: [{ value: 0, unit: 'palestras este ano' }],
  },
];

/** Metrics declared but empty — must be indistinguishable from having none (contract CM3-4). */
export const communityEmptyMetrics = [
  {
    id: 'fixture-empty-metrics',
    organisation: 'Fixture Empty',
    contribution: 'Fixture contributor',
    metrics: [],
    links: [],
  },
];

/** No period — no dangling label may be produced (contract CM3-3). */
export const communityNoPeriod = [
  {
    id: 'fixture-no-period',
    organisation: 'Fixture Undated',
    contribution: 'Fixture contributor',
    description: 'Involvement whose period was never recorded.',
    metrics: [{ value: 3, unit: 'projetos' }],
  },
];

/** Links but no metrics, and metrics but no links — each list stands alone. */
export const communityLinksOnly = [
  {
    id: 'fixture-links-only',
    organisation: 'Fixture Links',
    contribution: 'Fixture contributor',
    links: [
      { label: 'Repositório do Fixture Links', url: 'https://github.com/fixture/links' },
      { label: 'Blog do Fixture Links', url: 'https://blog.example.com/fixture-links' },
    ],
  },
];

/** Required field absent — render must throw naming entity, field and id. */
export const communityMissingContribution = [
  { id: 'fixture-community-broken', organisation: 'Fixture Broken' },
];

/** Principle fixtures — the Engineering Philosophy section. */
export const principles = [
  { id: 'fixture-principle-one', title: 'Fixture Principle One', detail: 'Fixture principle detail.' },
  // No `detail` — must render as a title alone, with no empty body element (contract PH3-3).
  { id: 'fixture-principle-two', title: 'Fixture Principle Two' },
];

/** Every entry lacks its optional detail — no empty body may appear anywhere. */
export const principlesNoDetail = [
  { id: 'fixture-principle-bare', title: 'Fixture Principle Bare' },
];

/** Required field absent — render must throw naming entity, field and id. */
export const principleMissingTitle = [{ id: 'fixture-principle-broken', detail: 'Has no title.' }];

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
