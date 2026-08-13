import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { renderExperience } from '../../js/components/experience.js';
import { createDocument, mountFragment, textsOf } from './_setup.js';
import { experiences, emptyCollection } from '../fixtures/index.js';

const render = (data) => {
  const doc = createDocument();
  const fragment = renderExperience(data, doc);
  return fragment === null ? null : mountFragment(doc, fragment);
};

describe('renderExperience', () => {
  test('renders one item per entry with "{title} — {company}" as an <h3>', () => {
    const host = render(experiences);
    assert.deepEqual(
      textsOf(host, 'h3'),
      experiences.map((entry) => `${entry.title} — ${entry.company}`),
    );
  });

  test('renders a null endDate as "Atual"', () => {
    const host = render([experiences[1]]);
    assert.match(host.textContent, /Atual/);
  });

  test('renders a closed date range without "Atual"', () => {
    const host = render([experiences[0]]);
    assert.doesNotMatch(host.textContent, /Atual/);
  });

  test('dates use <time datetime="YYYY-MM">', () => {
    const host = render([experiences[0]]);
    const datetimes = [...host.querySelectorAll('time')].map((t) => t.getAttribute('datetime'));

    assert.deepEqual(datetimes, [experiences[0].startDate, experiences[0].endDate]);
    for (const value of datetimes) assert.match(value, /^\d{4}-\d{2}$/);
  });

  test('omits achievements entirely when absent or empty', () => {
    assert.equal(render([experiences[1]]).querySelectorAll('[data-achievement]').length, 0);
    assert.equal(
      render([{ ...experiences[1], achievements: [] }]).querySelectorAll('[data-achievement]').length,
      0,
    );
  });

  test('renders exactly achievements.length items when present', () => {
    const host = render([experiences[0]]);
    assert.equal(
      host.querySelectorAll('[data-achievement]').length,
      experiences[0].achievements.length,
    );
  });

  test('returns null for the empty collection it ships with', () => {
    assert.equal(render(emptyCollection), null);
  });

  test('throws naming entity, field and id when a required field is missing', () => {
    const doc = createDocument();
    const broken = [{ id: 'fixture-broken-job', title: 'Engineer', startDate: '2020-01', endDate: null }];

    assert.throws(() => renderExperience(broken, doc), (error) => {
      assert.match(error.message, /Experience/i);
      assert.match(error.message, /company/);
      assert.match(error.message, /fixture-broken-job/);
      return true;
    });
  });
});
