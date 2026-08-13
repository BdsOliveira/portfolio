import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { renderHero } from '../../js/components/hero.js';
import { createDocument, mountFragment } from './_setup.js';
import { profile, profileFutureStart, profileMissingStartYear } from '../fixtures/index.js';

describe('renderHero', () => {
  test('renders the years of experience derived from experienceStartYear', () => {
    const doc = createDocument();
    const host = mountFragment(doc, renderHero(profile, doc));

    const expected = String(new Date().getFullYear() - profile.experienceStartYear);
    assert.equal(host.textContent.trim(), expected);
  });

  test('derives the value rather than storing it — a different start year moves the result', () => {
    const doc = createDocument();
    const older = { ...profile, experienceStartYear: profile.experienceStartYear - 3 };

    const base = Number(mountFragment(doc, renderHero(profile, doc)).textContent.trim());
    const shifted = Number(mountFragment(doc, renderHero(older, doc)).textContent.trim());

    assert.equal(shifted - base, 3);
  });

  test('does not render name, role or summary — those are static in index.html (R2)', () => {
    const doc = createDocument();
    const text = mountFragment(doc, renderHero(profile, doc)).textContent;

    assert.doesNotMatch(text, new RegExp(profile.name));
    assert.doesNotMatch(text, new RegExp(profile.role));
    assert.doesNotMatch(text, new RegExp(profile.summary));
  });

  test('throws when experienceStartYear is in the future', () => {
    const doc = createDocument();
    assert.throws(() => renderHero(profileFutureStart, doc), /experienceStartYear/);
  });

  test('throws when experienceStartYear is absent', () => {
    const doc = createDocument();
    assert.throws(() => renderHero(profileMissingStartYear, doc), /experienceStartYear/);
  });
});
