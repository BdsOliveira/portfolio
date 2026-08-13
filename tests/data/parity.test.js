/**
 * Content parity (SC-002, US2).
 *
 * The one suite in this project that is deliberately bound to content values: it exists to
 * prove the migration lost nothing. The reference is
 * specs/001-data-driven-migration/content-inventory.md, captured from the pre-migration page.
 *
 * Excluded from the content-independence check (tests/data/independence.test.js) for exactly
 * that reason — every other suite binds to contracts instead.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';

import { mount, sections } from '../../js/app.js';

const REPO_ROOT = fileURLToPath(new URL('../../', import.meta.url));

const normalize = (value) => value.replace(/\s+/g, ' ').trim().toLowerCase();

// The page as a visitor receives it: served HTML plus everything the components mount.
const doc = parseHTML(readFileSync(`${REPO_ROOT}index.html`, 'utf8')).document;
mount(sections, doc);
const text = normalize(doc.body.textContent);

const present = (value) => text.includes(normalize(value));

const SECTION_HEADINGS = [
  'Habilidades Técnicas',
  'Projetos Recentes',
  'Certificações',
  'Entre em Contato',
];

const NAV_LABELS = ['Home', 'Skills', 'Projetos', 'Certificações', 'Contato'];

const IDENTITY = [
  'Bruno Oliveira',
  'Desenvolvedor Fullstack',
  'anos de experiência',
  'soluções robustas e escaláveis',
];

const SKILL_GROUPS = ['Frontend', 'Backend', 'Bancos de Dados', 'Ferramentas', 'Mobile'];

const SKILL_TAGS = [
  'VueJS', 'NuxtJS', 'Tailwind', 'JavaScript', 'Vite', 'Vuetify',
  'PHP', 'Laravel', 'Node.js',
  'SQL', 'MySQL', 'MongoDB', 'Indexação de Dados', 'Análise de Dados',
  'Docker', 'Git', 'GitHub Actions', 'Postman', 'Insomnia',
  'Flutter', 'BLOC',
];

const PROJECT_CONTENT = [
  'Plataforma E-commerce',
  'Solução completa com carrinho, pagamentos e painel administrativo',
];

const CERTIFICATION_CONTENT = [
  'II Maratona de Programação da PUC-GOIÁS',
  'Medalha de Prata - 2017',
  'EF SET English Certificate',
  'Score 49/100 (B1 Intermediate)',
];

const CONTACT_FIELDS = ['Nome', 'Email', 'Mensagem', 'Enviar Mensagem'];

const LINK_DESTINATIONS = [
  'https://github.com/BdsOliveira',
  'https://www.linkedin.com/in/bruno-oliveira/',
];

const SECTION_IDS = ['#hero', '#skills', '#projects', '#certifications', '#contact'];

describe('content parity with the pre-migration page', () => {
  const cases = [
    ['section headings', SECTION_HEADINGS],
    ['navigation labels', NAV_LABELS],
    ['identity content', IDENTITY],
    ['skill groups', SKILL_GROUPS],
    ['skill tags', SKILL_TAGS],
    ['project content', PROJECT_CONTENT],
    ['certification content', CERTIFICATION_CONTENT],
    ['contact form fields', CONTACT_FIELDS],
  ];

  for (const [label, values] of cases) {
    test(`every one of the ${values.length} ${label} survives`, () => {
      const missing = values.filter((value) => !present(value));
      assert.deepEqual(missing, [], `${label} lost in migration`);
    });
  }

  test('every section still exists', () => {
    const missing = SECTION_IDS.filter((id) => !doc.querySelector(id));
    assert.deepEqual(missing, []);
  });

  test('every link destination survives', () => {
    const hrefs = [...doc.querySelectorAll('a[href]')].map((a) => a.getAttribute('href'));
    const missing = LINK_DESTINATIONS.filter((url) => !hrefs.includes(url));
    assert.deepEqual(missing, []);
  });

  test('all 21 skill tags render as distinct chips', () => {
    const chips = [...doc.querySelectorAll('[data-skill]')].map((chip) => chip.textContent.trim());
    assert.equal(chips.length, SKILL_TAGS.length);
    assert.deepEqual([...chips].sort(), [...SKILL_TAGS].sort());
  });

  test('the footer copyright survives', () => {
    assert.ok(present('Bruno Oliveira. Todos os direitos reservados.'));
  });

  describe('deliberate removals', () => {
    const html = () => readFileSync(`${REPO_ROOT}index.html`, 'utf8');

    test('the Tailwind CDN script is gone', () => {
      assert.doesNotMatch(html(), /cdn\.tailwindcss\.com/);
    });

    test('the Google Fonts link is gone', () => {
      assert.doesNotMatch(html(), /fonts\.(googleapis|gstatic)\.com/);
    });

    test('the inline years-of-experience script is gone', () => {
      assert.doesNotMatch(html(), /getFullYear/);
    });

    test('no emoji is used as an icon', () => {
      assert.doesNotMatch(html(), /🏆|📘/u);
    });

    test('Tailwind utility classes are gone', () => {
      const classes = [...html().matchAll(/class="([^"]*)"/g)].flatMap((m) => m[1].split(/\s+/));
      // Tailwind utilities are either `prefix-value`, a bare layout keyword, or `variant:`.
      // Matching on a bare letter prefix would flag BEM names like `hero`, so don't.
      const SCALED = /^(bg|text|px|py|pt|pb|pl|pr|mt|mb|ml|mr|mx|my|w|h|max-w|min-w|gap|space|rounded|shadow|z|border|leading|tracking|opacity|col|row|justify|items|font)-/;
      const BARE = new Set([
        'flex', 'grid', 'block', 'inline-block', 'hidden', 'container',
        'fixed', 'absolute', 'relative', 'transition', 'truncate',
      ]);
      const VARIANT = /^(sm|md|lg|xl|2xl|hover|focus|active|dark|group-hover):/;

      const utilities = classes.filter(
        (name) => SCALED.test(name) || BARE.has(name) || VARIANT.test(name),
      );
      assert.deepEqual(utilities, []);
    });
  });
});
