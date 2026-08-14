import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { VIEWPORTS } from '../../playwright.config.js';

/**
 * WCAG 2.1 AA audit (SC-005, contract P-11).
 *
 * Contrast is the likely failure point: the palette's purple and navy fail as text and are
 * surfaces only, and pink text over a purple surface is 2.7:1 (research R6).
 */
const analyze = (page) =>
  new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();

const describeViolations = (violations) =>
  violations
    .map(
      (violation) =>
        `${violation.id} (${violation.impact}): ${violation.help}\n` +
        violation.nodes.map((node) => `    ${node.target.join(' ')}`).join('\n'),
    )
    .join('\n');

for (const viewport of VIEWPORTS) {
  test(`zero axe-core violations at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/');

    const { violations } = await analyze(page);
    expect(violations, describeViolations(violations)).toEqual([]);
  });
}

test('zero violations with JavaScript disabled — the static page is accessible too', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');

  const { violations } = await analyze(page);
  expect(violations, describeViolations(violations)).toEqual([]);

  await context.close();
});

/**
 * Contract S-3, generalised.
 *
 * The palette this replaced had one pairing that failed AA — pink text on a purple surface
 * at 2.7:1 — so the check was written as a prohibition on those two colours. The graphite
 * palette has no such pairing, and hardcoding colours would only re-break the moment the
 * palette moves again. So compute the ratio instead, and let the numbers decide.
 */
test('every accent-coloured text pairing clears 4.5:1 (S-3)', async ({ page }) => {
  await page.goto('/');

  const offenders = await page.evaluate(() => {
    const accent = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-accent')
      .trim();

    const parse = (value) => value.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number);

    const luminance = ([r, g, b]) => {
      const channel = (v) => {
        const c = v / 255;
        return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
    };

    const ratio = (a, b) => {
      const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
      return (hi + 0.05) / (lo + 0.05);
    };

    const backgroundBehind = (node) => {
      let current = node;
      while (current && current !== document.documentElement) {
        const { backgroundColor } = getComputedStyle(current);
        if (backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)') return backgroundColor;
        current = current.parentElement;
      }
      return getComputedStyle(document.body).backgroundColor;
    };

    // Resolve the token to the rgb() form getComputedStyle reports for `color`.
    const probe = document.createElement('span');
    probe.style.color = accent;
    document.body.append(probe);
    const accentRgb = getComputedStyle(probe).color;
    probe.remove();

    return [...document.querySelectorAll('body *')]
      .filter((node) => [...node.childNodes].some((n) => n.nodeType === 3 && n.data.trim()))
      .filter((node) => getComputedStyle(node).color === accentRgb)
      .map((node) => ({
        selector: `${node.tagName.toLowerCase()}.${node.className}`,
        contrast: ratio(parse(accentRgb), parse(backgroundBehind(node))),
      }))
      .filter((entry) => entry.contrast < 4.5)
      .map((entry) => `${entry.selector} — ${entry.contrast.toFixed(2)}:1`);
  });

  expect(offenders).toEqual([]);
});

test('transitions are suppressed under prefers-reduced-motion (P-12)', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/');

  const card = page.locator('.card, .project-card').first();
  const duration = await card.evaluate((node) => getComputedStyle(node).transitionDuration);

  expect(parseFloat(duration)).toBeLessThan(0.05);

  await context.close();
});
