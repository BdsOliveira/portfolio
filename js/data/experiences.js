/**
 * Professional experience.
 *
 * Array order IS display order — newest first. No sort runs at render time, so reordering a
 * role is a data edit and nothing else.
 *
 * `endDate: null` means the role is ongoing and renders as "Atual". A `startDate` slightly in
 * the future is legitimate and deliberate: a confirmed role can begin next month.
 */
export default [
  {
    id: 'cwi-software',
    company: 'CWI Software',
    title: 'Software Engineer',
    location: 'São Leopoldo, RS – Brasil · Remoto',
    startDate: '2026-09',
    endDate: null,
    achievements: [
      "Atuação na evolução de uma plataforma de oncologia utilizada pela Rede D'Or, uma das maiores redes hospitalares da América Latina.",
      'Participação na modernização de um sistema legado, migrando a arquitetura de Symfony (PHP) e Angular para NestJS e Next.js com estratégia incremental baseada em Micro Frontends.',
      'Desenvolvimento de novas funcionalidades, correção de bugs, refatoração de código e Code Review, contribuindo para a evolução contínua da plataforma e redução de defeitos.',
      'Implementação de integrações entre serviços utilizando RabbitMQ e desenvolvimento de funcionalidades em tempo real com WebSockets.',
      'Desenvolvimento utilizando Docker, Redis e Oracle Database, colaborando em equipes ágeis com foco em qualidade, escalabilidade e boas práticas de engenharia de software.',
    ],
  },
  {
    id: 'devsquad',
    company: 'DevSquad',
    title: 'Software Engineer',
    location: 'Utah, EUA · Remoto',
    startDate: '2025-11',
    endDate: '2026-07',
    achievements: [
      'Desenvolvimento e evolução de produtos internos e soluções para clientes internacionais, entregando novas funcionalidades, integrações entre sistemas e melhorias de performance em aplicações de produção.',
      'Desenvolvimento de APIs REST, arquiteturas orientadas a serviços e integrações com plataformas de terceiros para aplicações SaaS e sistemas corporativos.',
      'Participação na evolução de uma plataforma de gerenciamento de infraestrutura para aluguel de GPUs, responsável pelo provisionamento e monitoramento de clusters para workloads de IA e computação de alta performance.',
      'Atuação em decisões de arquitetura, modelagem de sistemas e evolução técnica dos produtos utilizando Docker e bancos de dados relacionais.',
      'Aplicação de fluxos de desenvolvimento assistido por IA com Claude Code, OpenCode e Specification-Driven Development (SDD), aumentando a produtividade e a qualidade das entregas.',
    ],
  },
  {
    id: 'cajutec',
    company: 'CajuTec',
    title: 'Software Engineer / Tech Lead',
    location: 'Parnaíba, PI – Brasil · Presencial',
    startDate: '2022-10',
    endDate: '2025-09',
    achievements: [
      'Evolução de uma plataforma de gestão acadêmica utilizada por diversas instituições de ensino.',
      'Implementação do Sentry para monitoramento de erros e melhoria da observabilidade da aplicação.',
      'Evolução dos processos de deploy, infraestrutura e configuração de servidores.',
      'Liderança técnica, condução de sessões internas sobre performance e boas práticas, além da mentoria de desenvolvedores Laravel.',
    ],
  },
];
