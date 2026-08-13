import { test, expect } from '@playwright/test';
import profile from '../../js/data/profile.js';

/**
 * Progressive enhancement (SC-013, FR-042, contract P-3).
 *
 * The identity content must be in the served document, not injected at runtime — for the
 * visitor whose script fails, and for the crawler that never runs one.
 */

test.use({ javaScriptEnabled: false });

test('name, role and summary are present without JavaScript', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('[data-profile="name"]')).toHaveText(profile.name);
  await expect(page.locator('[data-profile="role"]')).toHaveText(profile.role);
  await expect(page.locator('[data-profile="summary"]')).toHaveText(profile.summary);
});

test('every social link is present without JavaScript', async ({ page }) => {
  await page.goto('/');

  for (const link of profile.socialLinks) {
    const anchor = page.locator(`a[href="${link.url}"]`);
    await expect(anchor, `${link.platform} link is missing`).toHaveCount(1);
    await expect(anchor).toBeVisible();
  }
});

test('the years-of-experience sentence still reads correctly', async ({ page }) => {
  await page.goto('/');

  const lede = await page.locator('.hero__lede').textContent();

  expect(lede).toMatch(/\+\s*\d+\s*anos de experiência/);
  expect(lede).not.toMatch(/\+\s*anos/);
});

test('the page is styled without JavaScript', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(18, 22, 28)');
});

test('the navigation works without JavaScript', async ({ page }) => {
  await page.goto('/');

  const links = page.locator('.site-nav__list a');
  const count = await links.count();
  expect(count).toBeGreaterThan(0);

  for (let index = 0; index < count; index += 1) {
    const href = await links.nth(index).getAttribute('href');
    await expect(page.locator(href)).toHaveCount(1);
  }
});

test('the data-driven sections are simply absent, not broken', async ({ page }) => {
  await page.goto('/');

  // Acceptable: no projects render. Not acceptable: a heading with an empty body below it,
  // or a visible error.
  await expect(page.locator('[data-mount]')).not.toHaveText(/error|undefined|\[object/i);
  await expect(page.locator('h1')).toBeVisible();
});

test('the served HTML itself contains the owner name (quickstart V10)', async ({ request }) => {
  const response = await request.get('/');
  const html = await response.text();

  expect(html).toContain(profile.name);
  expect(html).toContain(profile.role);
});
