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

test('the positioning statement and About content are readable without JavaScript', async ({
  page,
}) => {
  // FR-018, SC-012. These are the four things a recruiter needs even if nothing executes.
  await page.goto('/');

  await expect(page.locator('[data-profile="headline"]')).toHaveText(profile.headline);

  const paragraphs = page.locator('[data-profile="about"] p');
  await expect(paragraphs).toHaveCount(profile.about.length);
  for (const [index, paragraph] of profile.about.entries()) {
    await expect(paragraphs.nth(index)).toHaveText(paragraph);
  }

  await expect(page.locator('[data-profile="location"]')).toHaveText(profile.location);
  await expect(page.locator('[data-profile="email"]')).toHaveText(profile.email);
});

test('both calls to action are present and actionable without JavaScript', async ({ page }) => {
  await page.goto('/');

  for (const key of ['primaryCta', 'secondaryCta']) {
    const anchor = page.locator(`a[data-profile="${key}"]`);
    await expect(anchor, `${key} is missing`).toHaveCount(1);
    await expect(anchor).toBeVisible();
    await expect(anchor).toHaveAttribute('href', profile[key].href);
    await expect(anchor).toHaveText(profile[key].label);
  }
});

test('availability is stated when the profile states one (FR-013)', async ({ page }) => {
  await page.goto('/');

  const availability = page.locator('[data-profile="availability"]');

  if (profile.availability === undefined) {
    await expect(availability).toHaveCount(0);
  } else {
    await expect(availability).toHaveText(profile.availability);
  }
});

/**
 * FR-073, research R5.
 *
 * The original form asserted `toHaveCount(1)` per social URL, and failed — not on a defect, but
 * on an assumption of uniqueness the page never promised. Two destinations are reachable from
 * two places on purpose: GitHub from the Hero's secondary call to action and from the contact
 * routes, LinkedIn from the Hero's social list and from the contact routes.
 *
 * So assert the properties that actually matter: the destination is reachable, and *every* route
 * to it names where it goes (FR-059).
 */
test('every social link is reachable and descriptively named, without JavaScript', async ({
  page,
}) => {
  await page.goto('/');

  for (const link of profile.socialLinks) {
    const anchors = page.locator(`a[href="${link.url}"]`);
    const count = await anchors.count();

    expect(count, `${link.platform} link is missing`).toBeGreaterThan(0);

    let anyVisible = false;
    for (let index = 0; index < count; index += 1) {
      const anchor = anchors.nth(index);
      if (await anchor.isVisible()) anyVisible = true;

      const name = ((await anchor.getAttribute('aria-label')) ?? (await anchor.textContent)).trim();
      expect(name, `a ${link.platform} route has no descriptive name`).not.toMatch(
        /^(clique aqui|click here|aqui|link|saiba mais)?$/i,
      );
    }

    expect(anyVisible, `no ${link.platform} route is visible`).toBe(true);
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

/**
 * FR-004, FR-005, FR-008, contract N3-2.
 *
 * With no script the collapsible navigation never comes into existence — the toggle stays
 * hidden and the full list is simply visible. That is the fallback by design: a no-script
 * visitor gets every destination, taller but complete (research R2).
 */
test('the navigation works without JavaScript', async ({ page }) => {
  await page.goto('/');

  const links = page.locator('.site-nav__list li:not([hidden]) a');
  const count = await links.count();
  expect(count).toBeGreaterThan(0);

  for (let index = 0; index < count; index += 1) {
    const link = links.nth(index);
    const href = await link.getAttribute('href');

    await expect(link, `${href} is not visible without JavaScript`).toBeVisible();
    await expect(page.locator(href), `${href} points nowhere`).toHaveCount(1);
  }
});

test('the disclosure toggle stays hidden and inert without JavaScript', async ({ page }) => {
  await page.goto('/');

  // An inert control offering to open a menu that cannot open is a worse failure than a long
  // list, so the toggle is revealed *by* the script and never before it.
  await expect(page.locator('[data-nav-toggle]')).toBeHidden();
  await expect(page.locator('.site-nav__list')).toBeVisible();
});

test('no navigation item points at a hidden section (FR-004)', async ({ page }) => {
  await page.goto('/');

  const dangling = await page.$$eval('.site-nav__list li:not([hidden]) a', (links) =>
    links
      .map((link) => link.getAttribute('href'))
      .filter((href) => {
        const target = document.querySelector(href);
        return !target || target.hasAttribute('hidden');
      }),
  );

  expect(dangling, `navigation offers links to sections that are not there: ${dangling}`).toEqual(
    [],
  );
});

test('no CV route is offered while the profile has no CV link (FR-041)', async ({ page }) => {
  await page.goto('/');

  if (profile.cvUrl === undefined) {
    // Omitted entirely — not disabled, not empty, not a link that goes nowhere.
    await expect(page.locator('[data-profile-optional="cvUrl"]')).toHaveCount(0);
  } else {
    await expect(page.locator('[data-profile-optional="cvUrl"]').first()).toBeVisible();
  }
});

test('the closing section states what the owner is open to (FR-039, FR-040)', async ({ page }) => {
  await page.goto('/');

  const contact = page.locator('#contact');

  if (profile.availability !== undefined) {
    await expect(contact.locator('[data-profile="availability"]')).toHaveText(profile.availability);
  }

  // LinkedIn and GitHub as distinct routes, each named so it identifies its destination.
  const routes = contact.locator('.contact-routes a');
  await expect(routes).toHaveCount(2);

  const hrefs = await routes.evaluateAll((links) => links.map((l) => l.getAttribute('href')));
  for (const link of profile.socialLinks) expect(hrefs).toContain(link.url);

  // The email button is gone by the owner's decision, but email must still be a working route
  // without a script: the address in the contact details is the live mailto anchor (FR-040).
  await expect(contact.locator(`a[href="mailto:${profile.email}"]`)).toHaveCount(1);

  for (const [index, name] of (
    await routes.evaluateAll((links) =>
      links.map((l) => (l.getAttribute('aria-label') ?? l.textContent).trim()),
    )
  ).entries()) {
    expect(name.length, `contact route ${index} has a bare name: "${name}"`).toBeGreaterThan(4);
    expect(name).not.toMatch(/^(clique aqui|click here|aqui|link)$/i);
  }
});

/**
 * FR-074, SC-012 — the defect this feature exists to close.
 *
 * With scripts disabled the previous implementation rendered six section headings above six
 * empty regions, because it removed empty sections at runtime and a visitor whose script never
 * ran got no runtime. Now every data-driven section ships `hidden` and is revealed only once its
 * component has produced content (research R1), so what remains visible is content.
 */
test('no section heading appears above an empty region', async ({ page }) => {
  await page.goto('/');

  const hollow = await page.$$eval('main > section', (sections) =>
    sections
      .filter((section) => section.offsetParent !== null || section.getClientRects().length > 0)
      .filter((section) => {
        const heading = section.querySelector(':scope > h1, :scope > h2');
        if (!heading) return false;

        const body = section.textContent.replace(heading.textContent, '').trim();
        return body === '';
      })
      .map((section) => section.id),
  );

  expect(hollow, `sections showing a heading with nothing under it: ${hollow.join(', ')}`).toEqual(
    [],
  );
});

test('every visible section contains real content', async ({ page }) => {
  await page.goto('/');

  const ids = await page.$$eval('main > section:not([hidden])', (sections) =>
    sections.map((section) => section.id),
  );

  // Only the static three survive without a script — and all three are real content, not
  // skeletons (FR-018).
  expect(ids).toEqual(['hero', 'about', 'contact']);
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
