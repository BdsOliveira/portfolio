import { test, expect } from '@playwright/test';

/** Document structure (contracts P-1, P-2, FR-023, FR-024). */

test('exactly one <h1>', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveCount(1);
});

test('the heading outline skips no level', async ({ page }) => {
  await page.goto('/');

  const levels = await page.$$eval('h1, h2, h3, h4, h5, h6', (nodes) =>
    nodes.map((node) => ({ level: Number(node.tagName[1]), text: node.textContent.trim() })),
  );

  expect(levels.length).toBeGreaterThan(1);
  expect(levels[0].level).toBe(1);

  for (let index = 1; index < levels.length; index += 1) {
    const jump = levels[index].level - levels[index - 1].level;
    expect(jump, `"${levels[index].text}" jumps ${jump} levels`).toBeLessThanOrEqual(1);
  }
});

test('sections use <h2> and their items use <h3>', async ({ page }) => {
  await page.goto('/');

  const headings = await page.$$eval('main > section', (sections) =>
    sections.map((section) => ({
      id: section.id,
      own: section.querySelector(':scope > h2')?.tagName ?? null,
      deeper: [...section.querySelectorAll('h1, h2')].length,
    })),
  );

  for (const section of headings) {
    expect(section.own, `#${section.id} has no <h2> of its own`).toBe('H2');
    expect(section.deeper, `#${section.id} contains an extra <h1> or <h2>`).toBe(1);
  }
});

test('the landmarks are present and distinct (P-2)', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('body > header')).toHaveCount(1);
  await expect(page.locator('body > header nav')).toHaveCount(1);
  await expect(page.locator('body > main')).toHaveCount(1);
  await expect(page.locator('body > footer')).toHaveCount(1);
});

test('the navigation landmark carries an accessible name', async ({ page }) => {
  await page.goto('/');

  const nav = page.locator('nav').first();
  const name =
    (await nav.getAttribute('aria-label')) ?? (await nav.getAttribute('aria-labelledby'));

  expect(name).toBeTruthy();
});

test('every section is labelled by its own heading', async ({ page }) => {
  await page.goto('/');

  const unlabelled = await page.$$eval('main > section', (sections) =>
    sections
      .filter((section) => {
        const labelledBy = section.getAttribute('aria-labelledby');
        return !labelledBy || !section.ownerDocument.getElementById(labelledBy);
      })
      .map((section) => section.id),
  );

  // The hero is titled by the page <h1> rather than a section heading of its own.
  expect(unlabelled).toEqual(['hero']);
});

test('empty collections leave no empty section behind (SC-014)', async ({ page }) => {
  await page.goto('/');

  // experiences.js and education.js ship empty, so their sections must be gone entirely —
  // not present-but-empty, which would leave a stray heading and a gap.
  await expect(page.locator('#experience')).toHaveCount(0);
  await expect(page.locator('#education')).toHaveCount(0);
});

test('repeated items are announced as lists (FR-023, C-12)', async ({ page }) => {
  await page.goto('/');

  for (const selector of ['.skill-groups', '.project-list', '.certification-list', '.chip-list']) {
    const list = page.locator(selector).first();
    await expect(list, `${selector} is missing`).toHaveCount(1);
    await expect(list).toHaveJSProperty('tagName', 'UL');
  }

  const orphans = await page.$$eval('li', (items) =>
    items.filter((item) => !['UL', 'OL'].includes(item.parentElement.tagName)).length,
  );
  expect(orphans).toBe(0);
});

test('every image has an alt attribute and reserved dimensions (C-8)', async ({ page }) => {
  await page.goto('/');

  const problems = await page.$$eval('img', (images) =>
    images
      .filter((image) => image.getAttribute('alt') === null || !image.width || !image.height)
      .map((image) => image.getAttribute('src')),
  );

  expect(problems).toEqual([]);
});

test('every form control has a persistent label (P-6, FR-027)', async ({ page }) => {
  await page.goto('/');

  const unlabelled = await page.$$eval('input, textarea, select', (fields) =>
    fields
      .filter((field) => {
        const byFor = field.id && field.ownerDocument.querySelector(`label[for="${field.id}"]`);
        const wrapped = field.closest('label');
        return !byFor && !wrapped && !field.getAttribute('aria-label');
      })
      .map((field) => field.name || field.id),
  );

  expect(unlabelled).toEqual([]);
});

test('placeholders are supplementary, never the only identifier', async ({ page }) => {
  await page.goto('/');

  const fields = await page.$$eval('input[placeholder], textarea[placeholder]', (nodes) =>
    nodes.map((node) => ({
      id: node.id,
      placeholder: node.getAttribute('placeholder'),
      label: node.ownerDocument.querySelector(`label[for="${node.id}"]`)?.textContent.trim() ?? null,
    })),
  );

  for (const field of fields) {
    expect(field.label, `${field.id} relies on its placeholder alone`).toBeTruthy();
    expect(field.label).not.toBe(field.placeholder);
  }
});
