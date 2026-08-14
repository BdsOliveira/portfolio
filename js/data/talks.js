/**
 * Talks — palestras e apresentações dadas pelo dono do site.
 *
 * SHIPS EMPTY, DELIBERATELY. The owner has not yet supplied talks, and inventing one — a title, a
 * date, a description, or a caption for a photograph nobody has looked at — is forbidden (FR-008).
 * While this array is empty the section does not appear on the page at all, and neither does its
 * navigation item (FR-013). The renderer, styles and tests are complete and are exercised against
 * tests/fixtures/index.js, so populating this file is a pure data edit (SC-003).
 *
 * ⚠ NOTHING HERE MAY BE APPROXIMATED. A date the owner cannot state exactly is not a date to
 * guess at; a talk with no photograph is not published until one exists.
 *
 * ARRAY ORDER DOES NOT MATTER. js/components/talks.js sorts by `date`, most recent first, so
 * entries can be appended wherever it is convenient (FR-011).
 *
 * REQUIRED
 *   id           kebab-case, unique. Also the photograph's filename stem
 *   title        the talk's title, as given
 *   date         'AAAA-MM-DD'. A real calendar date, never in the future
 *   description  one or two sentences on what the talk covered
 *   photo        'assets/images/talk-<id>.webp' — 1280×720 WebP, in this repository
 *   photoAlt     what the photograph shows. Never empty, never the title repeated
 *
 * OPTIONAL — absent means no element at all, never an empty one:
 *   event        name of the event it was given at
 *   link         { label, url } — one destination: gravação, slides or event page. The label
 *                must identify where it goes on its own, never 'clique aqui' (FR-006)
 *
 * The photograph is shown in a fixed 16:9 frame, cropped to fill without distortion, so no width
 * or height belongs here — the component reserves the box itself.
 *
 * To add a talk, copy this shape into the array:
 *
 *   {
 *     id: 'observabilidade-antes-do-incidente',
 *     title: 'Observabilidade antes do incidente',
 *     date: '2025-03-12',
 *     description: 'Uma ou duas frases sobre o que a palestra cobriu.',
 *     photo: 'assets/images/talk-observabilidade-antes-do-incidente.webp',
 *     photoAlt: 'O palestrante diante de um telão, apontando para um gráfico de latência',
 *     event: 'PHP Piauí Meetup',
 *     link: {
 *       label: 'Assistir à gravação de "Observabilidade antes do incidente"',
 *       url: 'https://exemplo.com/gravacao',
 *     },
 *   }
 *
 * Committing a photograph without its entry here fails tests/e2e/orphans.spec.js: every file
 * under assets/ must be referenced by something the page ships.
 */
export default [];
