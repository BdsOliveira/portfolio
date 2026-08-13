import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { renderEducation } from '../../js/components/education.js';
import { createDocument, mountFragment, textsOf } from './_setup.js';
import { education, emptyCollection } from '../fixtures/index.js';

const render = (data) => {
  const doc = createDocument();
  const fragment = renderEducation(data, doc);
  return fragment === null ? null : mountFragment(doc, fragment);
};

describe('renderEducation', () => {
  test('renders one item per entry with the qualification as an <h3>', () => {
    const host = render(education);
    assert.deepEqual(
      textsOf(host, 'h3'),
      education.map((entry) => entry.qualification),
    );
  });

  test('renders the institution for every entry', () => {
    const host = render(education);
    for (const entry of education) {
      assert.match(host.textContent, new RegExp(entry.institution));
    }
  });

  test('renders a null endYear as "Em andamento"', () => {
    assert.match(render([education[1]]).textContent, /Em andamento/);
  });

  test('renders a completed course without "Em andamento"', () => {
    assert.doesNotMatch(render([education[0]]).textContent, /Em andamento/);
  });

  test('omits field when absent — never an empty node', () => {
    assert.equal(render([education[1]]).querySelectorAll('[data-field]').length, 0);
    assert.equal(render([education[0]]).querySelectorAll('[data-field]').length, 1);
  });

  test('returns null for the empty collection it ships with', () => {
    assert.equal(render(emptyCollection), null);
  });

  test('throws naming entity, field and id when a required field is missing', () => {
    const doc = createDocument();
    const broken = [{ id: 'fixture-broken-degree', institution: 'X', startYear: 2020, endYear: null }];

    assert.throws(() => renderEducation(broken, doc), (error) => {
      assert.match(error.message, /Education/i);
      assert.match(error.message, /qualification/);
      assert.match(error.message, /fixture-broken-degree/);
      return true;
    });
  });
});
