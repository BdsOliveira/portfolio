/**
 * Selected Work — the case studies shown under "Trabalhos Selecionados".
 *
 * SHIPS EMPTY, DELIBERATELY. The owner has not yet supplied real case studies, and inventing one
 * is forbidden (FR-025, SC-007). While this array is empty the section does not appear on the
 * page at all — no heading, no container, no gap (FR-002). The renderer, styles and tests are
 * complete and are exercised against tests/fixtures/index.js, so populating this file is a pure
 * data edit with no other change anywhere (FR-026, SC-004).
 *
 * The fictional "Plataforma E-commerce" placeholder that lived here through features 001 and 002
 * has been deleted, together with the test whitelist that justified it (FR-024). It is not to
 * come back: a recruiter who suspects a project is filler learns something worse than nothing.
 *
 * The entity is a WorkEntry (see tests/schemas/index.js). Array order IS display order — no sort
 * runs at render time, so reordering is a data edit and nothing else (FR-048).
 *
 * REQUIRED
 *   id            kebab-case, unique
 *   title
 *   description
 *
 * OPTIONAL — every one of these is omitted from the card entirely when absent, leaving no empty
 * element, no orphaned label and no stray separator (FR-023):
 *   tagline       one line under the title
 *   problem       ┐
 *   solution      │ the case study. Each present part renders as a labelled entry; they always
 *   contribution  │ read in this order regardless of the order you type them in.
 *   architecture  │
 *   result        ┘
 *   technologies  array of strings; renders exactly as many chips as it holds
 *   repositoryUrl absolute https: URL
 *   liveUrl       absolute https: URL
 *   caseStudyUrl  absolute https: URL — a written write-up elsewhere
 *   image         repo-relative path under assets/; requires imageAlt
 *   imageAlt      description of the image, for anyone who cannot see it
 *   isVisible     set false to hide an entry without deleting it. Absent means visible.
 *
 * To add a case study, copy this shape into the array:
 *
 *   {
 *     id: 'nome-do-projeto',
 *     title: 'Nome do Projeto',
 *     description: 'Uma frase sobre o que ele faz.',
 *     problem: 'Que problema real ele resolveu.',
 *     solution: 'O que foi construído.',
 *     contribution: 'O que você fez, especificamente.',
 *     architecture: 'Como foi estruturado, e por quê.',
 *     result: 'O que mudou depois — com números, se você os tiver.',
 *     technologies: ['Laravel', 'PostgreSQL'],
 *     repositoryUrl: 'https://github.com/...',
 *   }
 */
export default [];
