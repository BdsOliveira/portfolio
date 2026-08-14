/**
 * Community — technical-community participation.
 *
 * SHIPS EMPTY, DELIBERATELY. The owner has not yet supplied organisations, periods or metrics,
 * and inventing any of them is forbidden (FR-038, SC-007). While this array is empty the section
 * does not appear on the page at all (FR-002). The renderer, styles and tests are complete and
 * are exercised against tests/fixtures/index.js, so populating this file is a pure data edit
 * (SC-004).
 *
 * ⚠ NO METRIC MAY BE ESTIMATED, ROUNDED UP, EXTRAPOLATED OR INVENTED (FR-037).
 *
 * This is the rule most likely to be broken here, because a rounded number reads better and
 * nothing catches it: a schema cannot tell "240 membros" measured from "about 250, probably".
 * If the real figure is not known, omit the metric. A community activity with no metrics renders
 * perfectly well. Zero is a real value and renders — "0 palestras este ano" is a true statement;
 * a guessed "5" is not.
 *
 * Array order IS display order (FR-048).
 *
 * REQUIRED
 *   id            kebab-case, unique
 *   organisation  e.g. 'PHP Piauí'
 *   contribution  what the owner does there, e.g. 'Co-organizador'
 *
 * OPTIONAL — absent means no element at all, never an empty one (FR-023):
 *   period        free text: '2023 – atual', '2021', 'desde 2022'. Not a strict date, because
 *                 forcing a month would mean inventing one.
 *   description   a sentence or two on the involvement
 *   links         [{ label, url }] — the label must say where it goes, on its own (FR-059)
 *   metrics       [{ value, unit }] — e.g. { value: 240, unit: 'membros' }
 *
 * To add an activity, copy this shape into the array:
 *
 *   {
 *     id: 'php-piaui',
 *     organisation: 'PHP Piauí',
 *     contribution: 'Co-organizador',
 *     period: '2023 – atual',
 *     description: 'O que você faz lá, em uma ou duas frases.',
 *     links: [{ label: 'Comunidade PHP Piauí no Meetup', url: 'https://...' }],
 *     metrics: [{ value: 0, unit: 'membros' }],  // apenas números reais
 *   }
 */
export default [];
