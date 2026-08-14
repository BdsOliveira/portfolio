/**
 * Content parity (feature 002: SC-001, SC-002, FR-026).
 *
 * The one suite in this project that is deliberately bound to content *values*. Every other
 * suite binds to contracts, and tests/data/independence.test.js enforces that — exempting this
 * file **by filename**. Renaming it silently removes the exemption and breaks that suite, so
 * the name `parity.test.js` is load-bearing. Leave it alone.
 *
 * Reference document: specs/002-cv-content-update/content-inventory.md.
 *
 * That reference is what makes "every statement on the page traces to the CV" (FR-026) a
 * mechanical check rather than an opinion: a string on the page and not in the inventory fails
 * here, and so does a string in the inventory and not on the page.
 *
 * History: this suite was written for feature 001, where it proved the data-driven migration
 * lost none of the pre-migration page's content, against
 * specs/001-data-driven-migration/content-inventory.md. Feature 002 replaced that content
 * wholesale with the owner's CV, so the reference moved. The purpose did not.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
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

/**
 * Headings that must be on the rendered page.
 *
 * "Trabalhos Selecionados" (feature 003's replacement for "Projetos Recentes") is deliberately
 * NOT here: its collection ships empty, so app.js removes the section outright and the heading
 * is correctly absent (FR-025, SC-003). The section's own absence is asserted below.
 *
 * Experiência and Formação render for the first time in feature 002: their collections shipped
 * empty in 001, so app.js removed both sections outright.
 */
const SECTION_HEADINGS = [
  'Sobre',
  'Habilidades Técnicas',
  'Como Trabalho',
  'Certificações',
  'Experiência',
  'Formação',
  'Entre em Contato',
];

/**
 * Navigation labels are page chrome, not CV content, and feature 003 changes them deliberately:
 * FR-004 requires a link to every section present on the page, which the pre-migration five did
 * not provide — Experience and Education were unreachable. "Home" became "Início" in the same
 * pass, since the rest of the navigation is Portuguese.
 *
 * The list is kept, rather than deleted, because it is still the only check that would notice a
 * navigation destination silently disappearing. Nothing about the CV assertions below changes
 * (FR-051, SC-015).
 */
const NAV_LABELS = [
  'Início',
  'Sobre',
  'Experiência',
  'Trabalhos',
  'Skills',
  'Como Trabalho',
  'Comunidade',
  'Formação',
  'Certificações',
  'Contato',
];

// content-inventory.md §1
const IDENTITY = [
  'Bruno Oliveira',
  'Software Engineer',
  'anos de experiência',
  'Especializado em PHP/Laravel, APIs REST e sistemas distribuídos',
];

// content-inventory.md §4 — the CV's COMPETÊNCIAS line, grouped.
const SKILL_GROUPS = [
  'Backend',
  'Frontend',
  'Bancos de Dados',
  'Infraestrutura e DevOps',
  'Arquitetura e Integração',
  'Práticas',
];

const SKILL_TAGS = [
  'PHP', 'Laravel', 'NestJS',
  'Next.js', 'Vue.js', 'React',
  'Oracle Database', 'MySQL', 'Redis',
  'Docker', 'RabbitMQ', 'GitLab CI/CD',
  'Arquitetura de Software', 'Microsserviços', 'APIs REST', 'Mensageria', 'Integração entre Sistemas',
  'Desenvolvimento Full Stack', 'Engenharia de Software Assistida por IA',
];

/**
 * Technologies the CV drops. Asserted absent, not merely un-asserted — a stale stack is a
 * false claim about the owner, and "we forgot to remove it" looks identical to "we still
 * claim it" from the reader's side.
 *
 * Excludes anything that is a substring of a surviving string ("Git" is inside "GitLab CI/CD",
 * "SQL" is inside "MySQL"), which a page-text scan cannot distinguish.
 */
const REMOVED_SKILLS = [
  'NuxtJS', 'Vuetify', 'Vite', 'MongoDB', 'Insomnia', 'Postman', 'Flutter', 'BLOC',
  'GitHub Actions', 'Indexação de Dados', 'Análise de Dados', 'Mobile',
];

/**
 * The whitelist that used to live here is gone (feature 003, FR-024).
 *
 * Through features 001 and 002 these two strings were the only content on the page that did not
 * trace to the CV — a fictional "Plataforma E-commerce" placeholder, asserted *present* under a
 * documented exception so it could not vanish or linger unnoticed.
 *
 * Feature 003 deletes the placeholder and ships Selected Work empty (FR-025). So the assertion
 * inverts: these strings must now be **absent**. Deleting this list entirely would remove the
 * only signal that would notice the placeholder coming back.
 */
const REMOVED_PLACEHOLDER_CONTENT = [
  'Plataforma E-commerce',
  'Solução completa com carrinho, pagamentos e painel administrativo',
];

const CERTIFICATION_CONTENT = [
  'II Maratona de Programação da PUC-GOIÁS',
  'Medalha de Prata - 2017',
  'EF SET English Certificate',
  'Score 49/100 (B1 Intermediate)',
];

// content-inventory.md §2. Employers, titles, locations and rendered periods; the achievement
// bullets are asserted separately below because there are 14 of them.
const EXPERIENCE_CONTENT = [
  'CWI Software',
  'São Leopoldo, RS – Brasil · Remoto',
  'DevSquad',
  'Utah, EUA · Remoto',
  'CajuTec',
  'Software Engineer / Tech Lead',
  'Parnaíba, PI – Brasil · Presencial',
];

const EXPERIENCE_ACHIEVEMENTS = [
  // CWI Software
  "Atuação na evolução de uma plataforma de oncologia utilizada pela Rede D'Or",
  'migrando a arquitetura de Symfony (PHP) e Angular para NestJS e Next.js',
  'correção de bugs, refatoração de código e Code Review',
  'integrações entre serviços utilizando RabbitMQ',
  'Docker, Redis e Oracle Database',
  // DevSquad
  'produtos internos e soluções para clientes internacionais',
  'APIs REST, arquiteturas orientadas a serviços',
  'plataforma de gerenciamento de infraestrutura para aluguel de GPUs',
  'decisões de arquitetura, modelagem de sistemas',
  'Claude Code, OpenCode e Specification-Driven Development (SDD)',
  // CajuTec
  'plataforma de gestão acadêmica utilizada por diversas instituições de ensino',
  'Implementação do Sentry para monitoramento de erros',
  'processos de deploy, infraestrutura e configuração de servidores',
  'mentoria de desenvolvedores Laravel',
];

// The contact form was removed by the owner's decision: there is no backend to submit to, and
// the contact routes are the only contact paths. These strings must stay off the page — a form
// that posts nowhere is a dead end for a recruiter, worse than no form at all.
const REMOVED_FORM_CONTENT = ['Nome', 'Mensagem', 'Enviar Mensagem'];

// content-inventory.md §1 — published contact routes. The phone number is deliberately absent
// and is asserted absent by the suite at the bottom of this file.
const CONTACT_DETAILS = ['Parnaíba, PI – Brasil', 'bds.commus@gmail.com'];

const LINK_DESTINATIONS = [
  'https://github.com/BdsOliveira',
  'https://www.linkedin.com/in/bruno-oliveira/',
];

/**
 * Sections that must be present on the rendered page. `#work` is not here for the same reason
 * its heading is not: the collection is empty, so the section is removed (FR-002, SC-003).
 */
const SECTION_IDS = [
  '#hero',
  '#about',
  '#skills',
  '#philosophy',
  '#certifications',
  '#experience',
  '#education',
  '#contact',
];

describe('the page states what the CV states', () => {
  const cases = [
    ['section headings', SECTION_HEADINGS],
    ['navigation labels', NAV_LABELS],
    ['identity content', IDENTITY],
    ['skill groups', SKILL_GROUPS],
    ['skill tags', SKILL_TAGS],
    ['certification content', CERTIFICATION_CONTENT],
    ['experience content', EXPERIENCE_CONTENT],
    ['experience achievements', EXPERIENCE_ACHIEVEMENTS],
    ['contact details', CONTACT_DETAILS],
  ];

  for (const [label, values] of cases) {
    test(`every one of the ${values.length} ${label} survives`, () => {
      const missing = values.filter((value) => !present(value));
      assert.deepEqual(missing, [], `${label} lost in migration`);
    });
  }

  test('the contact form is gone and stays gone', () => {
    const survivors = REMOVED_FORM_CONTENT.filter((value) => present(value));

    assert.deepEqual(survivors, [], 'the contact form is back on the page');
    assert.equal(doc.querySelector('form'), null, 'the page has a <form> again');
  });

  test('the placeholder project is gone and stays gone (FR-024)', () => {
    const survivors = REMOVED_PLACEHOLDER_CONTENT.filter((value) => present(value));

    assert.deepEqual(
      survivors,
      [],
      'the fictional placeholder project is back on the page — no fact may be stated that the owner did not supply (SC-007)',
    );
  });

  test('every section still exists', () => {
    const missing = SECTION_IDS.filter((id) => !doc.querySelector(id));
    assert.deepEqual(missing, []);
  });

  test('every link destination survives', () => {
    const hrefs = [...doc.querySelectorAll('a[href]')].map((a) => a.getAttribute('href'));
    const missing = LINK_DESTINATIONS.filter((url) => !hrefs.includes(url));
    assert.deepEqual(missing, []);
  });

  test('the email is reachable in one click', () => {
    const hrefs = [...doc.querySelectorAll('a[href]')].map((a) => a.getAttribute('href'));
    assert.ok(hrefs.includes('mailto:bds.commus@gmail.com'));
  });

  // Exact count and exact set, deliberately: this pair is what catches a skill silently
  // dropped while regrouping the CV's flat list into cards.
  test('all 19 skill tags render as distinct chips', () => {
    const chips = [...doc.querySelectorAll('[data-skill]')].map((chip) => chip.textContent.trim());
    assert.equal(chips.length, SKILL_TAGS.length);
    assert.deepEqual([...chips].sort(), [...SKILL_TAGS].sort());
  });

  test('technologies the CV no longer lists are gone', () => {
    const chips = new Set(
      [...doc.querySelectorAll('[data-skill]')].map((chip) => chip.textContent.trim()),
    );
    const groups = new Set(
      [...doc.querySelectorAll('[data-skill-group]')].map((group) =>
        group.querySelector('h3').textContent.trim(),
      ),
    );

    const survivors = REMOVED_SKILLS.filter((name) => chips.has(name) || groups.has(name));
    assert.deepEqual(survivors, [], 'a superseded technology is still advertised as current');
  });

  test('the footer copyright survives', () => {
    assert.ok(present('Bruno Oliveira. Todos os direitos reservados.'));
  });

  describe('experience', () => {
    const items = [...doc.querySelectorAll('[data-experience]')];

    test('all three roles render, newest first', () => {
      assert.deepEqual(
        items.map((item) => item.getAttribute('data-experience')),
        ['cwi-software', 'devsquad', 'cajutec'],
      );
    });

    test('the ongoing role reads "Atual" and the closed ones do not', () => {
      assert.match(items[0].textContent, /Atual/);
      assert.doesNotMatch(items[1].textContent, /Atual/);
      assert.doesNotMatch(items[2].textContent, /Atual/);
    });

    test('every role states its work-location context', () => {
      const missing = items.filter((item) => !item.querySelector('[data-location]'));
      assert.deepEqual(missing.map((item) => item.getAttribute('data-experience')), []);
    });

    test('the periods render as the CV states them', () => {
      const dates = items.map((item) => normalize(item.querySelector('.timeline__dates').textContent));

      assert.match(dates[0], /09\/2026 – atual/);
      assert.match(dates[1], /11\/2025 – 07\/2026/);
      assert.match(dates[2], /10\/2022 – 09\/2025/);
    });

    test('all 14 achievement bullets render', () => {
      assert.equal(doc.querySelectorAll('[data-achievement]').length, 14);
    });
  });

  describe('education', () => {
    const items = [...doc.querySelectorAll('[data-education]')];

    test('both academic entries render', () => {
      assert.deepEqual(
        items.map((item) => item.getAttribute('data-education')),
        ['mba-engenharia-software-ia', 'tecnico-desenvolvimento-software'],
      );
    });

    test('both institutions and qualifications are stated', () => {
      for (const value of [
        'Faculdade Full Cycle',
        'MBA em Engenharia de Software com Inteligência Artificial',
        'Instituto Federal do Piauí (IFPI)',
        'Técnico em Desenvolvimento de Software',
      ]) {
        assert.ok(present(value), `${value} is missing from the page`);
      }
    });

    test('the in-progress MBA is marked as such', () => {
      assert.match(items[0].textContent, /Em andamento/);
    });

    test('the undated completed course renders no date and no false progress claim', () => {
      // The CV states no year for it, so the page states no year — and must not imply the
      // course is still running just because its end year is unknown.
      assert.equal(items[1].querySelector('[data-dates]'), null);
      assert.doesNotMatch(items[1].textContent, /Em andamento/);
    });

    test('no year is invented for either entry', () => {
      for (const item of items) assert.doesNotMatch(item.textContent, /\b(19|20)\d{2}\b/);
    });
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

/**
 * Content that must never be published (FR-023, data-model validation rule 11).
 *
 * The owner's CV carries a personal mobile number. The owner decided it stays off the public
 * page: a static page is scraped continuously, and a number published once cannot be recalled.
 *
 * This is asserted rather than remembered. A published phone number is not the kind of mistake
 * that can be undone by a later commit, so the guard is mechanical and covers both the rendered
 * page and every shipped file — including places a rendered-text check would never look, such
 * as an HTML comment, a data module, or a CSS content string.
 */
describe('the phone number is published nowhere', () => {
  // Digits only: matches "99806-3078", "998063078", "+55 86 99806-3078" and every other
  // formatting, because it looks at the part that does not change.
  const PHONE_FRAGMENT = '99806';

  /** Directories whose contents reach a visitor. */
  const SHIPPED_DIRS = ['assets', 'css', 'js'];

  function walk(dir) {
    const found = [];
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) found.push(...walk(full));
      else found.push(full);
    }
    return found;
  }

  test('it is absent from the rendered page', () => {
    assert.ok(
      !text.includes(PHONE_FRAGMENT),
      'the phone number reached the rendered page (FR-023)',
    );
  });

  test('it is absent from every shipped file', () => {
    const offenders = [];

    for (const file of [join(REPO_ROOT, 'index.html'), ...SHIPPED_DIRS.flatMap((dir) => walk(join(REPO_ROOT, dir)))]) {
      let source;
      try {
        source = readFileSync(file, 'utf8');
      } catch {
        continue; // binary asset (font, image) — nothing to read as text
      }
      if (source.includes(PHONE_FRAGMENT)) offenders.push(relative(REPO_ROOT, file));
    }

    assert.deepEqual(offenders, [], 'the phone number is present in a file the site ships');
  });
});
