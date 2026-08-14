import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { renderCopyrightYear, pruneOptionalIdentity } from '../../js/components/identity.js';
import { createDocument, mountFragment } from './_setup.js';

/** Contracts I3-1 … I3-4. */

const PAGE = `<!DOCTYPE html><html><body>
  <a id="cv" href="https://example.com/cv.pdf" data-profile-optional="cvUrl">Baixar CV</a>
  <p id="availability" data-profile-optional="availability">Disponível</p>
  <a id="email" href="mailto:x@example.com">x@example.com</a>
</body></html>`;

describe('renderCopyrightYear', () => {
  test('I3-1 · returns the current year, derived rather than stored', () => {
    const doc = createDocument();
    const host = mountFragment(doc, renderCopyrightYear({}, doc));

    assert.equal(host.textContent, String(new Date().getFullYear()));
  });

  test('I3-1 · ignores its data argument entirely', () => {
    const doc = createDocument();

    assert.equal(
      mountFragment(doc, renderCopyrightYear(undefined, doc)).textContent,
      mountFragment(doc, renderCopyrightYear({ year: 1999 }, doc)).textContent,
    );
  });
});

describe('pruneOptionalIdentity', () => {
  test('I3-2 · keeps an affordance whose backing value is present', () => {
    const doc = createDocument(PAGE);

    pruneOptionalIdentity({ cvUrl: 'https://example.com/cv.pdf', availability: 'Disponível' }, doc);

    assert.ok(doc.querySelector('#cv'));
    assert.ok(doc.querySelector('#availability'));
  });

  test('I3-2 · removes an affordance whose backing value is absent', () => {
    const doc = createDocument(PAGE);

    pruneOptionalIdentity({ availability: 'Disponível' }, doc);

    assert.equal(doc.querySelector('#cv'), null, 'the CV link outlived the value behind it');
    assert.ok(doc.querySelector('#availability'));
  });

  test('I3-2 · treats null and an empty string as absent', () => {
    for (const value of [null, '', '   ']) {
      const doc = createDocument(PAGE);
      pruneOptionalIdentity({ cvUrl: value }, doc);
      assert.equal(doc.querySelector('#cv'), null, `${JSON.stringify(value)} was treated as present`);
    }
  });

  test('I3-3 · removes the element rather than hiding or disabling it', () => {
    const doc = createDocument(PAGE);

    pruneOptionalIdentity({}, doc);

    // An inert link that still occupies the page is the failure mode this guards against.
    assert.equal(doc.querySelector('[data-profile-optional="cvUrl"]'), null);
    assert.equal(doc.querySelector('a[href*="cv.pdf"]'), null);
  });

  test('I3-3 · leaves non-optional affordances untouched', () => {
    const doc = createDocument(PAGE);

    pruneOptionalIdentity({}, doc);

    assert.ok(doc.querySelector('#email'), 'a route with no data-profile-optional was removed');
  });

  test('I3-4 · is idempotent', () => {
    const doc = createDocument(PAGE);

    pruneOptionalIdentity({}, doc);
    pruneOptionalIdentity({}, doc);

    assert.equal(doc.querySelector('#cv'), null);
  });

  test('I3-4 · tolerates a profile declaring none of these keys', () => {
    const doc = createDocument(PAGE);
    assert.doesNotThrow(() => pruneOptionalIdentity({ name: 'X' }, doc));
  });

  test('I3-4 · tolerates a missing profile entirely', () => {
    const doc = createDocument(PAGE);
    assert.doesNotThrow(() => pruneOptionalIdentity(undefined, doc));
    assert.doesNotThrow(() => pruneOptionalIdentity(null, doc));
  });

  test('I3-4 · tolerates a document with no optional affordances', () => {
    const doc = createDocument('<!DOCTYPE html><html><body><p>nothing optional here</p></body></html>');
    assert.doesNotThrow(() => pruneOptionalIdentity({ cvUrl: 'https://example.com' }, doc));
  });
});
