import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { renderSkills } from '../../js/components/skills.js';
import { createDocument, mountFragment, textsOf } from './_setup.js';
import { skills, emptyCollection } from '../fixtures/index.js';

const render = (data) => {
  const doc = createDocument();
  const fragment = renderSkills(data, doc);
  return fragment === null ? null : mountFragment(doc, fragment);
};

describe('renderSkills', () => {
  test('renders one group per entry with its name as an <h3>', () => {
    const host = render(skills);
    assert.deepEqual(
      textsOf(host, 'h3'),
      skills.map((group) => group.name),
    );
  });

  test('renders exactly skills.length items per group, whatever the length', () => {
    const host = render(skills);
    const groups = host.querySelectorAll('[data-skill-group]');

    assert.equal(groups.length, skills.length);
    groups.forEach((group, index) => {
      const items = group.querySelectorAll('[data-skill]');
      assert.equal(items.length, skills[index].skills.length);
      assert.deepEqual(
        [...items].map((item) => item.textContent.trim()),
        skills[index].skills,
      );
    });
  });

  test('returns null for an empty collection', () => {
    assert.equal(render(emptyCollection), null);
  });

  test('throws naming entity, field and id when a required field is missing', () => {
    const doc = createDocument();
    const broken = [{ id: 'fixture-broken-group', skills: ['One'] }];

    assert.throws(() => renderSkills(broken, doc), (error) => {
      assert.match(error.message, /SkillGroup/i);
      assert.match(error.message, /name/);
      assert.match(error.message, /fixture-broken-group/);
      return true;
    });
  });
});
