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

/**
 * The page reads in the order a recruiter asks their questions (FR-001, SC-002): who are you →
 * what have you done → what can you build → how do you think → what else shows seniority → how
 * do I reach you.
 *
 * Asserted against the *served document* rather than the rendered DOM, because js/app.js removes
 * a section whose collection is empty — and Selected Work and Community ship empty (FR-025,
 * FR-038), so a DOM-order assertion would silently stop covering them.
 */
const SECTION_ORDER = [
  'hero',
  'talks',
  'about',
  'experience',
  'work',
  'skills',
  'philosophy',
  'community',
  'education',
  'certifications',
  'contact',
];

test('sections appear in the recruiter-first order (FR-001, SC-002)', async ({ request }) => {
  const html = await (await request.get('/')).text();

  const ids = [...html.matchAll(/<section\b[^>]*\bid="([^"]+)"/g)].map((match) => match[1]);

  expect(ids).toEqual(SECTION_ORDER);
});

test('the rendered page preserves that order, minus any empty section', async ({ page }) => {
  await page.goto('/');

  const rendered = await page.$$eval('main > section', (sections) => sections.map((s) => s.id));

  // A subsequence, not an equality: an empty collection removes its section entirely, which is
  // the whole point of FR-002. What must never happen is two sections swapping places.
  expect(SECTION_ORDER.filter((id) => rendered.includes(id))).toEqual(rendered);
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

  // A section whose collection is empty must leave no trace, not be left present-but-empty,
  // which would show a stray heading with a gap under it.
  //
  // Asserted against the mechanism rather than against which collections happen to ship empty.
  // The original form named #experience and #education directly, because feature 001 shipped
  // those two data files empty; feature 002 populates them, which would make a data-bound
  // assertion here fail for the wrong reason every time content changes.
  //
  // Two mechanisms satisfy it, and both are acceptable (research R1): the section is removed
  // outright by js/app.js, or it is still authored `hidden` because nothing mounted into it.
  // What must never happen is a *visible* section with an empty body — so the check is scoped
  // to what the visitor can actually see.
  const stray = await page.$$eval('main > section:not([hidden]) [data-mount]', (mounts) =>
    mounts.filter((mount) => mount.children.length === 0).map((mount) => mount.dataset.mount),
  );

  expect(stray, `visible sections rendered with an empty body: ${stray.join(', ')}`).toEqual([]);
});

test('every data-driven section is authored hidden in the served document (research R1)', async ({
  request,
}) => {
  // The guarantee above must hold for a visitor whose script never runs, which means it has to
  // be true of the *served* HTML — not of the DOM after js/app.js has had its turn.
  const html = await (await request.get('/')).text();

  const sections = [...html.matchAll(/<section\b[^>]*>/g)].map((match) => match[0]);
  const dataDriven = sections.filter((tag) => {
    const id = tag.match(/id="([^"]+)"/)?.[1];
    // Hero, About and Contact are static content and are never hidden.
    return id && !['hero', 'about', 'contact'].includes(id);
  });

  expect(dataDriven.length, 'no data-driven sections found — the check is testing nothing').toBeGreaterThan(0);

  for (const tag of dataDriven) {
    expect(tag, `${tag} is not authored hidden`).toMatch(/\bhidden\b/);
  }
});

/**
 * SC-003. Selected Work and Community both ship with empty collections (FR-025, FR-038), so
 * each must leave no trace at all — not a heading, not a container, not a gap.
 *
 * Asserted by id and mount rather than by heading text, so renaming a heading cannot make it
 * pass vacuously.
 */
for (const [section, mount] of [
  ['#work', 'projects'],
  ['#community', 'community'],
]) {
  test(`an empty collection leaves no ${section} section behind (SC-003)`, async ({ page }) => {
    await page.goto('/');

    await expect(page.locator(section)).toHaveCount(0);
    await expect(page.locator(`[data-mount="${mount}"]`)).toHaveCount(0);

    // And nothing points at it either — a navigation link to a section that is not there is a
    // dead end, which FR-004 forbids.
    await expect(page.locator(`.site-nav__list a[href="${section}"]:visible`)).toHaveCount(0);
  });
}

/**
 * Repeated items are announced as lists (FR-023, C-12).
 *
 * `.project-list` used to be in this set and was removed (research R10): Selected Work ships
 * empty, so that assertion would have failed for the wrong reason — or, had it been written as
 * `.first()` with no count, passed while asserting nothing.
 *
 * The named selectors are the lists that actually ship with content. The orphan check below is
 * the part that generalises, and it covers every list on the page including any that appear
 * once Selected Work and Community are populated.
 */
test('repeated items are announced as lists (FR-023, C-12)', async ({ page }) => {
  await page.goto('/');

  for (const selector of ['.skill-groups', '.certification-list', '.chip-list', '.principle-list']) {
    const list = page.locator(selector).first();
    await expect(list, `${selector} is missing`).toHaveCount(1);
    await expect(list).toHaveJSProperty('tagName', 'UL');
  }

  const orphans = await page.$$eval('li', (items) =>
    items.filter((item) => !['UL', 'OL'].includes(item.parentElement.tagName)).length,
  );
  expect(orphans).toBe(0);
});

/**
 * Every `<dt>`/`<dd>` is a direct child of a `<dl>` (axe `definition-list`).
 *
 * There are none on the shipped page — the case study is the only definition list and Selected
 * Work is empty — so this is a guard for the day it is populated rather than a live check
 * today. Written now because that is the day nobody will be looking.
 */
test('every definition list is well-formed', async ({ page }) => {
  await page.goto('/');

  const malformed = await page.$$eval('dt, dd', (nodes) =>
    nodes.filter((node) => node.parentElement.tagName !== 'DL').map((node) => node.tagName),
  );

  expect(malformed).toEqual([]);
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
