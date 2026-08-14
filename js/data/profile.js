/**
 * Single source of truth for identity content.
 *
 * `name`, `role` and `summary` are also authored statically in index.html so they survive
 * with JavaScript disabled (research R2). tests/data/sync.test.js fails if the two drift.
 */
export default {
  name: 'Bruno Oliveira',
  role: 'Software Engineer',

  // Positioning statement, not a job title (FR-011, FR-012). It has to say what this engineer is
  // for. A generic self-description — "desenvolvedor apaixonado por tecnologia" — is a defect
  // here, not a stylistic preference: it is the one line most visitors will read, and it must
  // survive being compared against every other portfolio the recruiter opened today.
  headline:
    'Construo e modernizo sistemas em produção que precisam continuar funcionando enquanto mudam.',

  summary:
    'Especializado em PHP/Laravel, APIs REST e sistemas distribuídos, com foco em arquitetura de software e IA aplicada.',

  // No `availability` by the owner's decision. The field stays optional by contract (FR-013,
  // FR-039): adding it back here is all it takes, plus re-authoring the two static mirrors in
  // index.html that the Hero and the closing call to action used to carry.

  /**
   * About, one entry per paragraph (FR-015 – FR-017). Read time under thirty seconds; this is
   * positioning, not a biography.
   *
   * Every claim traces to js/data/experiences.js and js/data/skills.js — the oncology platform,
   * the academic-management platform, the GPU infrastructure product, the Symfony/Angular →
   * NestJS/Next.js migration, the observability and mentoring work. Nothing here is a new fact.
   */
  about: [
    'Sou engenheiro de software com mais de quatro anos construindo sistemas de backend que rodam em produção — plataformas de saúde, gestão acadêmica e infraestrutura para cargas de trabalho de IA. Trabalho principalmente com PHP/Laravel, NestJS e Next.js, projetando APIs REST e integrações entre serviços com RabbitMQ, WebSockets, Docker e bancos relacionais.',
    'O que mais me interessa é o problema difícil por trás do código: modernizar sistemas legados sem parar a operação, tornar o comportamento de produção observável antes que ele vire incidente, e deixar a base de código melhor do que encontrei — via code review, mentoria e decisões de arquitetura defensáveis. Busco times que tratem qualidade de engenharia como requisito, não como fase final.',
  ],

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

  // `cvUrl` is deliberately ABSENT — the owner has not supplied one. Every affordance that would
  // point at it is removed rather than rendered inert (FR-041, contract I3-2). Adding the key
  // here is the only edit needed to make the CV route and a CV-based secondary call to action
  // appear; nothing else has to change (SC-006).

  /**
   * Calls to action (FR-014). The primary always routes to contact. The secondary defaults to
   * the CV when one exists and to the GitHub profile otherwise — today, the latter.
   *
   * `href` is a plain string on purpose: `#contact` is a legitimate destination and is not a URL.
   */
  primaryCta: { label: 'Vamos conversar', href: '#contact' },
  secondaryCta: { label: 'Ver projetos no GitHub', href: 'https://github.com/BdsOliveira' },

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
      label: 'Ver no LinkedIn',
    },
  ],
};
