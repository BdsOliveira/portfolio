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
  for (const field of ['name', 'role', 'summary', 'location', 'email']) {
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

  test('every social link carries its descriptive label, not "click here"', () => {
    for (const link of profile.socialLinks) {
      const anchor = doc.querySelector(`a[href="${link.url}"]`);
      const name = (anchor.getAttribute('aria-label') ?? anchor.textContent).trim();

      assert.equal(name, link.label, `${link.platform} link text has drifted from profile.js`);
      assert.doesNotMatch(name, /^(clique aqui|click here|aqui|link)$/i);
    }
  });

  test('the social links use the icon each entry names', () => {
    for (const link of profile.socialLinks) {
      const anchor = doc.querySelector(`a[href="${link.url}"]`);
      const href = anchor.querySelector('use')?.getAttribute('href');

      assert.equal(href, `#${link.icon}`, `${link.platform} renders the wrong glyph`);
    }
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
