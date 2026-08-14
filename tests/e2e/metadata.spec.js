import { test, expect } from '@playwright/test';

import profile from '../../js/data/profile.js';

/** SEO and link-preview metadata (FR-039–FR-041, SC-009, contract P-10). */

const content = (page, selector) => page.locator(selector).first().getAttribute('content');

test('the document declares its language', async ({ page }) => {
  await page.goto('/');

  const lang = await page.locator('html').getAttribute('lang');
  expect(lang).toBe('pt-BR');
});

test('the title is unique and descriptive, not a bare name', async ({ page }) => {
  await page.goto('/');

  const title = await page.title();
  expect(title.length).toBeGreaterThan(10);
  expect(title.length).toBeLessThan(70);
  // Bound to the data module, not to a literal: the contract is "the title names the owner
  // and their role", which stays true across every future title change. Hardcoding the role
  // here is what made this assertion break when the role changed (feature 002, contract T2-3).
  expect(title).toContain(profile.name);
  expect(title).toContain(profile.role);
});

test('the meta description is present and a sensible length', async ({ page }) => {
  await page.goto('/');

  const description = await content(page, 'meta[name="description"]');
  expect(description).toBeTruthy();
  expect(description.length).toBeGreaterThan(50);
  expect(description.length).toBeLessThan(200);
});

test('a canonical URL is declared and absolute', async ({ page }) => {
  await page.goto('/');

  const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
  expect(canonical).toBeTruthy();
  expect(() => new URL(canonical)).not.toThrow();
  expect(new URL(canonical).protocol).toBe('https:');
});

test('the Open Graph tags a scraper needs are all present and non-empty', async ({ page }) => {
  await page.goto('/');

  for (const property of ['og:type', 'og:url', 'og:title', 'og:description', 'og:image']) {
    const value = await content(page, `meta[property="${property}"]`);
    expect(value, `${property} is missing or empty`).toBeTruthy();
  }
});

test('the Open Graph image is an absolute URL with declared dimensions', async ({ page }) => {
  await page.goto('/');

  const image = await content(page, 'meta[property="og:image"]');
  expect(() => new URL(image)).not.toThrow();

  expect(await content(page, 'meta[property="og:image:width"]')).toBe('1200');
  expect(await content(page, 'meta[property="og:image:height"]')).toBe('630');
  expect(await content(page, 'meta[property="og:image:alt"]')).toBeTruthy();
});

test('the Open Graph image actually exists at that path', async ({ page, request }) => {
  await page.goto('/');

  const image = await content(page, 'meta[property="og:image"]');
  const response = await request.get(new URL(image).pathname);

  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toMatch(/^image\//);
});

test('the Twitter card tags are present', async ({ page }) => {
  await page.goto('/');

  expect(await content(page, 'meta[name="twitter:card"]')).toBe('summary_large_image');
  for (const name of ['twitter:title', 'twitter:description', 'twitter:image']) {
    expect(await content(page, `meta[name="${name}"]`), `${name} is missing`).toBeTruthy();
  }
});

test('og:url and the canonical URL agree', async ({ page }) => {
  await page.goto('/');

  const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
  expect(await content(page, 'meta[property="og:url"]')).toBe(canonical);
});

test('the body font is preloaded (research R4)', async ({ page }) => {
  await page.goto('/');

  const preload = page.locator('link[rel="preload"][as="font"]');
  await expect(preload).toHaveCount(1);
  await expect(preload).toHaveAttribute('type', 'font/woff2');
  await expect(preload).toHaveAttribute('crossorigin', '');
});

test('navigation is real anchors, crawlable without running a script', async ({ request }) => {
  const html = await (await request.get('/')).text();

  for (const id of ['#skills', '#projects', '#certifications', '#contact']) {
    expect(html).toContain(`href="${id}"`);
  }
});
