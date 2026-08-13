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
