/**
 * HTML ↔ profile.js sync (research R2, contract P-4).
 *
 * Progressive enhancement requires the owner's identity in the served HTML; the
 * data-driven principle requires js/data/profile.js to be the source of truth. Holding two
 * copies of a string is only honest if drift is a caught error — that is this file's whole job.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';

import profile from '../../js/data/profile.js';

const REPO_ROOT = fileURLToPath(new URL('../../', import.meta.url));
const html = readFileSync(`${REPO_ROOT}index.html`, 'utf8');
const doc = parseHTML(html).document;

const staticValue = (field) => doc.querySelector(`[data-profile="${field}"]`)?.textContent.trim();

describe('static HTML matches js/data/profile.js', () => {
  // location and email joined this list in feature 002: primary contact must survive a script
  // failure, so it is authored in the document — which means it can drift, which means it
  // needs this check.
  // `headline` joined in feature 003 for the same reason: FR-018 requires the positioning
  // statement in the served document, which means it can drift, which means it needs this
  // check (FR-010).
  //
  // `availability` is not here because the profile no longer states one. It is optional
  // (FR-013), so its absence is a legitimate state, not a drift — tests/e2e/no-js.spec.js
  // asserts nothing renders in its place.
  for (const field of ['name', 'role', 'headline', 'summary', 'location', 'email']) {
    test(`${field} matches exactly`, () => {
      const inHtml = staticValue(field);

      assert.ok(inHtml !== undefined, `index.html has no [data-profile="${field}"] element`);
      assert.equal(
        inHtml,
        profile[field],
        `index.html and profile.js have drifted apart on "${field}"`,
      );
    });
  }

  test('every About paragraph matches, in order', () => {
    const container = doc.querySelector('[data-profile="about"]');
    assert.ok(container, 'index.html has no [data-profile="about"] container');

    const paragraphs = [...container.querySelectorAll('p')].map((p) => p.textContent.trim());

    assert.deepEqual(
      paragraphs,
      profile.about,
      'index.html and profile.js have drifted apart on the About content',
    );
  });

  for (const key of ['primaryCta', 'secondaryCta']) {
    test(`${key} label and destination match exactly`, () => {
      const anchor = doc.querySelector(`a[data-profile="${key}"]`);

      assert.ok(anchor, `index.html has no [data-profile="${key}"] anchor`);
      assert.equal(anchor.textContent.trim(), profile[key].label, `${key} label has drifted`);
      assert.equal(anchor.getAttribute('href'), profile[key].href, `${key} destination has drifted`);
    });
  }

  test('a CV affordance exists only while profile.cvUrl does (FR-041)', () => {
    const affordances = [...doc.querySelectorAll('[data-profile-optional="cvUrl"]')];

    if (profile.cvUrl === undefined) {
      // js/app.js prunes these at runtime, but a visitor with no script never gets that pass —
      // so while the owner has supplied no CV, the markup must not carry one at all.
      assert.deepEqual(
        affordances.map((node) => node.outerHTML),
        [],
        'index.html offers a CV route the profile has no link for',
      );
    } else {
      assert.ok(affordances.length > 0, 'profile.cvUrl exists but nothing on the page points at it');
    }
  });

  test('the email is an actionable mailto: link, not just text', () => {
    const anchor = doc.querySelector('a[data-profile="email"]');

    assert.ok(anchor, 'index.html has no email anchor');
    assert.equal(anchor.getAttribute('href'), `mailto:${profile.email}`);
    assert.equal(
      anchor.textContent.trim(),
      profile.email,
      'the link text must be the address itself, so its accessible name is descriptive',
    );
  });

  test('the phone number is not published alongside the email', () => {
    // FR-023. The email being static made it tempting to add the phone the same way.
    assert.ok(!html.includes('99806'), 'the phone number reached index.html');
  });

  test('every social link in profile.js is present in the served HTML', () => {
    const hrefs = [...doc.querySelectorAll('a[href]')].map((a) => a.getAttribute('href'));

    for (const link of profile.socialLinks) {
      assert.ok(hrefs.includes(link.url), `${link.platform} link is missing from index.html`);
    }
  });

  /**
   * A destination can legitimately be reachable from more than one place: the secondary call to
   * action points at the GitHub profile, and so does a contact route. FR-073 says that must be a
   * deliberate choice that does not break an assumption of uniqueness — so this asserts what
   * actually matters (at least one anchor carries the profile's label, and *no* anchor to the
   * destination is vaguely named), rather than that exactly one anchor exists.
   */
  test('every social link carries its descriptive label, not "click here"', () => {
    for (const link of profile.socialLinks) {
      const anchors = [...doc.querySelectorAll(`a[href="${link.url}"]`)];
      assert.ok(anchors.length > 0, `${link.platform} link is missing from index.html`);

      const names = anchors.map((a) => (a.getAttribute('aria-label') ?? a.textContent).trim());

      // profile.js's label is the social LIST's copy. A destination reached only from a call to
      // action or a contact route — GitHub, since the Hero's social list dropped it — is named
      // for what it offers there instead, and the naming check below is what governs it.
      if (doc.querySelector(`.social-links a[href="${link.url}"]`)) {
        assert.ok(
          names.includes(link.label),
          `no ${link.platform} anchor carries profile.js's label "${link.label}" — found: ${names.join(' | ')}`,
        );
      }

      for (const name of names) {
        assert.doesNotMatch(name, /^(clique aqui|click here|aqui|link|saiba mais)$/i);
        assert.ok(name.length > 4, `a ${link.platform} anchor has a non-descriptive name: "${name}"`);
      }
    }
  });

  /**
   * Not every social link has to appear in the Hero's social list: GitHub is reached from the
   * secondary call to action instead, so the list carries only LinkedIn. Reachability is the
   * requirement and is asserted above; this asserts the glyph of whichever entries the list
   * does carry, and that the list invents no destination profile.js does not state.
   */
  test('the social list uses the icon each entry names', () => {
    const anchors = [...doc.querySelectorAll('.social-links a[href]')];
    assert.ok(anchors.length > 0, 'the social list is empty');

    for (const anchor of anchors) {
      const url = anchor.getAttribute('href');
      const link = profile.socialLinks.find((entry) => entry.url === url);
      assert.ok(link, `the social list links to ${url}, which profile.js does not state`);

      const href = anchor.querySelector('use')?.getAttribute('href');
      assert.equal(href, `#${link.icon}`, `${link.platform} renders the wrong glyph`);
    }
  });

  /**
   * The JSON-LD block is a mirror under FR-010, so it is verified like every other one. It is
   * also the mirror most likely to rot: nothing on the rendered page changes when it drifts,
   * and the only reader who notices is a crawler nobody is watching (FR-068, research R9).
   */
  describe('the JSON-LD Person block mirrors profile.js', () => {
    const block = doc.querySelector('script[type="application/ld+json"]');

    test('it exists and is valid JSON describing a Person', () => {
      assert.ok(block, 'index.html carries no JSON-LD block');

      const data = JSON.parse(block.textContent);
      assert.equal(data['@type'], 'Person');
      assert.equal(data['@context'], 'https://schema.org');
    });

    test('every field agrees with profile.js, adding no new claim', () => {
      const data = JSON.parse(block.textContent);

      assert.equal(data.name, profile.name);
      assert.equal(data.jobTitle, profile.role);
      assert.equal(data.description, profile.headline);
      assert.equal(data.email, profile.email);
      assert.equal(data.address?.addressLocality, profile.location);
      assert.deepEqual(
        data.sameAs,
        profile.socialLinks.map((link) => link.url),
        'sameAs has drifted from profile.socialLinks',
      );
    });

    test('its url matches the canonical URL the page declares', () => {
      const data = JSON.parse(block.textContent);
      const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute('href');

      assert.equal(data.url, canonical);
    });
  });

  /**
   * FR-072. Same shape as the years-of-experience fallback below: derived at load, with a
   * literal in index.html that keeps the sentence readable before the script runs. The literal
   * can drift by at most a year, which is what this pair asserts.
   */
  describe('the footer copyright year', () => {
    test('has a pre-JS fallback that is a plain year', () => {
      const placeholder = doc.querySelector('#copyright-year');

      assert.ok(placeholder, 'index.html has no #copyright-year element');
      assert.match(placeholder.textContent.trim(), /^\d{4}$/);
    });

    test('the fallback is close enough to the current year to not read as wrong', () => {
      const fallback = Number(doc.querySelector('#copyright-year').textContent.trim());
      const current = new Date().getFullYear();

      assert.ok(
        Math.abs(fallback - current) <= 1,
        `the static copyright year is ${fallback} but the current year is ${current}`,
      );
    });

    test('no other hardcoded year is left in the footer', () => {
      const footer = doc.querySelector('.site-footer');
      const withoutPlaceholder = footer.textContent.replace(/\d{4}/, '');

      assert.doesNotMatch(withoutPlaceholder, /\b(19|20)\d{2}\b/, 'a second literal year survives');
    });
  });

  test('the years-of-experience placeholder has a pre-JS fallback', () => {
    const placeholder = doc.querySelector('#years-of-experience');

    assert.ok(placeholder, 'index.html has no #years-of-experience element');
    assert.match(
      placeholder.textContent.trim(),
      /^\d+$/,
      'the sentence would read incorrectly before the script runs',
    );
  });

  test('the fallback is close enough to the derived value to not read as wrong', () => {
    const fallback = Number(doc.querySelector('#years-of-experience').textContent.trim());
    const derived = new Date().getFullYear() - profile.experienceStartYear;

    assert.ok(
      Math.abs(fallback - derived) <= 1,
      `static fallback is ${fallback} but the derived value is ${derived}`,
    );
  });

  test('no data-rendered section duplicates its content in the markup (FR-009)', () => {
    for (const container of doc.querySelectorAll('[data-mount]')) {
      assert.equal(
        container.textContent.trim(),
        '',
        `${container.getAttribute('data-mount')} has markup that a component also renders`,
      );
    }
  });
});
