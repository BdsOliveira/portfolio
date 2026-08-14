/**
 * Engineering Philosophy — "Como Trabalho".
 *
 * Array order IS display order. Adding, removing or reordering a principle is a data edit and
 * nothing else (FR-032).
 *
 * ⚠ EVERY PRINCIPLE MUST TRACE TO EVIDENCE. This is the only section of the site that states a
 * claim not already on the CV, which makes it the one place the portfolio could invent
 * something. Each entry below names the experience it comes from. A principle that traces to
 * nothing in js/data/experiences.js does not belong here, however well it reads (FR-031,
 * SC-007, research R14).
 *
 * They must also be falsifiable: a reader has to be able to disagree with one (FR-030). "Eu me
 * importo com qualidade" is not a position — nobody claims the opposite. "Vale a pena entregar
 * mais devagar para não parar a operação" is, because plenty of engineers would argue the other
 * side.
 *
 * REQUIRED: id (kebab-case, unique), title.
 * OPTIONAL: detail — omit it and the principle renders as a title alone, with no empty body.
 */
export default [
  {
    // Evidence: CWI Software — migração incremental de Symfony/Angular para NestJS/Next.js com
    // Micro Frontends, numa plataforma de oncologia em uso hospitalar.
    id: 'modernizacao-incremental',
    title: 'Sistema legado se moderniza em produção, não em um reescrever do zero',
    detail:
      'Já migrei arquitetura de uma plataforma hospitalar em uso real, de forma incremental, com Micro Frontends permitindo que o sistema antigo e o novo coexistissem. É mais lento que reescrever, e é a razão de a operação nunca ter parado. Reescrita completa é uma aposta que quase sempre subestima o que o código antigo já sabia.',
  },
  {
    // Evidência: CajuTec — implementação do Sentry e melhoria da observabilidade da aplicação.
    id: 'observabilidade-antes-do-incidente',
    title: 'Observabilidade se instala antes do incidente, não durante',
    detail:
      'Implementei monitoramento de erros numa plataforma acadêmica já em produção, e a diferença não foi resolver mais rápido: foi descobrir falhas que ninguém tinha reportado. Sistema sem instrumentação não é um sistema estável — é um sistema cujos problemas ainda não chegaram até você.',
  },
  {
    // Evidência: CWI Software — Code Review, refatoração e redução de defeitos como prática
    // contínua; CajuTec — mentoria de desenvolvedores Laravel e sessões internas.
    id: 'code-review-e-mentoria',
    title: 'Code review é transferência de contexto, não controle de qualidade',
    detail:
      'O bug que o review pega é o menor dos ganhos. O maior é que mais de uma pessoa passa a entender aquela parte do sistema. Pelo mesmo motivo conduzo mentoria e sessões internas sobre performance e boas práticas: conhecimento concentrado em uma cabeça é um risco de arquitetura, não uma vantagem.',
  },
  {
    // Evidência: DevSquad — decisões de arquitetura e modelagem de sistemas; CWI — integrações
    // via RabbitMQ e tempo real com WebSockets.
    id: 'arquitetura-defensavel',
    title: 'Toda decisão de arquitetura precisa ter uma alternativa que foi rejeitada',
    detail:
      'Mensageria, microsserviços e tempo real resolvem problemas específicos e cobram um preço específico em complexidade operacional. Quando escolho um deles, sei dizer o que descartei e por quê. Decisão sem alternativa considerada não é decisão — é hábito.',
  },
  {
    // Evidência: DevSquad — fluxos de desenvolvimento assistido por IA com Claude Code, OpenCode
    // e Specification-Driven Development (SDD).
    id: 'especificacao-antes-do-codigo',
    title: 'Com IA no fluxo, a especificação passou a valer mais que o código',
    detail:
      'Trabalho com desenvolvimento assistido por IA usando Specification-Driven Development. Gerar código ficou barato; decidir com precisão o que deve ser construído, e sob quais restrições, ficou o trabalho caro. Quem trata a especificação como burocracia acaba revisando muito código que nunca deveria ter existido.',
  },
];
