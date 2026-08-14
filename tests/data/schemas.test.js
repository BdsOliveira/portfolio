/**
 * Data integrity (FR-045, data-model.md validation rules 1–8).
 *
 * Binds to the schemas, never to values — changing a project title must not touch this file.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { SCHEMAS, validateEntity, validateCollection } from '../schemas/index.js';

import profile from '../../js/data/profile.js';
import projects from '../../js/data/projects.js';
import skills from '../../js/data/skills.js';
import certifications from '../../js/data/certifications.js';
import experiences from '../../js/data/experiences.js';
import education from '../../js/data/education.js';
import philosophy from '../../js/data/philosophy.js';
import community from '../../js/data/community.js';

const REPO_ROOT = fileURLToPath(new URL('../../', import.meta.url));
const options = { assetExists: (path) => existsSync(`${REPO_ROOT}${path}`) };

const COLLECTIONS = [
  ['projects', projects, SCHEMAS.WorkEntry],
  ['skills', skills, SCHEMAS.SkillGroup],
  ['certifications', certifications, SCHEMAS.Certification],
  ['experiences', experiences, SCHEMAS.Experience],
  ['education', education, SCHEMAS.Education],
  ['philosophy', philosophy, SCHEMAS.Principle],
  ['community', community, SCHEMAS.CommunityActivity],
];

describe('data integrity', () => {
  test('profile validates against the Profile schema', () => {
    const errors = validateEntity(profile, SCHEMAS.Profile, options);
    assert.deepEqual(errors, []);
  });

  for (const [name, collection, schema] of COLLECTIONS) {
    test(`${name} validates against the ${schema.name} schema`, () => {
      assert.deepEqual(validateCollection(collection, schema, options), []);
    });
  }

  test('js/data modules export data only — no DOM access, no side effects', async () => {
    const { readFileSync } = await import('node:fs');
    const files = [
      'profile.js',
      'projects.js',
      'skills.js',
      'certifications.js',
      'experiences.js',
      'education.js',
      'philosophy.js',
      'community.js',
    ];

    // Comments are prose about the data, not code. Strip them so the word "document" in a
    // sentence cannot fail a check that is about what the module executes.
    const stripComments = (source) =>
      source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

    for (const file of files) {
      const source = stripComments(readFileSync(`${REPO_ROOT}js/data/${file}`, 'utf8'));

      assert.doesNotMatch(source, /\bdocument\b/, `${file} touches the DOM`);
      assert.doesNotMatch(source, /\bwindow\b/, `${file} touches the DOM`);
      assert.doesNotMatch(source, /\bfetch\s*\(/, `${file} performs I/O`);
      assert.doesNotMatch(source, /^import\s/m, `${file} imports another module`);
      assert.doesNotMatch(source, /\bfunction\b|=>/, `${file} contains logic`);
    }
  });

  describe('the schemas actually reject bad data', () => {
    test('rejects a missing required field', () => {
      const errors = validateCollection([{ id: 'probe' }], SCHEMAS.SkillGroup, options);
      assert.ok(errors.some((error) => error.includes('name')));
    });

    test('rejects a non-kebab-case id', () => {
      const errors = validateCollection(
        [{ id: 'Not Kebab', name: 'X', skills: ['Y'] }],
        SCHEMAS.SkillGroup,
        options,
      );
      assert.ok(errors.some((error) => error.includes('kebab-case')));
    });

    test('rejects a duplicate id', () => {
      const entry = { id: 'probe', name: 'X', skills: ['Y'] };
      const errors = validateCollection([entry, { ...entry }], SCHEMAS.SkillGroup, options);
      assert.ok(errors.some((error) => error.includes('duplicate id')));
    });

    test('rejects a plain http: URL', () => {
      const errors = validateCollection(
        [
          {
            id: 'probe',
            title: 'X',
            description: 'Y',
            technologies: ['Z'],
            isVisible: true,
            liveUrl: 'http://18.231.162.74:3000/projects',
          },
        ],
        SCHEMAS.WorkEntry,
        options,
      );
      assert.ok(errors.some((error) => error.includes('https:')));
    });

    // `technologies` is optional now (FR-021), but declaring the key and leaving it empty is a
    // data mistake rather than a state: omit the key instead. Optional *object* lists differ —
    // `metrics: []` and no `metrics` genuinely mean the same thing (contract CM3-4).
    test('rejects a declared-but-empty technologies array', () => {
      const errors = validateCollection(
        [{ id: 'probe', title: 'X', description: 'Y', technologies: [], isVisible: true }],
        SCHEMAS.WorkEntry,
        options,
      );
      assert.ok(errors.some((error) => error.includes('technologies')));
    });

    test('rejects an asset path that does not exist', () => {
      const errors = validateCollection(
        [
          {
            id: 'probe',
            title: 'X',
            description: 'Y',
            technologies: ['Z'],
            isVisible: true,
            image: 'assets/images/definitely-not-here.webp',
            imageAlt: 'probe',
          },
        ],
        SCHEMAS.WorkEntry,
        options,
      );
      assert.ok(errors.some((error) => error.includes('does not exist')));
    });

    /**
     * Evidence is self-hosted by definition, so the ways it goes wrong are a source that is not
     * ours, a path pointing at nothing, and a missing accessible name or reserved box. Each is
     * caught here rather than on a rendered page nobody re-reads.
     */
    const certificationWith = (evidence) => [
      { id: 'probe', title: 'X', icon: 'icon-trophy', evidence },
    ];

    test('rejects certification evidence hosted outside assets/', () => {
      const errors = validateCollection(
        certificationWith({
          src: 'https://www.instagram.com/p/probe/',
          alt: 'probe',
          width: 800,
          height: 600,
        }),
        SCHEMAS.Certification,
        options,
      );
      assert.ok(errors.some((error) => error.includes('under assets/')));
    });

    test('rejects certification evidence whose file is not in the repository', () => {
      const errors = validateCollection(
        certificationWith({
          src: 'assets/images/definitely-not-here.webp',
          alt: 'probe',
          width: 800,
          height: 600,
        }),
        SCHEMAS.Certification,
        options,
      );
      assert.ok(errors.some((error) => error.includes('does not exist')));
    });

    test('rejects certification evidence without alt text', () => {
      const errors = validateCollection(
        certificationWith({ src: 'assets/images/probe.webp', width: 800, height: 600 }),
        SCHEMAS.Certification,
        { assetExists: () => true },
      );
      assert.ok(errors.some((error) => error.includes('alt')));
    });

    test('rejects certification evidence without intrinsic dimensions', () => {
      const errors = validateCollection(
        certificationWith({ src: 'assets/images/probe.webp', alt: 'probe' }),
        SCHEMAS.Certification,
        { assetExists: () => true },
      );
      assert.ok(errors.some((error) => error.includes('width')));
      assert.ok(errors.some((error) => error.includes('height')));
    });

    test('rejects image without imageAlt', () => {
      const errors = validateCollection(
        [
          {
            id: 'probe',
            title: 'X',
            description: 'Y',
            technologies: ['Z'],
            isVisible: true,
            image: 'assets/images/probe.webp',
          },
        ],
        SCHEMAS.WorkEntry,
        { assetExists: () => true },
      );
      assert.ok(errors.some((error) => error.includes('imageAlt')));
    });

    test('rejects a future experienceStartYear', () => {
      const errors = validateEntity(
        { ...profile, experienceStartYear: new Date().getFullYear() + 1 },
        SCHEMAS.Profile,
        options,
      );
      assert.ok(errors.some((error) => error.includes('future')));
    });

    test('rejects an endDate that precedes startDate', () => {
      const errors = validateCollection(
        [{ id: 'probe', company: 'X', title: 'Y', startDate: '2023-05', endDate: '2022-01' }],
        SCHEMAS.Experience,
        options,
      );
      assert.ok(errors.some((error) => error.includes('precedes')));
    });
  });

  /**
   * An empty collection is the *shipped* state of Selected Work and Community (FR-025, FR-038),
   * not an error state. Asserted for every schema rather than for those two, so a future
   * collection cannot acquire an accidental "must not be empty" rule (contract S3-5, FR-049).
   */
  describe('an empty collection is valid for every schema', () => {
    for (const schema of Object.values(SCHEMAS)) {
      test(`${schema.name}`, () => {
        assert.deepEqual(validateCollection([], schema, options), []);
      });
    }
  });

  /**
   * The two field types added by this feature, pinned before any entity uses them.
   * Deliberately validated against ad-hoc schemas: these test the *validator*, and binding them
   * to a real entity would make them fail for unrelated reasons when that entity changes.
   */
  describe('the number and object field types', () => {
    const numeric = { name: 'Probe', kind: 'object', fields: { value: { type: 'number', required: true } } };

    test('number accepts zero — the case a truthiness check gets wrong (FR-036)', () => {
      assert.deepEqual(validateEntity({ value: 0 }, numeric, options), []);
    });

    test('number accepts a fractional value', () => {
      assert.deepEqual(validateEntity({ value: 4.5 }, numeric, options), []);
    });

    test('number rejects NaN and Infinity', () => {
      assert.ok(validateEntity({ value: NaN }, numeric, options).length > 0);
      assert.ok(validateEntity({ value: Infinity }, numeric, options).length > 0);
    });

    test('number rejects a numeric string', () => {
      assert.ok(validateEntity({ value: '3' }, numeric, options).length > 0);
    });

    test('object validates a singular nested entity against its schema', () => {
      const schema = {
        name: 'Probe',
        kind: 'object',
        fields: { nested: { type: 'object', required: true, of: 'SocialLink' } },
      };

      const valid = {
        nested: { platform: 'X', url: 'https://example.com', icon: 'icon-x', label: 'X profile' },
      };
      assert.deepEqual(validateEntity(valid, schema, options), []);

      const invalid = { nested: { platform: 'X', url: 'https://example.com', icon: 'icon-x' } };
      assert.ok(validateEntity(invalid, schema, options).some((error) => error.includes('label')));
    });

    test('an optional object[] may be an empty array', () => {
      // A community activity with `metrics: []` and one with no `metrics` key mean the same
      // thing, and the renderer emits nothing for either (contract CM3-4).
      const schema = {
        name: 'Probe',
        kind: 'object',
        fields: { list: { type: 'object[]', required: false, of: 'SocialLink' } },
      };
      assert.deepEqual(validateEntity({ list: [] }, schema, options), []);
    });
  });

  /**
   * These pass today. They are regression guards, not new capability: each one pins a
   * permissiveness that real CV data depends on and that a well-meaning tightening would
   * silently remove.
   */
  describe('the schemas accept data the CV actually contains', () => {
    test('accepts an Experience whose startDate is in the future (contract E2-4)', () => {
      // A confirmed role can begin next month. `maxCurrentYear` is declared only on
      // Profile.experienceStartYear, and the ordering check skips a null endDate — so this
      // validates. Adding a future-date rejection here would break a true statement.
      const errors = validateCollection(
        [
          {
            id: 'probe',
            company: 'X',
            title: 'Y',
            startDate: `${new Date().getFullYear() + 1}-03`,
            endDate: null,
          },
        ],
        SCHEMAS.Experience,
        options,
      );
      assert.deepEqual(errors, []);
    });

    test('accepts an Experience without a location', () => {
      const errors = validateCollection(
        [{ id: 'probe', company: 'X', title: 'Y', startDate: '2020-01', endDate: null }],
        SCHEMAS.Experience,
        options,
      );
      assert.deepEqual(errors, []);
    });

    test('accepts an Education entry with no years at all', () => {
      // The CV dates neither qualification. Requiring a year would force invented data.
      const errors = validateCollection(
        [{ id: 'probe', institution: 'X', qualification: 'Y' }],
        SCHEMAS.Education,
        options,
      );
      assert.deepEqual(errors, []);
    });

    test('accepts an Education entry with endYear null and no startYear', () => {
      // "In progress, start not stated" — the MBA. Distinct from "no years at all", which
      // means "completed, year not stated".
      const errors = validateCollection(
        [{ id: 'probe', institution: 'X', qualification: 'Y', endYear: null }],
        SCHEMAS.Education,
        options,
      );
      assert.deepEqual(errors, []);
    });
  });
});
