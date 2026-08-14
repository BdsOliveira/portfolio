import { requireFields } from './helpers.js';

/**
 * Deliberately narrow: name, role, summary and social links are static in index.html
 * (research R2). This component only fills in what cannot be static — the years of
 * experience, which is derived at render time and never stored (FR-017).
 *
 * @param {object} profile
 * @param {Document} doc
 * @returns {DocumentFragment}
 */
export function renderHero(profile, doc) {
  requireFields(profile, ['experienceStartYear'], 'Profile');

  const currentYear = new Date().getFullYear();
  const startYear = profile.experienceStartYear;

  if (startYear > currentYear) {
    throw new Error(
      `Profile: experienceStartYear ${startYear} is in the future (current year is ${currentYear})`,
    );
  }

  const fragment = doc.createDocumentFragment();
  fragment.append(doc.createTextNode(String(currentYear - startYear)));

  return fragment;
}
