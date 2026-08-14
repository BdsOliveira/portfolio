/**
 * Entity schemas for the data-integrity suite (data-model.md).
 *
 * These live in tests/ rather than js/data/ deliberately (research R9): js/data/ holds content
 * only, and no validator should ever be shipped to a visitor.
 */

const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const YEAR_MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Field types. Each returns an error string, or null when the value is acceptable.
 * `required` emptiness is checked before these run, so they only see present values.
 */
const TYPES = {
  string: (v) => (typeof v === 'string' ? null : `expected a string, got ${typeof v}`),
  integer: (v) => (Number.isInteger(v) ? null : `expected an integer, got ${JSON.stringify(v)}`),
  // Distinct from `integer`: a metric may legitimately be fractional ("4.5 eventos por mês").
  // Rejects NaN and Infinity, which `typeof v === 'number'` alone would let through.
  number: (v) =>
    typeof v === 'number' && Number.isFinite(v)
      ? null
      : `expected a finite number, got ${JSON.stringify(v)}`,
  boolean: (v) => (typeof v === 'boolean' ? null : `expected a boolean, got ${typeof v}`),
  'string[]': (v) => {
    if (!Array.isArray(v)) return `expected an array, got ${typeof v}`;
    if (v.length === 0) return 'expected a non-empty array';
    const bad = v.findIndex((item) => typeof item !== 'string' || item.trim() === '');
    return bad === -1 ? null : `entry ${bad} is not a non-empty string`;
  },
  id: (v) => {
    if (typeof v !== 'string') return `expected a string, got ${typeof v}`;
    return KEBAB.test(v) ? null : `"${v}" is not kebab-case`;
  },
  url: (v) => {
    if (typeof v !== 'string') return `expected a string, got ${typeof v}`;
    let parsed;
    try {
      parsed = new URL(v);
    } catch {
      return `"${v}" is not an absolute URL`;
    }
    // http: is rejected outright: the site is served over HTTPS and mixed content is blocked.
    return parsed.protocol === 'https:' ? null : `"${v}" must use https:, got ${parsed.protocol}`;
  },
  asset: (v) => {
    if (typeof v !== 'string') return `expected a string, got ${typeof v}`;
    if (!v.startsWith('assets/')) return `"${v}" must be a repo-relative path under assets/`;
    return null;
  },
  email: (v) => {
    if (typeof v !== 'string') return `expected a string, got ${typeof v}`;
    return EMAIL.test(v) ? null : `"${v}" is not a valid email address`;
  },
  'year-month': (v) => {
    if (typeof v !== 'string') return `expected a string, got ${typeof v}`;
    return YEAR_MONTH.test(v) ? null : `"${v}" is not YYYY-MM`;
  },
};

/** Fields declared `nullable` accept an explicit null as a meaningful value. */
export const SCHEMAS = {
  SocialLink: {
    name: 'SocialLink',
    kind: 'object',
    fields: {
      platform: { type: 'string', required: true },
      url: { type: 'url', required: true },
      icon: { type: 'string', required: true },
      label: { type: 'string', required: true },
    },
  },

  /**
   * A call to action. `href` is a plain string, not `url`: the primary call to action points at
   * `#contact`, and `mailto:` is a legitimate destination too. Typing it as `url` would reject
   * both and force the data to lie about where the button goes.
   */
  Cta: {
    name: 'Cta',
    kind: 'object',
    fields: {
      label: { type: 'string', required: true },
      href: { type: 'string', required: true },
    },
  },

  Profile: {
    name: 'Profile',
    kind: 'object',
    fields: {
      name: { type: 'string', required: true },
      role: { type: 'string', required: true },
      // The positioning statement. Whether it states professional value rather than a generic
      // self-description (FR-012) is a review gate — no schema can tell the difference between
      // a claim and a platitude.
      headline: { type: 'string', required: true },
      summary: { type: 'string', required: true },
      // One entry per paragraph. An array rather than one blob so index.html can mirror it
      // paragraph by paragraph and sync.test.js can compare them individually.
      about: { type: 'string[]', required: true },
      availability: { type: 'string', required: false },
      experienceStartYear: { type: 'integer', required: true, maxCurrentYear: true },
      location: { type: 'string', required: false },
      image: { type: 'asset', required: false },
      imageAlt: { type: 'string', required: false, requiredWith: 'image' },
      email: { type: 'email', required: false },
      // Optional, and absent today: the owner has not supplied a CV link. Every affordance
      // pointing at one is removed while it stays absent (FR-041, contract I3-2).
      cvUrl: { type: 'url', required: false },
      primaryCta: { type: 'object', required: true, of: 'Cta' },
      secondaryCta: { type: 'object', required: true, of: 'Cta' },
      socialLinks: { type: 'object[]', required: true, of: 'SocialLink' },
    },
  },

  /**
   * One piece of showcased engineering, presented as a case study — the "Selected Work" section
   * (FR-019). Formerly `Project`; the module it validates is still js/data/projects.js, whose
   * constitution-mandated filename does not change with the presentation (research R6).
   *
   * Only `title` and `description` are required (FR-021). `technologies` and `isVisible` were
   * required under the old schema and are now optional: an entry carrying nothing but a title
   * and a description must render correctly, and an absent `isVisible` means visible.
   */
  WorkEntry: {
    name: 'WorkEntry',
    kind: 'collection',
    fields: {
      id: { type: 'id', required: true },
      title: { type: 'string', required: true },
      description: { type: 'string', required: true },
      tagline: { type: 'string', required: false },
      // The five case-study parts. Each renders as a labelled <dt>/<dd> pair when present and
      // produces nothing at all when absent (FR-022, FR-023, contract W3-3/W3-4).
      problem: { type: 'string', required: false },
      solution: { type: 'string', required: false },
      // Named `contribution`, not `role`, so it can never be confused with Profile.role.
      contribution: { type: 'string', required: false },
      architecture: { type: 'string', required: false },
      result: { type: 'string', required: false },
      technologies: { type: 'string[]', required: false },
      repositoryUrl: { type: 'url', required: false },
      liveUrl: { type: 'url', required: false },
      caseStudyUrl: { type: 'url', required: false },
      image: { type: 'asset', required: false },
      imageAlt: { type: 'string', required: false, requiredWith: 'image' },
      isVisible: { type: 'boolean', required: false },
    },
  },

  /**
   * One stated position on how the owner approaches engineering — the "Como Trabalho" section.
   *
   * Whether a principle is concrete enough that a reader could disagree with it (FR-030) is a
   * review gate, not a schema rule: no validator distinguishes a position from a platitude.
   */
  Principle: {
    name: 'Principle',
    kind: 'collection',
    fields: {
      id: { type: 'id', required: true },
      title: { type: 'string', required: true },
      detail: { type: 'string', required: false },
    },
  },

  /** A named destination. Shared shape; used by CommunityActivity today. */
  Link: {
    name: 'Link',
    kind: 'object',
    fields: {
      // Must identify where it goes without relying on surrounding context (FR-059).
      label: { type: 'string', required: true },
      url: { type: 'url', required: true },
    },
  },

  /**
   * One countable fact about a community activity.
   *
   * `value` is `number`, not `integer`: "4.5 eventos por mês" is a real shape. **Zero is a real
   * value** and must validate and render — every presence check on it tests `=== undefined`,
   * never truthiness (FR-036).
   *
   * FR-037 — no metric may be estimated, rounded, extrapolated or invented — is a governance
   * rule this schema cannot enforce. A fabricated number is well-formed. The empty shipped
   * collection is what enforces it today.
   */
  Metric: {
    name: 'Metric',
    kind: 'object',
    fields: {
      value: { type: 'number', required: true },
      // What is counted. FR-035 requires both halves: a bare number states nothing.
      unit: { type: 'string', required: true },
    },
  },

  CommunityActivity: {
    name: 'CommunityActivity',
    kind: 'collection',
    fields: {
      id: { type: 'id', required: true },
      organisation: { type: 'string', required: true },
      // Named as in WorkEntry, so it can never be confused with Profile.role.
      contribution: { type: 'string', required: true },
      // Free text, deliberately not `year-month`: community involvement is usually stated in
      // years or as ongoing, and demanding a month would compel an invented date (FR-037).
      period: { type: 'string', required: false },
      description: { type: 'string', required: false },
      links: { type: 'object[]', required: false, of: 'Link' },
      metrics: { type: 'object[]', required: false, of: 'Metric' },
    },
  },

  SkillGroup: {
    name: 'SkillGroup',
    kind: 'collection',
    fields: {
      id: { type: 'id', required: true },
      name: { type: 'string', required: true },
      skills: { type: 'string[]', required: true },
    },
  },

  /**
   * A self-hosted artefact shown inline beneath the claim it supports — a photo of the medal,
   * a scan of the certificate. One composite rather than four loose `evidence*` fields on
   * Certification: `src` without `alt` is inaccessible and `src` without intrinsic dimensions
   * shifts the layout as it loads (contract C-8), so all four travel together or not at all.
   *
   * `width`/`height` are the image's intrinsic pixel size, not its display size. CSS scales it
   * down; these only reserve the right box before the bytes arrive.
   */
  EvidenceImage: {
    name: 'EvidenceImage',
    kind: 'object',
    fields: {
      src: { type: 'asset', required: true },
      alt: { type: 'string', required: true },
      width: { type: 'integer', required: true },
      height: { type: 'integer', required: true },
    },
  },

  /**
   * `verificationUrl` and `evidence` are deliberately different things, not two spellings of
   * one. `verificationUrl` points at the issuer's own record — a third party confirming the
   * claim, so it is a link that says "Verificar". `evidence` is an artefact authored by the
   * claimant: it must not borrow that word, and it is shown rather than linked, because a link
   * out of the page asks the reader to leave in order to see three lines' worth of proof.
   * Typed `asset`, so evidence lives in this repository, where it cannot rot, move behind a
   * login, or change under us.
   */
  Certification: {
    name: 'Certification',
    kind: 'collection',
    fields: {
      id: { type: 'id', required: true },
      title: { type: 'string', required: true },
      issuer: { type: 'string', required: false },
      detail: { type: 'string', required: false },
      icon: { type: 'string', required: true },
      verificationUrl: { type: 'url', required: false },
      evidence: { type: 'object', required: false, of: 'EvidenceImage' },
    },
  },

  Experience: {
    name: 'Experience',
    kind: 'collection',
    fields: {
      id: { type: 'id', required: true },
      company: { type: 'string', required: true },
      title: { type: 'string', required: true },
      // Work-location context: city, region/country, and remote vs on-site. A dedicated field
      // rather than prose inside `summary` — remote-vs-on-site is what a recruiter filters on,
      // so it has to be addressable (FR-008).
      location: { type: 'string', required: false },
      startDate: { type: 'year-month', required: true },
      endDate: { type: 'year-month', required: true, nullable: true },
      summary: { type: 'string', required: false },
      achievements: { type: 'string[]', required: false },
    },
  },

  Education: {
    name: 'Education',
    kind: 'collection',
    fields: {
      id: { type: 'id', required: true },
      institution: { type: 'string', required: true },
      qualification: { type: 'string', required: true },
      field: { type: 'string', required: false },
      // Both years optional. `endYear` is three-state and the distinction is load-bearing:
      //   absent  → the CV does not state it        → no date rendered
      //   null    → in progress                     → "Em andamento"
      //   integer → completed in that year          → the year
      // Collapsing "unknown" into null would render a completed course as still in progress —
      // the schema would compel a false statement about the owner.
      startYear: { type: 'integer', required: false },
      endYear: { type: 'integer', required: false, nullable: true },
    },
  },
};

function isEmpty(value) {
  return (
    value === undefined ||
    (typeof value === 'string' && value.trim() === '') ||
    (Array.isArray(value) && value.length === 0)
  );
}

/**
 * Validate one entity against a schema.
 *
 * @param {object} entity
 * @param {object} schema
 * @param {object} [options]
 * @param {(path: string) => boolean} [options.assetExists] resolves `asset` paths against the repo
 * @returns {string[]} human-readable errors; empty means valid
 */
export function validateEntity(entity, schema, options = {}) {
  const errors = [];
  const label = `${schema.name}[${entity?.id ?? '?'}]`;

  if (entity === null || typeof entity !== 'object' || Array.isArray(entity)) {
    return [`${label}: expected an object`];
  }

  for (const [field, rule] of Object.entries(schema.fields)) {
    const value = entity[field];
    const absent = value === undefined || (value === null && !rule.nullable);

    if (absent || (isEmpty(value) && rule.required)) {
      if (rule.required) errors.push(`${label}.${field}: required field is missing or empty`);
      continue;
    }
    if (value === undefined) continue;
    if (value === null && rule.nullable) continue;

    if (rule.requiredWith && entity[rule.requiredWith] === undefined) {
      errors.push(`${label}.${field}: present without "${rule.requiredWith}"`);
    }

    // Singular composite. `object[]` already existed; Profile's two calls to action are one
    // object each, not a list, and forcing them into a single-element array to reuse `object[]`
    // would make the data lie about its own shape.
    if (rule.type === 'object') {
      for (const error of validateEntity(value, SCHEMAS[rule.of], options)) {
        errors.push(`${label}.${field} → ${error}`);
      }
      continue;
    }

    if (rule.type === 'object[]') {
      if (!Array.isArray(value)) {
        errors.push(`${label}.${field}: expected an array, got ${typeof value}`);
        continue;
      }
      // An empty array is a legal state for an *optional* list: a community activity with no
      // metrics and one with `metrics: []` mean the same thing, and the renderer emits nothing
      // for either (contract CM3-4). Only a required list may not be empty — and that case is
      // already caught above by `isEmpty(value) && rule.required`.
      if (value.length === 0) continue;
      value.forEach((item, index) => {
        for (const error of validateEntity(item, SCHEMAS[rule.of], options)) {
          errors.push(`${label}.${field}[${index}] → ${error}`);
        }
      });
      continue;
    }

    const typeError = TYPES[rule.type]?.(value);
    if (typeError) {
      errors.push(`${label}.${field}: ${typeError}`);
      continue;
    }

    if (rule.type === 'asset' && options.assetExists && !options.assetExists(value)) {
      errors.push(`${label}.${field}: asset "${value}" does not exist in the repository`);
    }

    if (rule.maxCurrentYear && value > new Date().getFullYear()) {
      errors.push(`${label}.${field}: ${value} is in the future`);
    }
  }

  // Conditional requirement: imageAlt must accompany image (data-model rule 6).
  for (const [field, rule] of Object.entries(schema.fields)) {
    if (!rule.requiredWith) continue;
    const companion = entity[rule.requiredWith];
    if (companion !== undefined && companion !== null && isEmpty(entity[field])) {
      errors.push(`${label}.${field}: required because "${rule.requiredWith}" is present`);
    }
  }

  return errors;
}

/**
 * Validate a collection: every entity, plus unique ids and any cross-field date ordering.
 *
 * @param {object[]} collection
 * @param {object} schema
 * @param {object} [options]
 * @returns {string[]}
 */
export function validateCollection(collection, schema, options = {}) {
  if (!Array.isArray(collection)) return [`${schema.name}: expected an array`];

  const errors = [];
  const seen = new Set();

  for (const entity of collection) {
    errors.push(...validateEntity(entity, schema, options));

    const id = entity?.id;
    if (typeof id === 'string') {
      if (seen.has(id)) errors.push(`${schema.name}: duplicate id "${id}"`);
      seen.add(id);
    }

    // Date ordering (data-model rule 8). null endDate means ongoing, which always orders.
    if (schema.fields.endDate && typeof entity?.startDate === 'string' && entity.endDate) {
      if (entity.endDate < entity.startDate) {
        errors.push(`${schema.name}[${id}]: endDate ${entity.endDate} precedes startDate ${entity.startDate}`);
      }
    }
    if (schema.fields.endYear && Number.isInteger(entity?.startYear) && Number.isInteger(entity?.endYear)) {
      if (entity.endYear < entity.startYear) {
        errors.push(`${schema.name}[${id}]: endYear ${entity.endYear} precedes startYear ${entity.startYear}`);
      }
    }
  }

  return errors;
}
