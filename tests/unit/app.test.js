import { test, describe, mock } from 'node:test';
import assert from 'node:assert/strict';

import { mount, sections } from '../../js/app.js';
import { createDocument, loadIndexDocument } from './_setup.js';

const PAGE = `<!DOCTYPE html><html><body>
  <section id="alpha"><h2>Alpha</h2><div data-mount="alpha"></div></section>
  <section id="beta"><h2>Beta</h2><div data-mount="beta"></div></section>
  <section id="gamma"><h2>Gamma</h2><div data-mount="gamma"></div></section>
</body></html>`;

const fragmentSaying = (doc, text) => {
  const fragment = doc.createDocumentFragment();
  const p = doc.createElement('p');
  p.textContent = text;
  fragment.append(p);
  return fragment;
};

const binding = (name, render) => ({
  mount: `[data-mount="${name}"]`,
  section: `#${name}`,
  render,
  data: [],
});

describe('app mount harness', () => {
  test('a throwing component removes only its own section; siblings still render', () => {
    const doc = createDocument(PAGE);
    const errors = mock.method(console, 'error', () => {});

    mount(
      [
        binding('alpha', (_data, d) => fragmentSaying(d, 'alpha ok')),
        binding('beta', () => {
          throw new Error('beta exploded');
        }),
        binding('gamma', (_data, d) => fragmentSaying(d, 'gamma ok')),
      ],
      doc,
    );

    assert.ok(doc.querySelector('#alpha'), 'alpha was removed by an unrelated failure');
    assert.equal(doc.querySelector('#beta'), null, 'the failing section was not removed');
    assert.ok(doc.querySelector('#gamma'), 'gamma never rendered — the throw stopped the loop');

    assert.match(doc.querySelector('#alpha').textContent, /alpha ok/);
    assert.match(doc.querySelector('#gamma').textContent, /gamma ok/);
    assert.equal(errors.mock.callCount(), 1, 'the failure was not logged');

    errors.mock.restore();
  });

  test('a component returning null removes its whole section, heading included', () => {
    const doc = createDocument(PAGE);

    mount([binding('beta', () => null)], doc);

    assert.equal(doc.querySelector('#beta'), null);
    assert.ok(doc.querySelector('#alpha'));
  });

  test('a binding with no section to remove leaves its static fallback in place (SC-013)', () => {
    const doc = createDocument(
      '<!DOCTYPE html><html><body><p>+<span id="years">4</span> anos</p></body></html>',
    );
    const errors = mock.method(console, 'error', () => {});

    mount(
      [
        {
          mount: '#years',
          section: null,
          render: () => {
            throw new Error('hero exploded');
          },
          data: {},
        },
      ],
      doc,
    );

    assert.equal(doc.querySelector('#years').textContent, '4', 'the pre-JS fallback was destroyed');
    errors.mock.restore();
  });

  test('mounting replaces the container contents rather than appending to them', () => {
    const doc = createDocument(PAGE);

    mount([binding('alpha', (_d, d) => fragmentSaying(d, 'first'))], doc);
    mount([binding('alpha', (_d, d) => fragmentSaying(d, 'second'))], doc);

    assert.equal(doc.querySelectorAll('[data-mount="alpha"] p').length, 1);
    assert.match(doc.querySelector('[data-mount="alpha"]').textContent, /second/);
  });

  test('every real binding has a mount point present in index.html', () => {
    const doc = loadIndexDocument();

    for (const item of sections) {
      assert.ok(doc.querySelector(item.mount), `index.html has no ${item.mount}`);
      if (item.section) {
        assert.ok(doc.querySelector(item.section), `index.html has no ${item.section}`);
      }
    }
  });

  test('the real bindings render against index.html without stopping each other', () => {
    const doc = loadIndexDocument();
    const errors = mock.method(console, 'error', () => {});

    mount(sections, doc);

    // The hero fallback is replaced by the derived figure; the static identity survives.
    assert.match(doc.querySelector('[data-profile="name"]').textContent, /\S/);
    assert.equal(errors.mock.callCount(), 0, 'a shipped component threw during mount');

    errors.mock.restore();
  });
});
