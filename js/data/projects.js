/**
 * Projects. Array order is display order — reordering is a data edit, nothing more.
 *
 * PLACEHOLDER: this is the single entry migrated from the pre-migration page. It stands in
 * until the real project list (title, description, technologies, repository URL, live URL,
 * preview image) is supplied — see the spec's Dependencies section.
 *
 * To add a project, copy an entry and change the values. `technologies` takes any number of
 * strings. `repositoryUrl`, `liveUrl`, `image` and `imageAlt` are optional and are simply
 * omitted from the card when absent. `isVisible: false` hides an entry without deleting it.
 */
export default [
  {
    id: 'plataforma-e-commerce',
    title: 'Plataforma E-commerce',
    description: 'Solução completa com carrinho, pagamentos e painel administrativo',
    technologies: ['VueJS', 'Laravel', 'MySQL'],
    isVisible: true,
  },
];
