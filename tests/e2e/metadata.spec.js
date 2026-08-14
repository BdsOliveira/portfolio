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

  // `#projects` became `#work` when Projects was re-presented as Selected Work (FR-019).
  for (const id of ['#about', '#experience', '#work', '#skills', '#philosophy', '#contact']) {
    expect(html).toContain(`href="${id}"`);
  }
});

/**
 * Structured data (FR-068, research R9).
 *
 * Read from the served HTML rather than the DOM: the whole reason it is authored statically is
 * the crawler that never runs a script.
 */
test.describe('the JSON-LD Person block', () => {
  const parse = (html) => {
    const match = html.match(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
    );
    return match ? JSON.parse(match[1]) : null;
  };

  test('is present in the served document and is valid JSON', async ({ request }) => {
    const data = parse(await (await request.get('/')).text());

    expect(data, 'no JSON-LD block in the served HTML').not.toBeNull();
    expect(data['@type']).toBe('Person');
    expect(data['@context']).toBe('https://schema.org');
  });

  test('agrees with what the page itself says', async ({ page, request }) => {
    const data = parse(await (await request.get('/')).text());
    await page.goto('/');

    expect(data.name).toBe((await page.locator('[data-profile="name"]').textContent()).trim());
    expect(data.jobTitle).toBe((await page.locator('[data-profile="role"]').textContent()).trim());
    expect(data.description).toBe(
      (await page.locator('[data-profile="headline"]').textContent()).trim(),
    );

    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(data.url).toBe(canonical);

    // Every sameAs destination is actually reachable from the page.
    const hrefs = await page.$$eval('a[href]', (links) =>
      links.map((link) => link.getAttribute('href')),
    );
    for (const url of data.sameAs) expect(hrefs).toContain(url);
  });

  test('adds no keyword stuffing', async ({ request }) => {
    const data = parse(await (await request.get('/')).text());

    // A description that is a comma-separated technology list is the failure mode FR-068 names.
    expect(data.description.split(',').length).toBeLessThan(5);
  });
});

/**
 * FR-072, SC-017 — the footer states the current year without a content edit.
 */
test('the footer copyright year is the current year', async ({ page }) => {
  await page.goto('/');

  const year = (await page.locator('#copyright-year').textContent()).trim();

  expect(year).toBe(String(new Date().getFullYear()));
});

/**
 * FR-075, SC-016 — a shared link must preview as what the page actually says.
 */
test('the social preview agrees with the page content', async ({ page }) => {
  await page.goto('/');

  const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
  const name = (await page.locator('[data-profile="name"]').textContent()).trim();
  const role = (await page.locator('[data-profile="role"]').textContent()).trim();

  expect(ogTitle).toContain(name);
  expect(ogTitle).toContain(role);

  const ogDescription = await page
    .locator('meta[property="og:description"]')
    .getAttribute('content');
  expect(ogDescription).toContain(name);

  // The preview must not advertise a section the page does not have (FR-075). Selected Work and
  // Community ship empty, so the preview copy must not promise either.
  const pageText = await page.locator('main').innerText();

  for (const claim of ['Projetos', 'Comunidade']) {
    if (!pageText.includes(claim)) {
      expect(
        ogDescription,
        `the preview promises "${claim}", which is not on the page`,
      ).not.toContain(claim);
    }
  }
});
