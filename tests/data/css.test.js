/**
 * CSS discipline (contracts S-1, S-2, S-4, S-5).
 *
 * Static assertions on the stylesheets themselves. Rendered contrast is a separate concern
 * and lives in the axe audit (tests/e2e/accessibility.spec.js).
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = fileURLToPath(new URL('../../', import.meta.url));

const MANDATED = ['variables.css', 'base.css', 'components.css', 'sections.css'];
const read = (file) => readFileSync(`${REPO_ROOT}css/${file}`, 'utf8');
const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');

describe('CSS contracts', () => {
  test('the four mandated stylesheets exist, and nothing else does (S-4)', () => {
    assert.deepEqual(readdirSync(`${REPO_ROOT}css`).sort(), [...MANDATED].sort());
  });

  test('S-1 no literal hex colour outside variables.css', () => {
    for (const file of MANDATED.filter((name) => name !== 'variables.css')) {
      const matches = [...stripComments(read(file)).matchAll(/#[0-9a-fA-F]{3,8}\b/g)]
        // `#id` selectors and url(#fragment) references are not colours.
        .filter((match) => /^#[0-9a-fA-F]{3,8}$/.test(match[0]) && /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(match[0]))
        .map((match) => match[0]);

      assert.deepEqual(matches, [], `${file} hardcodes colours instead of using var(--token)`);
    }
  });

  test('S-1 no literal rgb()/hsl() colour outside variables.css', () => {
    for (const file of MANDATED.filter((name) => name !== 'variables.css')) {
      assert.doesNotMatch(stripComments(read(file)), /\b(rgba?|hsla?)\s*\(/, `${file} hardcodes a colour`);
    }
  });

  test('S-2 every media query is min-width — a max-width query can leave a gap', () => {
    for (const file of MANDATED) {
      const queries = [...stripComments(read(file)).matchAll(/@media[^{]+/g)].map((m) => m[0]);
      const offenders = queries.filter((query) => /max-width/.test(query));

      assert.deepEqual(offenders, [], `${file} uses a max-width query`);
    }
  });

  test('S-2 breakpoints are the two declared in research R7', () => {
    const allowed = new Set(['48rem', '64rem']);

    for (const file of MANDATED) {
      // Scoped to the `@media` prelude, not the whole stylesheet. `min-width: 0` is a legitimate
      // declaration — it is what stops a grid or flex item refusing to shrink below its longest
      // word, and is half the fix for the horizontal-overflow defect (FR-065). Scanning the
      // whole file conflated the two and flagged an overflow fix as a rogue breakpoint.
      const preludes = [...stripComments(read(file)).matchAll(/@media([^{]+)/g)].map((m) => m[1]);

      for (const prelude of preludes) {
        for (const match of prelude.matchAll(/min-width:\s*([^)]+)\)/g)) {
          const value = match[1].trim();
          assert.ok(allowed.has(value), `${file} introduces an undeclared breakpoint: ${value}`);
        }
      }
    }
  });

  test('S-5 no outline: none without a replacement indicator', () => {
    for (const file of MANDATED) {
      const css = stripComments(read(file));
      const removals = [...css.matchAll(/outline\s*:\s*(none|0)\b/g)];

      for (const removal of removals) {
        const rule = css.slice(Math.max(0, removal.index - 400), removal.index + 400);
        assert.match(
          rule,
          /box-shadow|outline\s*:\s*[^n0]/,
          `${file} removes the focus outline without replacing it`,
        );
      }
    }
  });

  test('S-4 variables.css declares tokens only', () => {
    const css = stripComments(read('variables.css'));
    const selectors = [...css.matchAll(/^([^@{}\n][^{}\n]*)\{/gm)].map((m) => m[1].trim());

    assert.deepEqual(selectors, [':root'], 'variables.css contains rules other than :root tokens');
    assert.doesNotMatch(css, /^\s*(?!--)[a-z-]+\s*:/m, 'variables.css declares a non-custom property');
  });

  test('every custom property referenced is defined in variables.css', () => {
    const defined = new Set(
      [...read('variables.css').matchAll(/^\s*(--[\w-]+)\s*:/gm)].map((m) => m[1]),
    );

    for (const file of MANDATED) {
      for (const match of stripComments(read(file)).matchAll(/var\(\s*(--[\w-]+)/g)) {
        assert.ok(defined.has(match[1]), `${file} uses undefined token ${match[1]}`);
      }
    }
  });

  test('fonts are loaded from assets/, never a third-party host (FR-020)', () => {
    for (const file of MANDATED) {
      const css = read(file);
      assert.doesNotMatch(css, /https?:\/\//, `${file} references an external host`);
    }
  });

  test('only the two shipped Poppins weights are declared (constitution VII)', () => {
    const weights = new Set(
      [...read('base.css').matchAll(/@font-face[\s\S]*?font-weight:\s*(\d+)/g)].map((m) => m[1]),
    );
    assert.deepEqual([...weights].sort(), ['400', '600']);
  });

  test('a prefers-reduced-motion block exists (P-12)', () => {
    assert.match(read('base.css'), /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  });

  /**
   * The `hidden` attribute is the whole mechanism behind FR-002/FR-003: a data-driven section
   * ships hidden and js/app.js reveals it only once content mounts (research R1).
   *
   * The UA stylesheet already hides `[hidden]`, but any author `display` declaration on such an
   * element silently wins — and the visitors it breaks for are the ones running no script, who
   * are the least likely to report it. So the rule is pinned in base.css, and pinned here.
   */
  test('the [hidden] rule survives, since the empty-section guarantee rests on it', () => {
    assert.match(
      stripComments(read('base.css')),
      /\[hidden\][^{]*\{[^}]*display:\s*none\s*!important/,
      'base.css no longer forces [hidden] to display: none',
    );
  });

  test('scroll-behavior is smooth and yields to prefers-reduced-motion (FR-007)', () => {
    const css = stripComments(read('base.css'));

    assert.match(css, /scroll-behavior:\s*smooth/, 'anchor navigation is not smooth by default');

    const reduced = css.match(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*$/)?.[0];
    assert.ok(reduced, 'no reduced-motion block to check');
    assert.match(reduced, /scroll-behavior:\s*auto/, 'smooth scrolling ignores reduced motion');
  });
});
