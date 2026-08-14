/**
 * Navigation — reconciliation and the mobile disclosure (FR-004 – FR-008).
 *
 * This module carries interaction behaviour rather than rendering, which is why it has no
 * `render(data, doc)` export and is listed separately in tests/unit/contracts.test.js. See the
 * plan's Complexity Tracking entry for why it lives under js/components/ anyway.
 *
 * The design point worth keeping in mind while editing: **the collapsed navigation is the
 * enhancement, and the full visible list is the fallback.** `enableMobileNavigation` is what
 * makes the list collapsible. If the script never runs, the visitor gets every link, visible and
 * operable — taller, but complete. The opposite arrangement (authoring the list collapsed and
 * relying on a script to open it) leaves a no-script visitor with an inert button and no way to
 * reach anything (research R2).
 *
 * Both exports take `doc` explicitly and hold no module state.
 */

/**
 * Reveal each navigation item whose target section is actually on the page.
 *
 * An item bound to a data-driven section ships `hidden`, exactly like the section itself. It is
 * revealed only when `#<id>` exists *and* is not itself hidden — so a link never points at a
 * section that is absent or invisible, in either the scripted or the unscripted case (FR-004).
 *
 * @param {Document} doc
 */
export function revealNavigation(doc) {
  for (const item of doc.querySelectorAll('[data-nav-for]')) {
    const target = doc.getElementById(item.getAttribute('data-nav-for'));

    if (target && !target.hasAttribute('hidden')) item.removeAttribute('hidden');
  }
}

/**
 * Turn the navigation into a disclosure and wire its behaviour.
 *
 * Reveals the toggle, marks the nav collapsible so the stylesheet can act on it, and sets the
 * initial collapsed state. Everything about the control is native: a `<button>` with
 * `aria-expanded` and `aria-controls`, so its state reaches assistive technology without an
 * ARIA widget role (FR-006, constitution V).
 *
 * @param {Document} doc
 */
export function enableMobileNavigation(doc) {
  const toggle = doc.querySelector('[data-nav-toggle]');
  const nav = toggle?.closest('nav');
  const list = toggle && doc.getElementById(toggle.getAttribute('aria-controls'));

  if (!toggle || !nav || !list) return;

  const setExpanded = (expanded) => toggle.setAttribute('aria-expanded', String(expanded));
  const isExpanded = () => toggle.getAttribute('aria-expanded') === 'true';

  const close = ({ restoreFocus = false } = {}) => {
    if (!isExpanded()) return;
    setExpanded(false);
    if (restoreFocus) toggle.focus();
  };

  // Only now does the list become collapsible. Until this line runs, it is a plain visible list.
  nav.setAttribute('data-collapsible', 'true');
  toggle.removeAttribute('hidden');
  setExpanded(false);

  toggle.addEventListener('click', () => setExpanded(!isExpanded()));

  // Dismissal without navigating away (FR-006). Escape returns focus to the control that opened
  // the disclosure — otherwise a keyboard user is left with focus nowhere in particular.
  nav.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close({ restoreFocus: true });
  });

  doc.addEventListener('click', (event) => {
    if (!nav.contains(event.target)) close();
  });

  doc.addEventListener('focusin', (event) => {
    if (!nav.contains(event.target)) close();
  });

  // Following a link closes the disclosure; the browser performs the navigation itself. No
  // preventDefault and no script-driven scrolling — smooth behaviour is CSS's `scroll-behavior`,
  // which yields to prefers-reduced-motion on its own (FR-007, FR-008).
  list.addEventListener('click', (event) => {
    if (event.target.closest('a')) close();
  });
}
