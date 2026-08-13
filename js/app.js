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

import { renderHero } from './components/hero.js';
import { renderProjects } from './components/projects.js';
import { renderSkills } from './components/skills.js';
import { renderCertifications } from './components/certifications.js';
import { renderExperience } from './components/experience.js';
import { renderEducation } from './components/education.js';

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
  { mount: '[data-mount="skills"]', section: '#skills', render: renderSkills, data: skills },
  { mount: '[data-mount="projects"]', section: '#projects', render: renderProjects, data: projects },
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
  }
}

function drop(binding, doc) {
  if (!binding.section) return;
  doc.querySelector(binding.section)?.remove();
}

// Guard so the module can be imported by node tests, which have no `document`.
if (typeof document !== 'undefined') {
  mount(sections, document);
}
