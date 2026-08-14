import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Dead code (SC-011, quickstart V12).
 *
 * Every file the site ships must be reachable from the published page. The pre-migration
 * repository carried two abandoned stylesheets, three replaced scripts, and an unused image.
 */

const REPO_ROOT = fileURLToPath(new URL('../../', import.meta.url));

/** Directories whose contents are served to visitors. */
const SHIPPED_DIRS = ['assets', 'css', 'js'];

/**
 * Editable sources that are deliberately not served: the individual icon and illustration
 * SVGs from which the inlined sprite and the raster images are authored. Deleting them would
 * make the shipped assets un-editable, so they are kept and excluded here on purpose.
 */
const SOURCE_FILES = /^assets\/(icons|images)\/.*\.svg$/;

function walk(dir) {
  const entries = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) entries.push(...walk(full));
    else entries.push(relative(REPO_ROOT, full));
  }
  return entries;
}

function referencedPaths() {
  const roots = ['index.html', ...walk(join(REPO_ROOT, 'css')), ...walk(join(REPO_ROOT, 'js'))];
  const referenced = new Set(roots);

  for (const file of roots) {
    const source = readFileSync(join(REPO_ROOT, file), 'utf8');

    for (const match of source.matchAll(/["'(]([^"'()\s]+\.(?:css|js|woff2|webp|png|jpe?g|svg|ico))["')]/g)) {
      const raw = match[1];
      if (raw.startsWith('data:')) continue;

      // A path always contains a separator. Without this, the skill string "Node.js" reads
      // as a file reference and the test invents a dangling js/data/Node.js.
      if (!raw.includes('/')) continue;

      // Absolute URLs still point at a file in this repository — the Open Graph image must
      // be absolute for scrapers, and it is served from assets/.
      if (/^(https?:)?\/\//.test(raw)) {
        referenced.add(new URL(raw, 'https://placeholder.invalid').pathname.replace(/^\/+/, ''));
        continue;
      }

      // Resolve ../ relative to the referencing file's directory.
      const base = file.includes('/') ? file.slice(0, file.lastIndexOf('/')) : '';
      const resolved = new URL(raw, `file:///${base ? `${base}/` : ''}`).pathname.replace(/^\/+/, '');
      referenced.add(resolved);
    }
  }

  return referenced;
}

test('no shipped file is unreferenced by the published page', () => {
  const shipped = SHIPPED_DIRS.flatMap((dir) => walk(join(REPO_ROOT, dir)));
  const referenced = referencedPaths();

  const orphans = shipped
    .filter((file) => !referenced.has(file))
    .filter((file) => !SOURCE_FILES.test(file));

  expect(orphans, `unreferenced file(s): ${orphans.join(', ')}`).toEqual([]);
});

test('every file the page references actually exists', () => {
  const shipped = new Set([
    'index.html',
    ...SHIPPED_DIRS.flatMap((dir) => walk(join(REPO_ROOT, dir))),
  ]);

  const missing = [...referencedPaths()].filter((file) => !shipped.has(file));

  expect(missing, `dangling reference(s): ${missing.join(', ')}`).toEqual([]);
});

test('the files this migration replaced are gone', () => {
  const removed = [
    'css/style.css',
    'css/project-component-style.css',
    'js/Project.js',
    'js/projectCard.js',
    'js/createProjectComponentYourSelfLikeMagic.js',
    'img',
  ];

  const survivors = removed.filter((path) => {
    try {
      statSync(join(REPO_ROOT, path));
      return true;
    } catch {
      return false;
    }
  });

  expect(survivors, `superseded file(s) still present: ${survivors.join(', ')}`).toEqual([]);
});

test('the css directory holds exactly the four mandated stylesheets', () => {
  expect(readdirSync(join(REPO_ROOT, 'css')).sort()).toEqual([
    'base.css',
    'components.css',
    'sections.css',
    'variables.css',
  ]);
});

test('only the two shipped font files are present', () => {
  const fonts = readdirSync(join(REPO_ROOT, 'assets/fonts'));

  expect(fonts.every((file) => file.endsWith('.woff2'))).toBe(true);
  expect(fonts.every((file) => /poppins-(400|600)(-ext)?\.woff2/.test(file))).toBe(true);
});
