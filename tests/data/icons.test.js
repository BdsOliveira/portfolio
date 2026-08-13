/**
 * Sprite reference integrity.
 *
 * Guards the defect this migration exists partly to fix: the footer's LinkedIn link used to
 * carry the GitHub glyph, because both <svg> elements held identical path data.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';

import profile from '../../js/data/profile.js';
import certifications from '../../js/data/certifications.js';

const REPO_ROOT = fileURLToPath(new URL('../../', import.meta.url));
const doc = parseHTML(readFileSync(`${REPO_ROOT}index.html`, 'utf8')).document;

const spriteIds = new Set([...doc.querySelectorAll('symbol[id]')].map((s) => s.getAttribute('id')));
const normalize = (icon) => (icon.startsWith('icon-') ? icon : `icon-${icon}`);

describe('icon sprite', () => {
  test('the sprite is inlined and hidden from assistive technology', () => {
    const sprite = doc.querySelector('svg[aria-hidden="true"] symbol')?.closest('svg');

    assert.ok(sprite, 'no inlined sprite found in index.html');
    assert.equal(sprite.getAttribute('aria-hidden'), 'true');
    assert.match(sprite.getAttribute('style') ?? '', /display\s*:\s*none/);
  });

  test('every symbol id is unique', () => {
    const ids = [...doc.querySelectorAll('symbol[id]')].map((s) => s.getAttribute('id'));
    assert.equal(ids.length, spriteIds.size, 'duplicate symbol id in the sprite');
  });

  test('every source SVG in assets/icons/ has a symbol in the sprite', () => {
    const sources = readdirSync(`${REPO_ROOT}assets/icons`)
      .filter((file) => file.endsWith('.svg'))
      .map((file) => `icon-${file.replace(/\.svg$/, '')}`);

    for (const id of sources) {
      assert.ok(spriteIds.has(id), `assets/icons has ${id} but the sprite does not`);
    }
  });

  test('every symbol has non-empty geometry — no placeholder shells', () => {
    for (const symbol of doc.querySelectorAll('symbol[id]')) {
      const shapes = symbol.querySelectorAll('path, circle, rect, polygon, polyline, line');
      assert.ok(shapes.length > 0, `${symbol.getAttribute('id')} draws nothing`);
    }
  });

  test('no two symbols share identical geometry', () => {
    const seen = new Map();

    for (const symbol of doc.querySelectorAll('symbol[id]')) {
      const geometry = [...symbol.querySelectorAll('path')]
        .map((path) => path.getAttribute('d'))
        .join('|');
      if (!geometry) continue;

      const id = symbol.getAttribute('id');
      assert.ok(
        !seen.has(geometry),
        `${id} has the same path data as ${seen.get(geometry)} — one of them is the wrong glyph`,
      );
      seen.set(geometry, id);
    }
  });

  test('every <use href> in index.html resolves to a symbol', () => {
    for (const use of doc.querySelectorAll('use[href]')) {
      const href = use.getAttribute('href');
      assert.match(href, /^#/, `external sprite reference "${href}" is not allowed`);
      assert.ok(spriteIds.has(href.slice(1)), `"${href}" resolves to no symbol`);
    }
  });

  test('every data-referenced icon resolves to a symbol', () => {
    const referenced = [
      ...profile.socialLinks.map((link) => link.icon),
      ...certifications.map((entry) => entry.icon),
    ];

    for (const icon of referenced) {
      assert.ok(spriteIds.has(normalize(icon)), `data references "${icon}", which has no symbol`);
    }
  });

  test('social links use a distinct icon per platform', () => {
    const icons = profile.socialLinks.map((link) => normalize(link.icon));

    assert.equal(
      new Set(icons).size,
      icons.length,
      `two social links share an icon: ${icons.join(', ')}`,
    );
  });

  test('each social link icon names its own platform', () => {
    for (const link of profile.socialLinks) {
      assert.equal(
        normalize(link.icon),
        `icon-${link.platform.toLowerCase()}`,
        `${link.platform} points at ${link.icon}`,
      );
    }
  });
});
