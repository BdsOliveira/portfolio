import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { revealNavigation, enableMobileNavigation } from '../../js/components/navigation.js';
import { createDocument, loadIndexDocument } from './_setup.js';

/** Contracts N3-1, N3-3, N3-4, N3-7. */

const PAGE = `<!DOCTYPE html><html><body>
  <nav>
    <button type="button" data-nav-toggle aria-controls="nav-list" aria-expanded="false" hidden>Menu</button>
    <ul class="site-nav__list" id="nav-list">
      <li data-nav-for="always"><a href="#always">Always</a></li>
      <li data-nav-for="rendered" hidden><a href="#rendered">Rendered</a></li>
      <li data-nav-for="still-hidden" hidden><a href="#still-hidden">Still hidden</a></li>
      <li data-nav-for="removed" hidden><a href="#removed">Removed</a></li>
    </ul>
  </nav>
  <main>
    <section id="always"><h2>Always</h2></section>
    <section id="rendered"><h2>Rendered</h2></section>
    <section id="still-hidden" hidden><h2>Still hidden</h2></section>
  </main>
</body></html>`;

const itemFor = (doc, id) => doc.querySelector(`[data-nav-for="${id}"]`);

describe('revealNavigation', () => {
  test('N3-1 · reveals an item whose target section rendered', () => {
    const doc = createDocument(PAGE);

    revealNavigation(doc);

    assert.equal(itemFor(doc, 'rendered').hasAttribute('hidden'), false);
  });

  test('N3-1 · leaves an item hidden when its target is still hidden', () => {
    const doc = createDocument(PAGE);

    revealNavigation(doc);

    assert.ok(
      itemFor(doc, 'still-hidden').hasAttribute('hidden'),
      'a link points at a section the visitor cannot see',
    );
  });

  test('N3-1 · leaves an item hidden when its target does not exist at all', () => {
    // This is the shipped case for Selected Work and Community: app.js removed the section
    // because its collection was empty (FR-004, SC-003).
    const doc = createDocument(PAGE);

    revealNavigation(doc);

    assert.ok(itemFor(doc, 'removed').hasAttribute('hidden'));
  });

  test('N3-1 · an already-visible item stays visible', () => {
    const doc = createDocument(PAGE);

    revealNavigation(doc);

    assert.equal(itemFor(doc, 'always').hasAttribute('hidden'), false);
  });

  test('N3-1 · is idempotent and tolerates a document with no navigation', () => {
    const doc = createDocument(PAGE);
    revealNavigation(doc);
    revealNavigation(doc);
    assert.equal(itemFor(doc, 'rendered').hasAttribute('hidden'), false);

    assert.doesNotThrow(() => revealNavigation(createDocument()));
  });
});

describe('enableMobileNavigation', () => {
  const wired = () => {
    const doc = createDocument(PAGE);
    enableMobileNavigation(doc);
    return { doc, toggle: doc.querySelector('[data-nav-toggle]'), nav: doc.querySelector('nav') };
  };

  test('N3-3 · reveals the toggle and marks the navigation collapsible', () => {
    const { toggle, nav } = wired();

    assert.equal(toggle.hasAttribute('hidden'), false, 'the toggle was never revealed');
    assert.equal(nav.getAttribute('data-collapsible'), 'true');
    assert.equal(toggle.getAttribute('aria-expanded'), 'false');
  });

  test('N3-3 · without this call the list is a plain visible list — the no-script fallback', () => {
    const doc = createDocument(PAGE);

    assert.ok(doc.querySelector('[data-nav-toggle]').hasAttribute('hidden'));
    assert.equal(doc.querySelector('nav').getAttribute('data-collapsible'), null);
  });

  test('N3-4 · activating the toggle flips aria-expanded', () => {
    const { toggle } = wired();

    toggle.click();
    assert.equal(toggle.getAttribute('aria-expanded'), 'true');

    toggle.click();
    assert.equal(toggle.getAttribute('aria-expanded'), 'false');
  });

  test('N3-4 · the control is a real <button> pointing at a real list', () => {
    const { doc, toggle } = wired();

    assert.equal(toggle.tagName, 'BUTTON');
    assert.equal(toggle.getAttribute('type'), 'button');
    assert.ok(doc.getElementById(toggle.getAttribute('aria-controls')), 'aria-controls dangles');
  });

  test('N3-6 · following a link closes the disclosure', () => {
    const { doc, toggle } = wired();

    toggle.click();
    assert.equal(toggle.getAttribute('aria-expanded'), 'true');

    doc.querySelector('#nav-list a').click();

    assert.equal(toggle.getAttribute('aria-expanded'), 'false');
  });

  test('N3-6 · closing does not navigate — the browser does', () => {
    // No preventDefault anywhere in the module: smooth scrolling is CSS's job and yields to
    // prefers-reduced-motion on its own (FR-007, FR-008).
    // Comments stripped: the module's own header explains that it calls none of these, and a
    // check that fails on its own documentation teaches people to delete the documentation.
    const source = readFileSync(
      fileURLToPath(new URL('../../js/components/navigation.js', import.meta.url)),
      'utf8',
    )
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/(^|[^:])\/\/.*$/gm, '$1');

    assert.doesNotMatch(source, /preventDefault|scrollIntoView|scrollTo/);
  });

  test('tolerates a document with no navigation at all', () => {
    assert.doesNotThrow(() => enableMobileNavigation(createDocument()));
  });
});

describe('the real index.html navigation', () => {
  test('N3-7 · every navigation destination resolves to a real section', () => {
    const doc = loadIndexDocument();
    const links = [...doc.querySelectorAll('.site-nav__list a[href]')];

    assert.ok(links.length > 0, 'index.html has no navigation links');

    for (const link of links) {
      const href = link.getAttribute('href');
      assert.match(href, /^#/, `${href} is not an in-page anchor`);
      assert.ok(doc.querySelector(href), `${href} points at nothing`);
    }
  });

  test('N3-2 · every item bound to a data-driven section ships hidden', () => {
    const doc = loadIndexDocument();

    for (const item of doc.querySelectorAll('[data-nav-for]')) {
      const id = item.getAttribute('data-nav-for');
      const target = doc.getElementById(id);

      assert.ok(target, `no #${id} section for this navigation item`);
      assert.equal(
        item.hasAttribute('hidden'),
        target.hasAttribute('hidden'),
        `the #${id} navigation item and its section disagree about being hidden`,
      );
    }
  });

  test('the toggle ships hidden, so a no-script visitor gets the full list', () => {
    const doc = loadIndexDocument();
    const toggle = doc.querySelector('[data-nav-toggle]');

    assert.ok(toggle, 'index.html has no navigation toggle');
    assert.ok(toggle.hasAttribute('hidden'));
    assert.equal(toggle.getAttribute('aria-expanded'), 'false');
    assert.ok(doc.getElementById(toggle.getAttribute('aria-controls')));
  });
});
