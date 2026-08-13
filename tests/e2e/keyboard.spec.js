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

test('project links are operable without a mouse (FR-031)', async ({ page }) => {
  await page.goto('/');

  const links = page.locator('.project-card__links a');
  const count = await links.count();

  for (let index = 0; index < count; index += 1) {
    const link = links.nth(index);
    await link.focus();
    await expect(link).toBeFocused();

    const name = (await link.getAttribute('aria-label')) ?? (await link.textContent());
    expect(name.trim().length).toBeGreaterThan(4);
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
