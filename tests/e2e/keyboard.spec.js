import { test, expect } from '@playwright/test';
import { VIEWPORTS } from '../../playwright.config.js';

/**
 * Keyboard operability (SC-004, FR-025/FR-026, contracts P-7, P-8).
 *
 * The pre-migration page put project affordances behind hover tooltips, which keyboard and
 * touch users never received at all.
 */

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

test('every interactive element is reachable by Tab, in document order', async ({ page }) => {
  await page.goto('/');

  const expected = await page.$$eval(FOCUSABLE, (nodes) =>
    nodes
      .filter((node) => node.offsetParent !== null || getComputedStyle(node).position === 'fixed')
      .map((node) => node.getAttribute('data-focus-key') ?? node.outerHTML.slice(0, 60)),
  );

  expect(expected.length).toBeGreaterThan(0);

  const visited = [];
  for (let index = 0; index < expected.length; index += 1) {
    await page.keyboard.press('Tab');
    visited.push(
      await page.evaluate(() => {
        const node = document.activeElement;
        return node === document.body ? null : node.outerHTML.slice(0, 60);
      }),
    );
  }

  expect(visited, 'focus left the page before every control was reached').toEqual(expected);
});

test('every focused element shows a visible focus indicator', async ({ page }) => {
  await page.goto('/');

  const count = await page.locator(FOCUSABLE).count();

  for (let index = 0; index < count; index += 1) {
    await page.keyboard.press('Tab');

    const indicator = await page.evaluate(() => {
      const node = document.activeElement;
      if (!node || node === document.body) return null;

      const style = getComputedStyle(node);
      return {
        tag: node.outerHTML.slice(0, 60),
        outlineWidth: parseFloat(style.outlineWidth),
        outlineStyle: style.outlineStyle,
        boxShadow: style.boxShadow,
      };
    });

    if (!indicator) continue;

    const visible =
      (indicator.outlineWidth > 0 && indicator.outlineStyle !== 'none') ||
      (indicator.boxShadow && indicator.boxShadow !== 'none');

    expect(visible, `no focus indicator on ${indicator.tag}`).toBe(true);
  }
});

test('focus is never trapped — Tab returns to the browser chrome after the last control', async ({
  page,
}) => {
  await page.goto('/');

  const count = await page.locator(FOCUSABLE).count();
  for (let index = 0; index < count + 1; index += 1) await page.keyboard.press('Tab');

  const escaped = await page.evaluate(() => document.activeElement === document.body);
  expect(escaped).toBe(true);
});

test('Shift+Tab walks back out again', async ({ page }) => {
  await page.goto('/');

  await page.keyboard.press('Tab');
  const first = await page.evaluate(() => document.activeElement.outerHTML.slice(0, 60));

  await page.keyboard.press('Tab');
  await page.keyboard.press('Shift+Tab');

  const back = await page.evaluate(() => document.activeElement.outerHTML.slice(0, 60));
  expect(back).toBe(first);
});

for (const viewport of VIEWPORTS) {
  test(`every navigation destination is reachable at ${viewport.width}px (FR-034)`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/');

    const links = page.locator('.site-nav__list a');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);

    for (let index = 0; index < count; index += 1) {
      const link = links.nth(index);
      const href = await link.getAttribute('href');

      await expect(link, `${href} is not visible`).toBeVisible();
      await link.focus();
      await expect(link, `${href} cannot take focus`).toBeFocused();
      await expect(page.locator(href), `${href} points nowhere`).toHaveCount(1);
    }
  });
}

/**
 * The mobile disclosure (FR-005, FR-006, SC-010), at the narrowest supported viewport where it
 * is actually the collapsed control rather than a plain row.
 *
 * Contracts N3-3 … N3-6.
 */
test.describe('the mobile navigation disclosure', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto('/');
  });

  test('the toggle is revealed by the script and conveys its state', async ({ page }) => {
    const toggle = page.locator('[data-nav-toggle]');

    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveJSProperty('tagName', 'BUTTON');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    const controls = await toggle.getAttribute('aria-controls');
    await expect(page.locator(`#${controls}`)).toHaveCount(1);
  });

  test('it opens and closes by keyboard, flipping aria-expanded', async ({ page }) => {
    const toggle = page.locator('[data-nav-toggle]');
    const list = page.locator('.site-nav__list');

    await expect(list).toBeHidden();

    await toggle.focus();
    await expect(toggle).toBeFocused();
    await page.keyboard.press('Enter');

    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(list).toBeVisible();

    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(list).toBeHidden();
  });

  test('every link inside it is reachable by Tab with a visible focus ring', async ({ page }) => {
    await page.locator('[data-nav-toggle]').click();

    const links = page.locator('.site-nav__list li:not([hidden]) a');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);

    for (let index = 0; index < count; index += 1) {
      const link = links.nth(index);
      await link.focus();
      await expect(link).toBeFocused();

      const outline = await link.evaluate((node) => {
        const style = getComputedStyle(node);
        return `${style.outlineStyle} ${style.outlineWidth} ${style.boxShadow}`;
      });
      expect(outline, 'a navigation link has no visible focus indicator').not.toMatch(
        /^none 0px none$/,
      );
    }
  });

  test('Escape dismisses it and returns focus to the toggle, without navigating', async ({
    page,
  }) => {
    const toggle = page.locator('[data-nav-toggle]');
    const before = page.url();

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await page.locator('.site-nav__list li:not([hidden]) a').first().focus();
    await page.keyboard.press('Escape');

    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();
    expect(page.url()).toBe(before);
  });

  test('following a link closes it and lands on the section', async ({ page }) => {
    const toggle = page.locator('[data-nav-toggle]');

    await toggle.click();
    await page.locator('.site-nav__list a[href="#contact"]').click();

    await expect(page).toHaveURL(/#contact$/);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#contact')).toBeVisible();
  });
});

/**
 * FR-007. Smooth scrolling is CSS's `scroll-behavior`, so the reduced-motion override is the
 * whole implementation — there is no script to check.
 */
test('anchor navigation jumps rather than scrolls under prefers-reduced-motion', async ({
  browser,
}) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/');

  const behaviour = await page.evaluate(
    () => getComputedStyle(document.documentElement).scrollBehavior,
  );

  expect(behaviour).toBe('auto');
  await context.close();
});

test('smooth scrolling is on by default', async ({ page }) => {
  await page.goto('/');

  const behaviour = await page.evaluate(
    () => getComputedStyle(document.documentElement).scrollBehavior,
  );

  expect(behaviour).toBe('smooth');
});

/**
 * FR-031, FR-058, FR-059 — every link on the page, not just the ones inside a project card.
 *
 * The original form looped over `.project-card__links a`. Selected Work ships empty, so that
 * loop body never runs and the test passes without asserting anything (research R10). The real
 * per-entry coverage moved to tests/unit/projects.test.js, where fixtures supply entries
 * (contract W3-7); what belongs here is the property that holds for the whole rendered page.
 */
test('every link is operable without a mouse and descriptively named (FR-059)', async ({
  page,
}) => {
  await page.goto('/');

  const links = page.locator('a[href]:visible');
  const count = await links.count();
  expect(count, 'no links found — the check is testing nothing').toBeGreaterThan(0);

  for (let index = 0; index < count; index += 1) {
    const link = links.nth(index);

    await link.focus();
    await expect(link).toBeFocused();

    const name = ((await link.getAttribute('aria-label')) ?? (await link.textContent())).trim();
    const href = await link.getAttribute('href');

    expect(name.length, `${href} has a bare accessible name: "${name}"`).toBeGreaterThan(4);
    expect(name, `${href} relies on surrounding context`).not.toMatch(
      /^(clique aqui|click here|aqui|link|saiba mais|leia mais)$/i,
    );
  }
});

test('the hero call to action navigates rather than doing nothing (FR-028)', async ({ page }) => {
  await page.goto('/');

  const cta = page.locator('.hero__cta');
  await expect(cta).toBeVisible();
  await expect(cta).toHaveJSProperty('tagName', 'A');
  await expect(cta).toHaveAttribute('href', '#contact');

  await cta.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#contact$/);
});
