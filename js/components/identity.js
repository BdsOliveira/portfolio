/**
 * Identity reconciliation.
 *
 * Unlike the section components, this module does not turn data into markup. The Hero, About and
 * Contact copy is authored *statically* in index.html so it survives a script failure (FR-018,
 * research R7) — rendering it would render it twice. What is left over is the part static markup
 * cannot express: an affordance that must disappear when the owner has not supplied the value
 * behind it, and a year that must not be a literal.
 *
 * It lives here rather than in js/app.js because app.js is a wiring layer (FR-057), and here
 * rather than in a new top-level directory because adding one requires a constitution amendment
 * — see the plan's Complexity Tracking table. Both exports take `doc` explicitly and touch no
 * shared mutable state.
 */

/**
 * The current year, as a fragment to drop into the footer.
 *
 * Mirrors renderHero's derivation: a year is a fact about *now*, so storing it would guarantee
 * it goes stale. The literal in index.html is a no-script fallback that can drift by at most one
 * year, not a second source of truth (FR-072, research R4).
 *
 * @param {object} _profile  unused; present so the signature matches every other binding
 * @param {Document} doc
 * @returns {DocumentFragment}
 */
export function renderCopyrightYear(_profile, doc) {
  const fragment = doc.createDocumentFragment();
  fragment.append(doc.createTextNode(String(new Date().getFullYear())));
  return fragment;
}

/**
 * Remove every affordance whose backing profile value is absent.
 *
 * An element carrying `data-profile-optional="cvUrl"` exists only as long as `profile.cvUrl`
 * does. The CV link ships absent, so today this removes the CV contact route and any call to
 * action pointing at it (FR-014, FR-041).
 *
 * Removed, never hidden and never disabled: an inert link that goes nowhere is a defect, not a
 * degraded state (contract I3-3). Idempotent, and tolerant of a profile that declares none of
 * these keys (contract I3-4).
 *
 * @param {object} profile
 * @param {Document} doc
 */
export function pruneOptionalIdentity(profile, doc) {
  const source = profile ?? {};

  for (const node of doc.querySelectorAll('[data-profile-optional]')) {
    const key = node.getAttribute('data-profile-optional');
    const value = source[key];

    const absent =
      value === undefined ||
      value === null ||
      (typeof value === 'string' && value.trim() === '') ||
      (Array.isArray(value) && value.length === 0);

    if (absent) node.remove();
  }
}
