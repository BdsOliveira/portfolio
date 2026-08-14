import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { renderCertifications } from '../../js/components/certifications.js';
import { createDocument, mountFragment, textsOf } from './_setup.js';
import { certifications, emptyCollection } from '../fixtures/index.js';

const render = (data) => {
  const doc = createDocument();
  const fragment = renderCertifications(data, doc);
  return fragment === null ? null : mountFragment(doc, fragment);
};

describe('renderCertifications', () => {
  test('renders one item per entry with the title as an <h3>', () => {
    const host = render(certifications);
    assert.deepEqual(
      textsOf(host, 'h3'),
      certifications.map((entry) => entry.title),
    );
  });

  test('omits issuer and detail when they are absent — never an empty node', () => {
    const host = render([certifications[1]]);

    assert.equal(host.querySelectorAll('[data-issuer]').length, 0);
    assert.equal(host.querySelectorAll('[data-detail]').length, 0);
  });

  test('renders issuer and detail when present', () => {
    const host = render([certifications[0]]);

    assert.equal(host.querySelector('[data-issuer]').textContent.trim(), certifications[0].issuer);
    assert.equal(host.querySelector('[data-detail]').textContent.trim(), certifications[0].detail);
  });

  test('renders the icon as a sprite reference, not an emoji glyph', () => {
    const host = render(certifications);
    const uses = [...host.querySelectorAll('use')].map((use) => use.getAttribute('href'));

    assert.deepEqual(uses, ['#icon-trophy', '#icon-certificate']);
    assert.doesNotMatch(host.textContent, /\p{Extended_Pictographic}/u);
  });

  test('decorative icons are aria-hidden beside the visible title (contract C-9)', () => {
    const host = render(certifications);
    for (const svg of host.querySelectorAll('svg')) {
      assert.equal(svg.getAttribute('aria-hidden'), 'true');
    }
  });

  test('omits the verification link when verificationUrl is absent', () => {
    assert.equal(render([certifications[1]]).querySelectorAll('a').length, 0);
    assert.equal(render([certifications[0]]).querySelectorAll('a').length, 1);
  });

  /**
   * Evidence is shown, not linked. The whole point of the field is that the reader sees the
   * proof without leaving the page, so a regression back to an anchor is a behaviour change,
   * not a styling one — assert on both halves.
   */
  test('renders evidence as an inline image, never as a link away from the page', () => {
    const entry = certifications[0];
    const image = render([entry]).querySelector('[data-evidence]');

    assert.ok(image, 'the evidence image is missing');
    assert.equal(image.tagName, 'IMG');
    assert.equal(image.getAttribute('src'), entry.evidence.src);
    assert.equal(render([entry]).querySelectorAll(`a[href="${entry.evidence.src}"]`).length, 0);
  });

  // It carries meaning, unlike the badge beside the title, so it is described rather than hidden.
  test('the evidence image is described by the alt text the data supplies', () => {
    const image = render([certifications[0]]).querySelector('[data-evidence]');

    assert.equal(image.getAttribute('alt'), certifications[0].evidence.alt);
    assert.equal(image.getAttribute('aria-hidden'), null);
  });

  // Contract C-8: without both attributes the cards below jump as the photo decodes.
  test('the evidence image reserves its box with intrinsic width and height', () => {
    const { evidence } = certifications[0];
    const image = render([certifications[0]]).querySelector('[data-evidence]');

    assert.equal(image.getAttribute('width'), String(evidence.width));
    assert.equal(image.getAttribute('height'), String(evidence.height));
    assert.equal(image.getAttribute('loading'), 'lazy');
  });

  test('omits the evidence image when the entry has none', () => {
    const { evidence, ...withoutEvidence } = certifications[0];
    const host = render([withoutEvidence]);

    assert.equal(host.querySelectorAll('img').length, 0);
    assert.equal(host.querySelectorAll('[data-evidence]').length, 0);
    assert.equal(host.querySelectorAll('a').length, 1, 'the verification link was lost with it');
  });

  test('returns null for an empty collection', () => {
    assert.equal(render(emptyCollection), null);
  });

  test('throws naming entity, field and id when a required field is missing', () => {
    const doc = createDocument();
    const broken = [{ id: 'fixture-broken-cert', icon: 'icon-trophy' }];

    assert.throws(() => renderCertifications(broken, doc), (error) => {
      assert.match(error.message, /Certification/i);
      assert.match(error.message, /title/);
      assert.match(error.message, /fixture-broken-cert/);
      return true;
    });
  });
});
