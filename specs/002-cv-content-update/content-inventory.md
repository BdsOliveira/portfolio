# Content Inventory: the CV as authored data

**Date**: 2026-08-13 | **Feature**: `002-cv-content-update`

**Two jobs.** This is (a) the authoring source for `js/data/*.js` and `index.html`, and (b) the
reference document that the rewritten `tests/data/parity.test.js` asserts against — the same role
`specs/001-data-driven-migration/content-inventory.md` played for the migration.

That second job is what makes FR-026 ("every statement traceable to the CV") a mechanical check
rather than an opinion. If a string is on the page and not in this file, parity fails; if it is
in this file and not on the page, parity fails.

**Source**: the CV supplied by the owner on 2026-08-13, with two owner-confirmed corrections
recorded in the spec's Accepted exceptions table:

- CWI Software starts **September 2026**; the CV's "Set 2025" is a typo (E-2).
- The phone number is **excluded** from every published surface (FR-023).

---

## 1. Identity

| Target | Value |
|--------|-------|
| `profile.name` | `Bruno Oliveira` |
| `profile.role` | `Software Engineer` |
| `profile.summary` | `Especializado em PHP/Laravel, APIs REST e sistemas distribuídos, com foco em arquitetura de software e IA aplicada.` |
| `profile.location` | `Parnaíba, PI – Brasil` |
| `profile.email` | `bds.commus@gmail.com` |
| `profile.experienceStartYear` | `2022` (unchanged) |

The full CV name is "Bruno Dos Santos Oliveira"; the site keeps the short form already in use
across the page, the nav brand, the footer, and both social profile labels. Not a content change.

### Mirrored into `index.html`

| Location | Value |
|----------|-------|
| `<h1 data-profile="name">` | Bruno Oliveira |
| `<span data-profile="role">` | Software Engineer |
| `<p data-profile="summary">` | Especializado em PHP/Laravel, APIs REST e sistemas distribuídos, com foco em arquitetura de software e IA aplicada. |
| `[data-profile="location"]` *(new)* | Parnaíba, PI – Brasil |
| `[data-profile="email"]` *(new)* | bds.commus@gmail.com |

### Page metadata

| Tag | Value |
|-----|-------|
| `<title>` | `Bruno Oliveira — Software Engineer` |
| `meta[name=description]` | `Portfólio de Bruno Oliveira, Software Engineer com mais de 4 anos de experiência em PHP/Laravel, NestJS, Next.js, APIs REST e sistemas distribuídos.` |
| `og:title`, `twitter:title` | `Bruno Oliveira — Software Engineer` |
| `og:description`, `twitter:description` | `Portfólio de Bruno Oliveira, Software Engineer: experiência profissional, habilidades técnicas, formação e certificações.` |
| `og:image:alt` | `Bruno Oliveira, Software Engineer` |
| `og:site_name`, `og:url`, `og:type`, `og:locale`, image dimensions | unchanged |

The meta description is **148** characters — inside the 50–200 window `metadata.spec.js` enforces.
The OG description is 121 and the hero summary 115, both comfortably clear of the same bound.

### Open Graph card (`assets/images/og-card.svg` → `.png`)

| Line | New text |
|------|----------|
| 1 (86px) | `Bruno Oliveira` — unchanged |
| 2 (42px) | `Software Engineer` |
| 3 (30px) | `Especializado em PHP/Laravel, APIs REST e sistemas distribuídos.` |

Line 3 is a shortened form of `profile.summary`; the full sentence overflows at 30px in a 1200px
frame. Both remain traceable to the same CV clause.

---

## 2. Experience — `js/data/experiences.js`

Authored newest-first. Bullets are the CV's own, lightly normalised for sentence punctuation.

### 2.1 `cwi-software`

| Field | Value |
|-------|-------|
| `company` | CWI Software |
| `title` | Software Engineer |
| `location` | São Leopoldo, RS – Brasil · Remoto |
| `startDate` | `2026-09` |
| `endDate` | `null` → renders `Atual` |

`achievements`:

1. Atuação na evolução de uma plataforma de oncologia utilizada pela Rede D'Or, uma das maiores
   redes hospitalares da América Latina.
2. Participação na modernização de um sistema legado, migrando a arquitetura de Symfony (PHP) e
   Angular para NestJS e Next.js com estratégia incremental baseada em Micro Frontends.
3. Desenvolvimento de novas funcionalidades, correção de bugs, refatoração de código e Code
   Review, contribuindo para a evolução contínua da plataforma e redução de defeitos.
4. Implementação de integrações entre serviços utilizando RabbitMQ e desenvolvimento de
   funcionalidades em tempo real com WebSockets.
5. Desenvolvimento utilizando Docker, Redis e Oracle Database, colaborando em equipes ágeis com
   foco em qualidade, escalabilidade e boas práticas de engenharia de software.

> **Authoring note**: bullet 1 contains an apostrophe (`Rede D'Or`). The data files use
> single-quoted strings throughout, so this one must be double-quoted or escaped. It is the only
> such string in the inventory, and it is exactly the kind of thing that produces a syntax error
> at page load rather than a test failure.

### 2.2 `devsquad`

| Field | Value |
|-------|-------|
| `company` | DevSquad |
| `title` | Software Engineer |
| `location` | Utah, EUA · Remoto |
| `startDate` | `2025-11` |
| `endDate` | `2026-07` |

`achievements`:

1. Desenvolvimento e evolução de produtos internos e soluções para clientes internacionais,
   entregando novas funcionalidades, integrações entre sistemas e melhorias de performance em
   aplicações de produção.
2. Desenvolvimento de APIs REST, arquiteturas orientadas a serviços e integrações com plataformas
   de terceiros para aplicações SaaS e sistemas corporativos.
3. Participação na evolução de uma plataforma de gerenciamento de infraestrutura para aluguel de
   GPUs, responsável pelo provisionamento e monitoramento de clusters para workloads de IA e
   computação de alta performance.
4. Atuação em decisões de arquitetura, modelagem de sistemas e evolução técnica dos produtos
   utilizando Docker e bancos de dados relacionais.
5. Aplicação de fluxos de desenvolvimento assistido por IA com Claude Code, OpenCode e
   Specification-Driven Development (SDD), aumentando a produtividade e a qualidade das entregas.

### 2.3 `cajutec`

| Field | Value |
|-------|-------|
| `company` | CajuTec |
| `title` | Software Engineer / Tech Lead |
| `location` | Parnaíba, PI – Brasil · Presencial |
| `startDate` | `2022-10` |
| `endDate` | `2025-09` |

`achievements`:

1. Evolução de uma plataforma de gestão acadêmica utilizada por diversas instituições de ensino.
2. Implementação do Sentry para monitoramento de erros e melhoria da observabilidade da
   aplicação.
3. Evolução dos processos de deploy, infraestrutura e configuração de servidores.
4. Liderança técnica, condução de sessões internas sobre performance e boas práticas, além da
   mentoria de desenvolvedores Laravel.

---

## 3. Education — `js/data/education.js`

### 3.1 `mba-engenharia-software-ia`

| Field | Value |
|-------|-------|
| `institution` | Faculdade Full Cycle |
| `qualification` | MBA em Engenharia de Software com Inteligência Artificial |
| `startYear` | absent — not stated in the CV |
| `endYear` | `null` → renders `Em andamento` |

### 3.2 `tecnico-desenvolvimento-software`

| Field | Value |
|-------|-------|
| `institution` | Instituto Federal do Piauí (IFPI) |
| `qualification` | Técnico em Desenvolvimento de Software |
| `startYear` | absent |
| `endYear` | absent — completed, year not stated |

Entry 3.2 renders **no date line at all**. That is the correct outcome: the CV states no year, so
the page states no year.

---

## 4. Skills — `js/data/skills.js`

All 19 CV competências, each appearing exactly once.

| `id` | `name` | `skills` |
|------|--------|----------|
| `backend` | Backend | PHP · Laravel · NestJS |
| `frontend` | Frontend | Next.js · Vue.js · React |
| `bancos-de-dados` | Bancos de Dados | Oracle Database · MySQL · Redis |
| `infraestrutura-e-devops` | Infraestrutura e DevOps | Docker · RabbitMQ · GitLab CI/CD |
| `arquitetura-e-integracao` | Arquitetura e Integração | Arquitetura de Software · Microsserviços · APIs REST · Mensageria · Integração entre Sistemas |
| `praticas` | Práticas | Desenvolvimento Full Stack · Engenharia de Software Assistida por IA |

**Count check**: 3 + 3 + 3 + 3 + 5 + 2 = **19**, matching the CV's COMPETÊNCIAS line exactly.

### Removed — present today, absent from the CV (FR-015)

VueJS *(superseded by `Vue.js`)*, NuxtJS, Tailwind, JavaScript, Vite, Vuetify, Node.js, SQL,
MongoDB, Indexação de Dados, Análise de Dados, Git, GitHub Actions, Postman, Insomnia, Flutter,
BLOC. The **Mobile** group disappears with its only two members.

### Named in the CV but deliberately *not* skills

Symfony, Angular, WebSockets, Micro Frontends, Sentry, Claude Code, OpenCode, SDD. These appear
only in experience bullets, not in COMPETÊNCIAS. They stay in the achievements text and are not
promoted to chips — the CV's own distinction between "what I have worked with" and "what I claim
as a competence" is preserved.

---

## 5. Unchanged content

Retained verbatim; listed so parity can assert it survived this change too.

**Certifications** (FR-024): `II Maratona de Programação da PUC-GOIÁS` / `Medalha de Prata -
2017`; `EF SET English Certificate` / `Score 49/100 (B1 Intermediate)`.

**Projects** (FR-025, exception E-1): `Plataforma E-commerce` / `Solução completa com carrinho,
pagamentos e painel administrativo` / VueJS, Laravel, MySQL. **Knowingly not CV-traceable** — the
only content on the page exempt from FR-026, by owner decision. Parity must assert it is
*present*, and must carry a comment saying why an untraceable string is whitelisted, so nobody
later "fixes" it.

**Social links**: `https://github.com/BdsOliveira`, `https://www.linkedin.com/in/bruno-oliveira/`
— both already match the CV.

**Section headings, nav labels, contact form fields, footer copyright**: unchanged. Note the nav
still omits Experiência and Formação (research R10) and the footer still reads `© 2024`; both are
recorded follow-ups, out of scope here.

---

## 6. Excluded — must not appear anywhere

| Item | Rule |
|------|------|
| `+55 86 99806-3078` and every formatting of it | FR-023. Enforced by validation rule 11: the digit run `99806` must not occur in `index.html` or under `js/`, `css/`, `assets/`. |
