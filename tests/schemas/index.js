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

  Profile: {
    name: 'Profile',
    kind: 'object',
    fields: {
      name: { type: 'string', required: true },
      role: { type: 'string', required: true },
      summary: { type: 'string', required: true },
      experienceStartYear: { type: 'integer', required: true, maxCurrentYear: true },
      location: { type: 'string', required: false },
      image: { type: 'asset', required: false },
      imageAlt: { type: 'string', required: false, requiredWith: 'image' },
      email: { type: 'email', required: false },
      socialLinks: { type: 'object[]', required: true, of: 'SocialLink' },
    },
  },

  Project: {
    name: 'Project',
    kind: 'collection',
    fields: {
      id: { type: 'id', required: true },
      title: { type: 'string', required: true },
      description: { type: 'string', required: true },
      technologies: { type: 'string[]', required: true },
      repositoryUrl: { type: 'url', required: false },
      liveUrl: { type: 'url', required: false },
      image: { type: 'asset', required: false },
      imageAlt: { type: 'string', required: false, requiredWith: 'image' },
      isVisible: { type: 'boolean', required: true },
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

    if (rule.type === 'object[]') {
      if (!Array.isArray(value) || value.length === 0) {
        errors.push(`${label}.${field}: expected a non-empty array`);
        continue;
      }
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
