# Pre-Migration Content Inventory

**Captured from**: `git show a3f72b1:index.html` (the last commit before this feature)
**Purpose**: the reference `tests/data/parity.test.js` asserts against, proving SC-002 — zero
content lost in the migration.

The *appearance* is expected to change; this file records only what must still be there.
Comparison is case-insensitive and whitespace-normalised, because the migration legitimately
re-splits the hero sentence across a static role, a derived years figure, and a summary.

---

## Sections

| Pre-migration | Post-migration | Notes |
|---------------|----------------|-------|
| `#home` | `#hero` | renamed to match the constitution's component naming |
| `#skills` | `#skills` | |
| `#projects` | `#projects` | |
| `#certs` | `#certifications` | renamed; the constitution names the section Certifications |
| `#contact` | `#contact` | |
| footer | footer | |

## Section headings

- Habilidades Técnicas
- Projetos Recentes
- Certificações
- Entre em Contato

## Navigation labels

- Home
- Skills
- Projetos
- Certificações
- Contato

## Identity and hero

- Bruno Oliveira
- Desenvolvedor Fullstack
- anos de experiência
- soluções robustas e escaláveis
- Vamos conversar *(hero call to action)*

## Skill groups and tags

| Group | Skills |
|-------|--------|
| Frontend | VueJS, NuxtJS, Tailwind, JavaScript, Vite, Vuetify |
| Backend | PHP, Laravel, Node.js |
| Bancos de Dados | SQL, MySQL, MongoDB, Indexação de Dados, Análise de Dados |
| Ferramentas | Docker, Git, GitHub Actions, Postman, Insomnia |
| Mobile | Flutter, BLOC |

Total: 5 groups, 21 tags.

## Projects

| Title | Description | Technologies |
|-------|-------------|--------------|
| Plataforma E-commerce | Solução completa com carrinho, pagamentos e painel administrativo | VueJS, Laravel, MySQL |

## Certifications

| Title | Detail |
|-------|--------|
| II Maratona de Programação da PUC-GOIÁS | Medalha de Prata - 2017 |
| EF SET English Certificate | Score 49/100 (B1 Intermediate) |

## Contact form fields

- Nome
- Email
- Mensagem
- Enviar Mensagem *(submit)*

## Link destinations

- `https://github.com/BdsOliveira`
- `https://www.linkedin.com/in/bruno-oliveira/`

## Footer

- © 2024 Bruno Oliveira. Todos os direitos reservados.

---

## Deliberately not carried forward

These are removals the feature exists to make, not content loss:

| Dropped | Why |
|---------|-----|
| `https://cdn.tailwindcss.com` script | FR-019/FR-021 — no third-party runtime |
| `https://fonts.googleapis.com` stylesheet | FR-020 — fonts are self-hosted |
| Inline years-of-experience `<script>` | FR-017 — derived by `hero.js`, with a static fallback |
| The 🏆 and 📘 emoji used as certification icons | FR-029 — replaced by sprite symbols with text alternatives |
| The duplicated GitHub glyph on the LinkedIn link | a defect; LinkedIn now has its own symbol |
| `<!-- Adicionar mais 2 projetos similares -->` | an authoring note, not content |
| Tailwind utility classes | FR-012 — presentation moves to the four mandated stylesheets |
