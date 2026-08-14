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

const REPO_ROOT = fileURLToPath(new URL('../../', import.meta.url));
const options = { assetExists: (path) => existsSync(`${REPO_ROOT}${path}`) };

const COLLECTIONS = [
  ['projects', projects, SCHEMAS.Project],
  ['skills', skills, SCHEMAS.SkillGroup],
  ['certifications', certifications, SCHEMAS.Certification],
  ['experiences', experiences, SCHEMAS.Experience],
  ['education', education, SCHEMAS.Education],
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
        SCHEMAS.Project,
        options,
      );
      assert.ok(errors.some((error) => error.includes('https:')));
    });

    test('rejects an empty technologies array', () => {
      const errors = validateCollection(
        [{ id: 'probe', title: 'X', description: 'Y', technologies: [], isVisible: true }],
        SCHEMAS.Project,
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
        SCHEMAS.Project,
        options,
      );
      assert.ok(errors.some((error) => error.includes('does not exist')));
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
        SCHEMAS.Project,
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
