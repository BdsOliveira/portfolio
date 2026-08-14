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

    /**
     * FR-065, SC-011, research R10.
     *
     * The original form injected its long string into `.project-card__title`. Selected Work now
     * ships empty, so that element does not exist and the test quietly became a no-op — it
     * passed while asserting nothing, which is worse than failing.
     *
     * Rebound to elements that are always on the page, and to an unbreakable single word rather
     * than a long phrase: a phrase wraps at its spaces without any help, so the old fixture
     * would not have caught the defect it was written for either.
     */
    test('artificially long unbreakable content does not force horizontal scroll', async ({
      page,
    }) => {
      const targets = ['h1', 'h2', '.hero__headline', '.about__paragraph', '.principle__detail'];

      for (const selector of targets) {
        const overflowed = await page.evaluate((sel) => {
          const node = document.querySelector(sel);
          if (!node) return null;

          const original = node.textContent;
          node.textContent = 'Plataforma'.repeat(12);

          const overflows =
            document.documentElement.scrollWidth > document.documentElement.clientWidth;

          node.textContent = original;
          return overflows;
        }, selector);

        expect(overflowed, `a long word in ${selector} pushed the page sideways`).not.toBe(true);
      }
    });

    test('no element overflows its container (SC-011)', async ({ page }) => {
      const offenders = await page.evaluate(() => {
        const root = document.documentElement;
        return [...document.querySelectorAll('body *')]
          .filter((node) => {
            const box = node.getBoundingClientRect();
            return box.width > 0 && (box.right > root.clientWidth + 1 || box.left < -1);
          })
          .map((node) => `${node.tagName.toLowerCase()}.${node.className}`)
          .slice(0, 10);
      });

      expect(offenders).toEqual([]);
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

/**
 * The header's row count, with EVERY navigation destination revealed (FR-015, SC-010, N4-3).
 *
 * Two collections ship empty today, so the live page shows eight of eleven items and would pass
 * this trivially — which is exactly the wrong time to find out that populating them breaks the
 * header. Every item is force-revealed first, so this measures the worst case rather than the
 * current one.
 *
 * Why it matters beyond looks: css/variables.css sizes `--anchor-offset` against a two-row header.
 * A third row means every anchor link lands with its heading under the header (FR-014), and
 * nothing else in the suite would notice.
 *
 * The 768–1000px band is where the row already wraps, so it is sampled more finely than the rest.
 */
const WIDTHS = [320, 375, 640, 768, 820, 900, 1000, 1024, 1280, 1440];

test.describe('the navigation fits the header', () => {
  test('no width takes more rows than the two-row worst case (FR-015, SC-010)', async ({
    page,
  }) => {
    const offenders = [];

    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');

      const measured = await page.evaluate(() => {
        for (const item of document.querySelectorAll('[data-nav-for]')) item.removeAttribute('hidden');

        const list = document.getElementById('site-nav-list');
        const header = document.querySelector('.site-header');

        // Collapsed into the disclosure at this width: the list is not laid out as a row at all,
        // so a row count would be meaningless. The header is one row by construction there.
        if (getComputedStyle(list).display === 'none') return { rows: 1, collapsed: true };

        // Distinct vertical positions of the items themselves — the only honest way to count
        // wrapped rows in a flex row.
        const tops = new Set(
          [...list.querySelectorAll('li')]
            .filter((item) => !item.hasAttribute('hidden'))
            .map((item) => Math.round(item.getBoundingClientRect().top)),
        );

        return {
          rows: tops.size,
          collapsed: false,
          headerHeight: Math.round(header.getBoundingClientRect().height),
        };
      });

      if (measured.rows > 2) offenders.push({ width, ...measured });
    }

    expect(
      offenders,
      'the header takes a third row — see research R3: move the nav disclosure breakpoint from 48rem to 64rem',
    ).toEqual([]);
  });

  /**
   * FR-014, N4-4. The section sits directly under the hero, so its heading is the one most likely
   * to end up behind the sticky header when a hash link is followed — `--anchor-offset` is what
   * prevents it, and it is sized by hand rather than measured.
   */
  test('following #talks leaves its heading clear of the sticky header (FR-014)', async ({
    page,
  }) => {
    for (const width of [375, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');

      // The section is removed while the collection is empty (FR-013), so reveal it for the
      // measurement rather than skipping the assertion — a skipped test here is a test that stops
      // covering this the moment the owner adds a talk.
      const present = await page.evaluate(() => {
        const section = document.getElementById('talks');
        if (!section) return false;
        section.removeAttribute('hidden');
        return true;
      });

      if (!present) {
        // Section absent from the served document entirely would be a structure defect, and
        // tests/e2e/structure.spec.js owns that assertion. Nothing to measure here.
        continue;
      }

      await page.evaluate(() => {
        document.querySelector('a[href="#talks"]').click();
      });
      await page.waitForTimeout(400);

      const clear = await page.evaluate(() => {
        const heading = document.getElementById('talks-heading');
        const header = document.querySelector('.site-header');

        return (
          heading.getBoundingClientRect().top >= header.getBoundingClientRect().bottom - 1
        );
      });

      expect(clear, `#talks-heading is under the sticky header at ${width}px`).toBe(true);
    }
  });
});
