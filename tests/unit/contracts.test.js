/**
 * Universal component contracts C-1 … C-12 (contracts/components.md).
 *
 * Every component is held to all of them. Adding a component means adding one row to
 * COMPONENTS below and nothing else.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

import { renderHero } from '../../js/components/hero.js';
import { renderProjects } from '../../js/components/projects.js';
import { renderSkills } from '../../js/components/skills.js';
import { renderCertifications } from '../../js/components/certifications.js';
import { renderExperience } from '../../js/components/experience.js';
import { renderEducation } from '../../js/components/education.js';
import { renderPhilosophy } from '../../js/components/philosophy.js';
import { renderCommunity } from '../../js/components/community.js';
import { renderTalks } from '../../js/components/talks.js';
import { renderCopyrightYear } from '../../js/components/identity.js';

import { createDocument, mountFragment, REPO_ROOT } from './_setup.js';
import * as fixtures from '../fixtures/index.js';

const DOCUMENT_FRAGMENT_NODE = 11;

const COMPONENTS = [
  { name: 'hero', file: 'hero.js', render: renderHero, data: fixtures.profile, collection: false },
  { name: 'projects', file: 'projects.js', render: renderProjects, data: fixtures.projects, collection: true },
  { name: 'skills', file: 'skills.js', render: renderSkills, data: fixtures.skills, collection: true },
  {
    name: 'certifications',
    file: 'certifications.js',
    render: renderCertifications,
    data: fixtures.certifications,
    collection: true,
  },
  {
    name: 'experience',
    file: 'experience.js',
    render: renderExperience,
    data: fixtures.experiences,
    collection: true,
  },
  {
    name: 'education',
    file: 'education.js',
    render: renderEducation,
    data: fixtures.education,
    collection: true,
  },
  {
    name: 'philosophy',
    file: 'philosophy.js',
    render: renderPhilosophy,
    data: fixtures.principles,
    collection: true,
  },
  {
    name: 'community',
    file: 'community.js',
    render: renderCommunity,
    data: fixtures.community,
    collection: true,
  },
  {
    name: 'talks',
    file: 'talks.js',
    render: renderTalks,
    data: fixtures.talks,
    collection: true,
  },
  {
    // Not a section: it derives the footer year. Its other export, pruneOptionalIdentity,
    // removes nodes rather than producing them and is covered by tests/unit/identity.test.js.
    name: 'identity',
    file: 'identity.js',
    render: renderCopyrightYear,
    data: fixtures.profile,
    collection: false,
  },
];

/**
 * Modules under js/components/ that carry no renderer at all, and so cannot be held to the
 * universal render contracts.
 *
 * Enumerated rather than pattern-matched: the point of the coverage check below is that a new
 * component cannot appear without someone deciding which list it belongs in. See the plan's
 * Complexity Tracking entry for why interaction behaviour lives in this directory.
 */
const BEHAVIOUR_MODULES = ['helpers.js', 'navigation.js'];

/**
 * Comments are prose *about* the code, not code. A module's header explaining that it renders
 * the "Como Trabalho" section is documentation; flagging it as hardcoded content would push
 * every component towards being undocumented, which is the opposite of what C-3 is for.
 *
 * tests/data/schemas.test.js strips comments for the same reason.
 */
const stripComments = (source) =>
  source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

const sourceOf = (file) => stripComments(readFileSync(`${REPO_ROOT}js/components/${file}`, 'utf8'));

function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const item of Object.values(value)) deepFreeze(item);
  }
  return value;
}

describe('universal component contracts', () => {
  test('every component module is covered by this table or declared behaviour-only', () => {
    const modules = readdirSync(`${REPO_ROOT}js/components`)
      .filter((file) => file.endsWith('.js') && !BEHAVIOUR_MODULES.includes(file))
      .sort();

    assert.deepEqual(modules, COMPONENTS.map((component) => component.file).sort());
  });

  for (const component of COMPONENTS) {
    describe(component.name, () => {
      const render = () => {
        const doc = createDocument();
        return { doc, fragment: component.render(component.data, doc) };
      };

      test('C-1 makes no network call and reads no globals', () => {
        const source = sourceOf(component.file);

        assert.doesNotMatch(source, /\bfetch\s*\(/, 'component performs a network call');
        assert.doesNotMatch(source, /XMLHttpRequest/, 'component performs a network call');
        assert.doesNotMatch(source, /(^|[^.\w])document\s*\./, 'component reads the global document');
        assert.doesNotMatch(source, /(^|[^.\w])window\s*\./, 'component reads the global window');
        assert.doesNotMatch(source, /(^|[^.\w])globalThis\b/, 'component reads globalThis');
        assert.doesNotMatch(source, /localStorage|sessionStorage/, 'component touches storage');
      });

      test('C-1 does not mutate the data it is given', () => {
        const doc = createDocument();
        const frozen = deepFreeze(structuredClone(component.data));
        const before = JSON.stringify(frozen);

        component.render(frozen, doc);

        assert.equal(JSON.stringify(frozen), before);
      });

      test('C-2 returns a DocumentFragment and never touches the live document', () => {
        const { doc, fragment } = render();

        assert.equal(fragment.nodeType, DOCUMENT_FRAGMENT_NODE);
        assert.equal(doc.body.childNodes.length, 0, 'component appended to the document itself');
      });

      test('C-3 embeds no literal portfolio content', () => {
        const source = sourceOf(component.file);
        for (const value of literalContentValues()) {
          assert.ok(
            !source.includes(value),
            `component hardcodes the content string "${value}" — it must come from data`,
          );
        }
      });

      test('C-7 sets text via textContent, never innerHTML', () => {
        const source = sourceOf(component.file);

        assert.doesNotMatch(source, /innerHTML/);
        assert.doesNotMatch(source, /outerHTML/);
        assert.doesNotMatch(source, /insertAdjacentHTML/);
      });

      test('C-9 every icon is aria-hidden or carries an accessible name', () => {
        const { doc, fragment } = render();
        const host = mountFragment(doc, fragment);

        for (const svg of host.querySelectorAll('svg')) {
          const hidden = svg.getAttribute('aria-hidden') === 'true';
          const named = Boolean(svg.getAttribute('aria-label') || svg.querySelector('title'));
          assert.ok(hidden || named, 'svg is neither hidden nor named');
        }
      });

      test('C-10 interactive elements are <a> or <button>, never styled divs', () => {
        const { doc, fragment } = render();
        const host = mountFragment(doc, fragment);

        for (const node of host.querySelectorAll('[onclick], [role="button"], [role="link"]')) {
          assert.ok(
            ['A', 'BUTTON'].includes(node.tagName),
            `${node.tagName} is used as an interactive control`,
          );
        }
        for (const link of host.querySelectorAll('a')) {
          assert.ok(link.getAttribute('href'), 'anchor without href is not focusable');
        }
      });

      test('C-11 uses <h3> for items and never emits <h1>, <h2> or a skipped level', () => {
        const { doc, fragment } = render();
        const host = mountFragment(doc, fragment);

        assert.equal(host.querySelectorAll('h1').length, 0);
        assert.equal(host.querySelectorAll('h2').length, 0);
        assert.equal(host.querySelectorAll('h5, h6').length, 0);
        if (host.querySelectorAll('h4').length > 0) {
          assert.ok(host.querySelectorAll('h3').length > 0, '<h4> used without an <h3> above it');
        }
      });

      if (component.collection) {
        test('C-4 returns null for an empty collection', () => {
          const doc = createDocument();
          assert.equal(component.render([], doc), null);
        });

        test('C-6 throws on a missing required field', () => {
          const doc = createDocument();
          assert.throws(() => component.render([{ id: 'contract-probe' }], doc), /contract-probe/);
        });

        test('C-12 renders repeated items as <ul>/<li>', () => {
          const { doc, fragment } = render();
          const host = mountFragment(doc, fragment);

          const items = host.querySelectorAll('li');
          assert.ok(items.length >= component.data.length, 'repeated items are not list items');
          for (const item of items) {
            assert.equal(item.parentElement.tagName, 'UL', '<li> outside a <ul>');
          }
        });
      }
    });
  }
});

/**
 * Every literal string the real data files carry. A component containing any of them has
 * hardcoded content that belongs in js/data/ (contract C-3).
 */
function literalContentValues() {
  const values = new Set();

  const walk = (value) => {
    if (typeof value === 'string' && value.trim().length > 2) values.add(value);
    else if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === 'object') Object.values(value).forEach(walk);
  };

  // js/data/projects.js is no longer read: it ships empty, and its authoring instructions are
  // comments full of example values that are not content (FR-025).
  for (const file of ['profile.js', 'skills.js', 'certifications.js', 'philosophy.js']) {
    const source = stripComments(readFileSync(`${REPO_ROOT}js/data/${file}`, 'utf8'));
    for (const match of source.matchAll(/'([^'\n]{3,})'|"([^"\n]{3,})"/g)) {
      const literal = match[1] ?? match[2];
      // Skip paths and URLs — a component may legitimately mention neither, but a false
      // positive on "assets/images/..." would be noise rather than signal.
      if (literal.includes('/') || literal.startsWith('icon-')) continue;
      values.add(literal);
    }
  }

  walk([...values]);
  return values;
}
