/**
 * Talks — contracts T4-1 … T4-13 (contracts/components.md).
 *
 * Binds to fixtures and to contracts, never to js/data/talks.js. That collection ships empty and
 * will not stay that way; nothing here may care what is in it.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { renderTalks } from '../../js/components/talks.js';
import { createDocument, mountFragment, textsOf } from './_setup.js';
import {
  talks,
  talkMinimal,
  talkWithEvent,
  talkWithLink,
  talksSameDate,
  talkWithoutField,
  TALK_REQUIRED_FIELDS,
  emptyCollection,
} from '../fixtures/index.js';

const render = (data) => {
  const doc = createDocument();
  const fragment = renderTalks(data, doc);
  return fragment === null ? null : mountFragment(doc, fragment);
};

const idsOf = (host) =>
  [...host.querySelectorAll('[data-talk]')].map((node) => node.getAttribute('data-talk'));

describe('renderTalks', () => {
  test('T4-1 renders one <li class="talk card"> per entry inside a single list', () => {
    const host = render(talks);
    const lists = host.querySelectorAll('ul.talk-list');
    const items = host.querySelectorAll('ul.talk-list > li');

    assert.equal(lists.length, 1);
    assert.equal(items.length, talks.length);

    for (const item of items) {
      assert.ok(item.classList.contains('talk'));
      assert.ok(item.classList.contains('card'));
      assert.ok(item.hasAttribute('data-talk'));
    }
  });

  test('T4-2 orders most recent first, regardless of authoring order', () => {
    // The fixture is authored oldest-first precisely so this can fail.
    const host = render(talks);

    assert.deepEqual(idsOf(host), [
      'fixture-talk-newest',
      'fixture-talk-middle',
      'fixture-talk-oldest',
    ]);
  });

  test('T4-2 does not mutate the collection it was given', () => {
    const input = talks.map((entry) => ({ ...entry }));
    const before = input.map((entry) => entry.id);

    render(input);

    assert.deepEqual(
      input.map((entry) => entry.id),
      before,
    );
  });

  test('T4-2 renders a frozen collection without throwing', () => {
    const frozen = Object.freeze(talks.map((entry) => Object.freeze({ ...entry })));

    assert.doesNotThrow(() => render(frozen));
  });

  test('T4-2 keeps the input order of two talks sharing one date', () => {
    const host = render(talksSameDate);

    assert.deepEqual(idsOf(host), ['fixture-talk-same-first', 'fixture-talk-same-second']);
  });

  test('T4-3 renders the date as DD/MM/AAAA inside <time datetime>', () => {
    const host = render([talks[2]]);
    const time = host.querySelector('time');

    assert.equal(time.getAttribute('datetime'), '2025-03-12');
    assert.equal(time.textContent.trim(), '12/03/2025');
  });

  test('T4-3 renders exactly one <time> per entry', () => {
    const host = render(talks);

    assert.equal(host.querySelectorAll('time').length, talks.length);
  });

  /**
   * Asserted against a flat document-order walk rather than compareDocumentPosition: linkedom
   * reports DOCUMENT_POSITION_PRECEDING when the first node is nested deeper than the second
   * (a <time> inside the meta line versus the description paragraph after it), which is wrong.
   * querySelectorAll returns document order, so positions in that list are the real answer.
   */
  test('T4-4 orders the content photograph → title → date → description', () => {
    const host = render([talks[2]]);
    const item = host.querySelector('[data-talk]');
    const order = [...item.querySelectorAll('*')];

    const positions = ['img', 'h3', 'time', '[data-description]', 'a'].map((selector) => {
      const node = item.querySelector(selector);
      assert.ok(node, `expected ${selector} to be present`);
      return order.indexOf(node);
    });

    assert.deepEqual(
      positions,
      [...positions].sort((a, b) => a - b),
      'card content is not in the order photograph → title → date → description → link',
    );
  });

  for (const field of TALK_REQUIRED_FIELDS) {
    test(`T4-5 throws when "${field}" is missing, naming Talk, the id and the field`, () => {
      assert.throws(
        () => render(talkWithoutField(field)),
        (error) => {
          assert.match(error.message, /Talk/);
          assert.match(error.message, new RegExp(field));
          if (field !== 'id') assert.match(error.message, /fixture-talk-newest/);
          return true;
        },
      );
    });
  }

  test('T4-6 renders one photograph per entry with a meaningful, non-empty alt', () => {
    const host = render(talks);
    const images = [...host.querySelectorAll('img.talk__photo')];

    assert.equal(images.length, talks.length);

    for (const image of images) {
      const alt = image.getAttribute('alt');
      assert.ok(alt !== null && alt.trim() !== '', 'photograph rendered without a description');
    }
  });

  test('T4-6 takes src and alt from the entry', () => {
    const host = render([talks[1]]);
    const image = host.querySelector('img.talk__photo');

    assert.equal(image.getAttribute('src'), talks[1].photo);
    assert.equal(image.getAttribute('alt'), talks[1].photoAlt);
  });

  test('T4-7 omits event and link entirely when absent', () => {
    const host = render(talkMinimal);

    assert.equal(host.querySelectorAll('[data-event]').length, 0);
    assert.equal(host.querySelectorAll('a').length, 0);
  });

  test('T4-7 renders the event when present', () => {
    const host = render(talkWithEvent);

    assert.equal(host.querySelector('[data-event]').textContent.trim(), talkWithEvent[0].event);
    assert.equal(host.querySelectorAll('a').length, 0);
  });

  test('T4-7 renders the link with its label as the accessible name', () => {
    const host = render(talkWithLink);
    const anchor = host.querySelector('a');
    const { label, url } = talkWithLink[0].link;

    assert.equal(anchor.getAttribute('href'), url);
    assert.equal(anchor.textContent.trim(), label);
    assert.equal(anchor.getAttribute('rel'), 'noopener noreferrer');
    assert.equal(anchor.getAttribute('target'), '_blank');
    assert.equal(host.querySelectorAll('[data-event]').length, 0);
  });

  test('T4-7 renders no element whose text is empty', () => {
    for (const fixture of [talks, talkMinimal, talkWithEvent, talkWithLink]) {
      const host = render(fixture);

      for (const node of host.querySelectorAll('*')) {
        if (node.tagName.toLowerCase() === 'img') continue;
        assert.notEqual(node.textContent.trim(), '', `${node.tagName} rendered empty`);
      }
    }
  });

  /**
   * The regression this exists to catch: copying projects.js gives `loading="lazy"` on every
   * image, which is wrong for the first card in a section sitting directly under the hero.
   */
  test('T4-8 loads the first photograph eagerly and every later one lazily', () => {
    const host = render(talks);
    const loading = [...host.querySelectorAll('img.talk__photo')].map((image) =>
      image.getAttribute('loading'),
    );

    assert.deepEqual(loading, ['eager', 'lazy', 'lazy']);
  });

  test('T4-8 decodes every photograph asynchronously and sets no fetchpriority', () => {
    const host = render(talks);

    for (const image of host.querySelectorAll('img.talk__photo')) {
      assert.equal(image.getAttribute('decoding'), 'async');
      assert.equal(image.getAttribute('fetchpriority'), null);
    }
  });

  test('T4-9 reserves a 16:9 box on every photograph', () => {
    const host = render(talks);

    for (const image of host.querySelectorAll('img.talk__photo')) {
      assert.equal(image.getAttribute('width'), '1280');
      assert.equal(image.getAttribute('height'), '720');
    }
  });

  test('T4-10 uses <h3> for the title, and no other heading level', () => {
    const host = render(talks);

    assert.deepEqual(
      textsOf(host, 'h3'),
      ['fixture-talk-newest', 'fixture-talk-middle', 'fixture-talk-oldest'].map(
        (id) => talks.find((entry) => entry.id === id).title,
      ),
    );
    assert.equal(host.querySelectorAll('h1, h2, h4, h5, h6').length, 0);
  });

  test('T4-11 returns null for an empty collection', () => {
    const doc = createDocument();

    assert.equal(renderTalks(emptyCollection, doc), null);
  });
});
