/**
 * Single source of truth for identity content.
 *
 * `name`, `role` and `summary` are also authored statically in index.html so they survive
 * with JavaScript disabled (research R2). tests/data/sync.test.js fails if the two drift.
 */
export default {
  name: 'Bruno Oliveira',
  role: 'Software Engineer',
  summary:
    'Especializado em PHP/Laravel, APIs REST e sistemas distribuídos, com foco em arquitetura de software e IA aplicada.',

  // Years of experience is derived at render time, never stored (FR-017).
  experienceStartYear: 2022,

  // Mirrored statically in index.html, like `name`/`role`/`summary` and the social links:
  // primary contact must survive a script failure, so it is authored in the document rather
  // than rendered. tests/data/sync.test.js fails if the two drift.
  //
  // The owner's phone number is deliberately NOT here and must never be added: a static page
  // is scraped continuously, and a number published once cannot be recalled.
  location: 'Parnaíba, PI – Brasil',
  email: 'bds.commus@gmail.com',

  socialLinks: [
    {
      platform: 'GitHub',
      url: 'https://github.com/BdsOliveira',
      icon: 'icon-github',
      label: 'Bruno Oliveira no GitHub',
    },
    {
      platform: 'LinkedIn',
      url: 'https://www.linkedin.com/in/bruno-oliveira/',
      icon: 'icon-linkedin',
      label: 'Bruno Oliveira no LinkedIn',
    },
  ],
};
