import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { renderPhilosophy } from '../../js/components/philosophy.js';
import { createDocument, mountFragment, textsOf } from './_setup.js';
import {
  principles,
  principlesNoDetail,
  principleMissingTitle,
  emptyCollection,
} from '../fixtures/index.js';

/**
 * Contracts PH3-1 … PH3-5.
 *
 * Fixture-based only. js/data/philosophy.js ships with real content, and
 * tests/data/independence.test.js fails if any unit or data test (other than parity.test.js)
 * contains a literal from js/data/ — so this file must never mention a real principle.
 */

const render = (data) => {
  const doc = createDocument();
  const fragment = renderPhilosophy(data, doc);
  return fragment === null ? null : mountFragment(doc, fragment);
};

describe('renderPhilosophy', () => {
  test('PH3-1 · renders one item per principle, in array order', () => {
    const host = render(principles);

    assert.equal(host.querySelectorAll('li').length, principles.length);
    assert.deepEqual(
      textsOf(host, 'li h3'),
      principles.map((principle) => principle.title),
    );
  });

  test('PH3-1 · order follows the array, with no sort at render time', () => {
    const forward = textsOf(render(principles), 'li h3');
    const reversed = textsOf(render([...principles].reverse()), 'li h3');

    assert.deepEqual(reversed, [...forward].reverse());
  });

  test('PH3-1 · repeated items are a single <ul> of <li> (contract C-12)', () => {
    const host = render(principles);

    assert.equal(host.querySelectorAll('ul').length, 1);
    for (const item of host.querySelectorAll('li')) {
      assert.equal(item.parentElement.tagName, 'UL');
    }
  });

  test('PH3-2 · the title is an <h3> and the detail is a sibling element', () => {
    const host = render([principles[0]]);

    assert.equal(host.querySelector('h3').textContent, principles[0].title);

    const detail = host.querySelector('[data-detail]');
    assert.ok(detail, 'the supporting statement was not rendered');
    assert.equal(detail.textContent, principles[0].detail);
    assert.notEqual(detail.tagName, 'H3', 'the detail was rendered as a heading');
  });

  test('PH3-3 · a principle with no detail renders the title alone', () => {
    const host = render(principlesNoDetail);

    assert.equal(host.querySelectorAll('h3').length, 1);
    assert.equal(host.querySelectorAll('[data-detail]').length, 0, 'an empty body was rendered');
  });

  test('PH3-3 · no element rendered is visually empty', () => {
    const host = render(principlesNoDetail);

    const empties = [...host.querySelectorAll('*')].filter(
      (node) => node.children.length === 0 && node.textContent.trim() === '',
    );

    assert.deepEqual(empties.map((node) => node.tagName), []);
  });

  test('PH3-4 · an empty collection returns null', () => {
    assert.equal(render(emptyCollection), null);
  });

  test('PH3-5 · a missing title throws naming entity, field and id', () => {
    const doc = createDocument();

    assert.throws(() => renderPhilosophy(principleMissingTitle, doc), (error) => {
      assert.match(error.message, /Principle/i);
      assert.match(error.message, /title/);
      assert.match(error.message, /fixture-principle-broken/);
      return true;
    });
  });
});
