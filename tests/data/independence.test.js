/**
 * Content independence (SC-012, FR-046, quickstart V13).
 *
 * The constitution requires tests bound to contracts, not to values: editing a project title
 * must never mean editing a test. This suite proves that two ways —
 *
 *   1. structurally: rendering mutated content produces an identical DOM shape;
 *   2. statically: no contract test file contains a literal from js/data/.
 *
 * tests/data/parity.test.js is exempt by design — it exists precisely to assert that specific
 * pre-migration values survived the migration, and is documented as such.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';

import { renderProjects } from '../../js/components/projects.js';
import { renderSkills } from '../../js/components/skills.js';
import { renderCertifications } from '../../js/components/certifications.js';
import { renderExperience } from '../../js/components/experience.js';
import { renderEducation } from '../../js/components/education.js';

import * as fixtures from '../fixtures/index.js';

import profile from '../../js/data/profile.js';
import projects from '../../js/data/projects.js';
import skills from '../../js/data/skills.js';
import certifications from '../../js/data/certifications.js';

const REPO_ROOT = fileURLToPath(new URL('../../', import.meta.url));
const newDoc = () => parseHTML('<!DOCTYPE html><html><body></body></html>').document;

/** Keys that identify or wire content rather than display it — mutating them proves nothing. */
const STRUCTURAL_KEYS = new Set(['id', 'icon', 'platform', 'repositoryUrl', 'liveUrl', 'image']);

function mutate(value, key) {
  if (typeof value === 'string') {
    return STRUCTURAL_KEYS.has(key) ? value : `${value} [conteúdo alterado]`;
  }
  if (Array.isArray(value)) return value.map((item) => mutate(item, key));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, mutate(v, k)]));
  }
  return value;
}

/** The DOM's shape: tags, nesting, and attribute *names*. Deliberately blind to text. */
function shapeOf(node) {
  if (node.nodeType === 3) return '#text';
  if (!node.tagName) return [...node.childNodes].map(shapeOf).join(',');

  const attributes = [...node.attributes]
    .map((attribute) => attribute.name)
    .sort()
    .join('|');

  return `${node.tagName}[${attributes}](${[...node.childNodes].map(shapeOf).join(',')})`;
}

const COMPONENTS = [
  ['projects', renderProjects, fixtures.projects],
  ['skills', renderSkills, fixtures.skills],
  ['certifications', renderCertifications, fixtures.certifications],
  ['experience', renderExperience, fixtures.experiences],
  ['education', renderEducation, fixtures.education],
];

describe('tests bind to contracts, not to content values', () => {
  for (const [name, render, data] of COMPONENTS) {
    test(`${name}: mutating every displayed string leaves the DOM shape identical`, () => {
      const original = shapeOf(render(structuredClone(data), newDoc()));
      const mutated = shapeOf(render(mutate(structuredClone(data), null), newDoc()));

      assert.equal(mutated, original, `${name} renders a different structure for other content`);
    });

    test(`${name}: adding an entry adds structure without changing it`, () => {
      const grown = [...structuredClone(data), structuredClone(data[0])];

      const before = render(structuredClone(data), newDoc());
      const after = render(grown, newDoc());

      assert.equal(
        after.firstChild.children.length,
        before.firstChild.children.length + 1,
        `${name} did not grow by exactly one item`,
      );
    });
  }

  test('no contract test file contains a literal from js/data/', () => {
    const values = new Set();
    const collect = (value, key) => {
      if (typeof value === 'string' && !STRUCTURAL_KEYS.has(key) && value.trim().length > 3) {
        values.add(value);
      } else if (Array.isArray(value)) value.forEach((item) => collect(item, key));
      else if (value && typeof value === 'object') {
        for (const [k, v] of Object.entries(value)) collect(v, k);
      }
    };

    collect(profile, null);
    collect(projects, null);
    collect(skills, null);
    collect(certifications, null);

    // parity.test.js is the documented exception; fixtures hold their own invented content.
    const files = readdirSync(`${REPO_ROOT}tests/unit`)
      .filter((file) => file.endsWith('.test.js'))
      .map((file) => `tests/unit/${file}`)
      .concat(
        readdirSync(`${REPO_ROOT}tests/data`)
          .filter((file) => file.endsWith('.test.js') && file !== 'parity.test.js')
          .map((file) => `tests/data/${file}`),
      );

    const coupled = [];
    for (const file of files) {
      const source = readFileSync(`${REPO_ROOT}${file}`, 'utf8');
      for (const value of values) {
        if (source.includes(value)) coupled.push(`${file} hardcodes "${value}"`);
      }
    }

    assert.deepEqual(coupled, [], 'a contract test is coupled to portfolio content');
  });

  test('fixtures are invented content, never the real portfolio data', () => {
    // Compare values, not source text: "Git" is a real skill and a substring of "GitHub",
    // which a naive source scan would flag forever.
    const fixtureValues = new Set();
    const collect = (value) => {
      if (typeof value === 'string') fixtureValues.add(value);
      else if (Array.isArray(value)) value.forEach(collect);
      else if (value && typeof value === 'object') Object.values(value).forEach(collect);
    };
    collect(Object.values(fixtures));

    const real = [
      profile.name,
      profile.role,
      profile.summary,
      ...projects.map((project) => project.title),
      ...skills.flatMap((group) => [group.name, ...group.skills]),
      ...certifications.map((entry) => entry.title),
    ];

    const reused = real.filter((value) => fixtureValues.has(value));
    assert.deepEqual(reused, [], 'fixtures reuse real portfolio content');
  });

  test('component modules read no data module directly (FR-010)', () => {
    for (const file of readdirSync(`${REPO_ROOT}js/components`)) {
      const source = readFileSync(`${REPO_ROOT}js/components/${file}`, 'utf8');
      assert.doesNotMatch(source, /from\s+['"][^'"]*\/data\//, `${file} imports its own content`);
    }
  });
});
