/**
 * Education.
 *
 * Neither year is required. `endYear: null` means in progress; `endYear` absent means the end
 * is simply not recorded. The two are different claims and must not be collapsed — see the
 * comment in js/components/education.js.
 *
 * The source CV dates neither qualification, so neither entry carries years. Adding real years
 * later is a data edit and nothing else.
 */
export default [
  {
    id: 'mba-engenharia-software-ia',
    institution: 'Faculdade Full Cycle',
    qualification: 'MBA em Engenharia de Software com Inteligência Artificial',
    endYear: null,
  },
  {
    id: 'tecnico-desenvolvimento-software',
    institution: 'Instituto Federal do Piauí (IFPI)',
    qualification: 'Técnico em Desenvolvimento de Software',
  },
];
