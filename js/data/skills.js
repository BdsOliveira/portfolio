/**
 * Technical skill groups. Add a skill by adding a string; add a group by adding an entry.
 *
 * Grouping is editorial — the CV states one flat list of competências, and these six groups
 * are how it is made scannable. Group sizes stay between 2 and 5 so the card grid does not go
 * ragged.
 *
 * `id` is ASCII-folded (`arquitetura-e-integracao`, not `arquitetura-e-integração`): the id
 * validator is kebab-case only. The displayed `name` keeps its accents.
 */
export default [
  {
    id: 'backend',
    name: 'Backend',
    skills: ['PHP', 'Laravel', 'NestJS'],
  },
  {
    id: 'frontend',
    name: 'Frontend',
    skills: ['Next.js', 'Vue.js', 'React'],
  },
  {
    id: 'bancos-de-dados',
    name: 'Bancos de Dados',
    skills: ['Oracle Database', 'MySQL', 'Redis'],
  },
  {
    id: 'infraestrutura-e-devops',
    name: 'Infraestrutura e DevOps',
    skills: ['Docker', 'RabbitMQ', 'GitLab CI/CD'],
  },
  {
    id: 'arquitetura-e-integracao',
    name: 'Arquitetura e Integração',
    skills: [
      'Arquitetura de Software',
      'Microsserviços',
      'APIs REST',
      'Mensageria',
      'Integração entre Sistemas',
    ],
  },
  {
    id: 'praticas',
    name: 'Práticas',
    skills: ['Desenvolvimento Full Stack', 'Engenharia de Software Assistida por IA'],
  },
];
