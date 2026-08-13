/**
 * Single source of truth for identity content.
 *
 * `name`, `role` and `summary` are also authored statically in index.html so they survive
 * with JavaScript disabled (research R2). tests/data/sync.test.js fails if the two drift.
 */
export default {
  name: 'Bruno Oliveira',
  role: 'Desenvolvedor Fullstack',
  summary: 'Criando soluções robustas e escaláveis.',

  // Years of experience is derived at render time, never stored (FR-017).
  experienceStartYear: 2022,

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
