import { test, expect } from '@playwright/test';
import { VIEWPORTS } from '../../playwright.config.js';

/** The graphite background and near-white text, as the browser reports them. */
const BG = 'rgb(18, 22, 28)';
const TEXT = 'rgb(232, 236, 241)';

for (const viewport of VIEWPORTS) {
  test.describe(`${viewport.name} — ${viewport.width}px`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
    });

    test('the page does not scroll horizontally (SC-010, P-9)', async ({ page }) => {
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));

      expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
    });

    test('an artificially long project title does not force horizontal scroll', async ({ page }) => {
      await page.evaluate(() => {
        const title = document.querySelector('.project-card__title');
        if (title) title.textContent = 'Plataforma'.repeat(12);
      });

      const overflows = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflows).toBe(false);
    });

    test('the theme is applied to the page itself', async ({ page }) => {
      const body = page.locator('body');

      await expect(body).toHaveCSS('background-color', BG);
      await expect(body).toHaveCSS('color', TEXT);
    });

    test('no section is left unstyled', async ({ page }) => {
      const sections = await page.locator('main > section').all();
      expect(sections.length).toBeGreaterThan(0);

      for (const section of sections) {
        const id = await section.getAttribute('id');
        const metrics = await section.evaluate((node) => {
          const style = getComputedStyle(node);
          return {
            paddingBlock: parseFloat(style.paddingTop) + parseFloat(style.paddingBottom),
            fontFamily: style.fontFamily,
            width: node.getBoundingClientRect().width,
          };
        });

        expect(metrics.paddingBlock, `#${id} has no vertical rhythm`).toBeGreaterThan(0);
        expect(metrics.fontFamily, `#${id} does not use the project typeface`).toContain('Poppins');
        expect(metrics.width, `#${id} has no width`).toBeGreaterThan(0);
      }
    });

    test('cards and chips are styled, not bare markup', async ({ page }) => {
      const card = page.locator('.card, .project-card').first();
      await expect(card).toBeVisible();

      const background = await card.evaluate((node) => getComputedStyle(node).backgroundColor);
      expect(background).not.toBe('rgba(0, 0, 0, 0)');

      const chip = page.locator('.chip').first();
      await expect(chip).toBeVisible();
      const radius = await chip.evaluate((node) => parseFloat(getComputedStyle(node).borderRadius));
      expect(radius).toBeGreaterThan(0);
    });

    test('every navigation destination is reachable (P-8, FR-034)', async ({ page }) => {
      const links = page.locator('.site-nav__list a');
      const count = await links.count();

      expect(count).toBeGreaterThan(0);
      for (let index = 0; index < count; index += 1) {
        const link = links.nth(index);
        const href = await link.getAttribute('href');

        await expect(link, `${href} is hidden at ${viewport.width}px`).toBeVisible();
        await expect(page.locator(href)).toHaveCount(1);
      }
    });

    test('self-hosted Poppins actually loaded', async ({ page }) => {
      const loaded = await page.evaluate(() => document.fonts.check('400 1rem Poppins'));
      expect(loaded).toBe(true);
    });
  });
}
