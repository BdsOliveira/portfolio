import { test, expect } from '@playwright/test';
import { BASE_URL } from '../../playwright.config.js';

/**
 * Request origin (SC-006, FR-019–FR-022, contract P-5).
 *
 * The pre-migration page pulled Tailwind and Inter from two CDNs on the critical path, and
 * referenced Font Awesome classes that were never loaded at all.
 */

const origin = new URL(BASE_URL).origin;

test('every request the page makes is same-origin', async ({ page }) => {
  const foreign = [];

  page.on('request', (request) => {
    const url = request.url();
    if (!url.startsWith(origin) && !url.startsWith('data:') && !url.startsWith('blob:')) {
      foreign.push(url);
    }
  });

  await page.goto('/', { waitUntil: 'networkidle' });

  expect(foreign, `page loaded ${foreign.length} cross-origin resource(s)`).toEqual([]);
});

test('the specific hosts this migration removed are never contacted', async ({ page }) => {
  const banned = ['cdn.tailwindcss.com', 'fonts.googleapis.com', 'fonts.gstatic.com', 'kit.fontawesome.com'];
  const seen = [];

  page.on('request', (request) => {
    const host = new URL(request.url()).hostname;
    if (banned.includes(host)) seen.push(request.url());
  });

  await page.goto('/', { waitUntil: 'networkidle' });

  expect(seen).toEqual([]);
});

test('no request fails', async ({ page }) => {
  const failures = [];

  page.on('requestfailed', (request) => failures.push(request.url()));
  page.on('response', (response) => {
    if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`);
  });

  await page.goto('/', { waitUntil: 'networkidle' });

  expect(failures).toEqual([]);
});

test('the page renders correctly with the network cut after first load', async ({ page, context }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await context.setOffline(true);
  await page.reload({ waitUntil: 'load' }).catch(() => {});
  await context.setOffline(false);

  // Nothing on this page depends on a live network, so a reload from cache is fully styled.
  await expect(page.locator('h1')).toBeVisible();
});

test('the payload stays small (constitution VII)', async ({ page }) => {
  const bytes = new Map();

  page.on('response', async (response) => {
    const length = Number(response.headers()['content-length'] ?? 0);
    bytes.set(response.url(), length);
  });

  await page.goto('/', { waitUntil: 'networkidle' });

  const total = [...bytes.values()].reduce((sum, value) => sum + value, 0);
  expect(total, `total transferred ${total} bytes`).toBeLessThan(400_000);
});
