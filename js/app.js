/**
 * Single entry point: wires data to components and mounts them.
 *
 * Builds no markup of its own (constitution: `js/app.js` rules). Every node on the page
 * comes from either index.html or a component's returned fragment.
 */

import profile from './data/profile.js';
import projects from './data/projects.js';
import skills from './data/skills.js';
import certifications from './data/certifications.js';
import experiences from './data/experiences.js';
import education from './data/education.js';
import philosophy from './data/philosophy.js';
import community from './data/community.js';
import talks from './data/talks.js';

import { renderHero } from './components/hero.js';
import { renderProjects } from './components/projects.js';
import { renderSkills } from './components/skills.js';
import { renderCertifications } from './components/certifications.js';
import { renderExperience } from './components/experience.js';
import { renderEducation } from './components/education.js';
import { renderPhilosophy } from './components/philosophy.js';
import { renderCommunity } from './components/community.js';
import { renderTalks } from './components/talks.js';
import { pruneOptionalIdentity, renderCopyrightYear } from './components/identity.js';
import { revealNavigation, enableMobileNavigation } from './components/navigation.js';

/**
 * @typedef {object} SectionBinding
 * @property {string} mount    selector for the element the fragment is appended to
 * @property {string|null} section  selector for the element removed when there is nothing
 *                                  to show; `null` means leave the static markup alone
 * @property {Function} render
 * @property {object|array} data
 */

/** @type {SectionBinding[]} */
export const sections = [
  // Hero has no section to remove: the static name, role and summary must survive any
  // rendering failure (SC-013), so a throw here leaves the pre-rendered fallback in place.
  { mount: '#years-of-experience', section: null, render: renderHero, data: profile },
  // Same shape as the hero's derived figure: a static fallback in index.html, overwritten with
  // the real value at load. `section: null` — a failure here must leave the fallback standing.
  { mount: '#copyright-year', section: null, render: renderCopyrightYear, data: profile },
  // Directly under the hero on the page, and listed here in that order for the same reason every
  // other binding is: this array is the only place the page's section order is stated twice, so
  // keeping it aligned with index.html is what stops the two drifting apart.
  { mount: '[data-mount="talks"]', section: '#talks', render: renderTalks, data: talks },
  { mount: '[data-mount="skills"]', section: '#skills', render: renderSkills, data: skills },
  // Section id is `#work` (Selected Work); the data module keeps its mandated name (research R6).
  { mount: '[data-mount="projects"]', section: '#work', render: renderProjects, data: projects },
  {
    mount: '[data-mount="certifications"]',
    section: '#certifications',
    render: renderCertifications,
    data: certifications,
  },
  {
    mount: '[data-mount="experience"]',
    section: '#experience',
    render: renderExperience,
    data: experiences,
  },
  {
    mount: '[data-mount="philosophy"]',
    section: '#philosophy',
    render: renderPhilosophy,
    data: philosophy,
  },
  {
    mount: '[data-mount="community"]',
    section: '#community',
    render: renderCommunity,
    data: community,
  },
  {
    mount: '[data-mount="education"]',
    section: '#education',
    render: renderEducation,
    data: education,
  },
];

/**
 * Mount every binding. Each call is isolated: one component throwing MUST NOT stop the
 * others (contract A-1).
 *
 * @param {SectionBinding[]} bindings
 * @param {Document} doc
 */
export function mount(bindings, doc) {
  for (const binding of bindings) {
    const target = doc.querySelector(binding.mount);
    if (!target) continue;

    let fragment;
    try {
      fragment = binding.render(binding.data, doc);
    } catch (error) {
      console.error(`Failed to render ${binding.mount}:`, error);
      drop(binding, doc);
      continue;
    }

    if (fragment === null) {
      drop(binding, doc);
      continue;
    }

    target.replaceChildren(fragment);
    reveal(binding, doc);
  }
}

/**
 * Every data-driven section is authored `hidden` in index.html and revealed only once its
 * component has produced content (research R1).
 *
 * This is what makes "an empty collection leaves no trace" true with scripts *disabled*, which
 * is the case the previous implementation got wrong: it removed empty sections at runtime, so a
 * visitor whose script never ran met six headings above six empty regions (FR-003, FR-074).
 *
 * `hidden` rather than a CSS rule on purpose — it removes the element from the accessibility
 * tree and the box tree without the stylesheet having to load, so the guarantee survives a CSS
 * failure as well as a script failure.
 */
function reveal(binding, doc) {
  if (!binding.section) return;
  doc.querySelector(binding.section)?.removeAttribute('hidden');
}

function drop(binding, doc) {
  if (!binding.section) return;
  doc.querySelector(binding.section)?.remove();
}

/**
 * Reconciliation passes that run after every section has mounted.
 *
 * Each is isolated for the same reason the bindings are (FR-046): a failure here must not undo
 * a page that has already rendered correctly. None of them creates markup — app.js removes and
 * reveals nodes, it does not build them (FR-057).
 *
 * @param {object} identity
 * @param {Document} doc
 */
export function reconcile(identity, doc) {
  try {
    pruneOptionalIdentity(identity, doc);
  } catch (error) {
    console.error('Failed to prune optional identity affordances:', error);
  }

  // Must run after mount(): it reads which sections actually survived (FR-004).
  try {
    revealNavigation(doc);
  } catch (error) {
    console.error('Failed to reconcile the navigation:', error);
  }

  // Isolated separately from revealNavigation on purpose. If the disclosure fails to wire up,
  // the navigation is left as a plain visible list — degraded, but complete and operable.
  try {
    enableMobileNavigation(doc);
  } catch (error) {
    console.error('Failed to enable the mobile navigation:', error);
  }
}

// Guard so the module can be imported by node tests, which have no `document`.
if (typeof document !== 'undefined') {
  mount(sections, document);
  reconcile(profile, document);
}
