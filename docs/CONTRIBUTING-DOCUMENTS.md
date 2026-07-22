# Documentos contribuídos

Depois do Bootstrap, `README.md` e `docs/` pertencem ao time. Pessoas, Codex, Claude e outras ferramentas podem editar esses caminhos sem que a Maintenance os sobrescreva.

## Estrutura recomendada

```text
projects/<projeto>/
├── README.md
└── docs/
    ├── TECHNICAL.md
    ├── INTERNAL.md
    ├── DECISIONS_AND_LEARNINGS.md
    ├── workflows/
    │   └── <workflow-slug>.md
    └── <outros-documentos-do-time>.md
```

O Bootstrap cria um README operacional com visão geral, componentes, fluxo, entradas e saídas, integrações, operação e Mermaid. O conteúdo técnico completo e o contexto interno permanecem separados, e cada workflow recebe um arquivo em `docs/workflows/`. `DECISIONS_AND_LEARNINGS.md` unifica ADRs e aprendizados em um registro preenchível pelos consultores. A arquitetura Mermaid fica tanto no README quanto em `docs/TECHNICAL.md`; não há `architecture.mmd` separado. O roteiro compartilhado de revisão fica na seção [`#pr-review`](../projects/README.md#pr-review) de `projects/README.md`.

O primeiro Bootstrap cria o esqueleto do registro. Se o arquivo já existir e tiver conteúdo, um rebootstrap o republica sem enviá-lo à IA e sem alterar as entradas humanas.

Use `sources/conversation-exports/` somente quando precisar guardar originais revisados. Não publique exportações completas sem analisar anexos, dados pessoais e segredos.

## Caminhos reservados para automação

Não edite manualmente:

- `workflows/**`;
- `project.json`.

Esses caminhos representam o estado técnico atual e são atualizados pela Maintenance.

## Proveniência

```yaml
---
origin: codex
author: nome-ou-equipe
created_at: 2026-07-11
review_status: pending
source_file: conversa-original.html
---
```

## Limites atuais

- Documentos contribuídos não são enviados automaticamente à IA.
- A Maintenance não altera arquivos humanos.
- O Publisher não remove arquivos extras; a única exceção controlada é o `PR_REVIEW.md` legado durante a migração para `projects/README.md`.
- Alterações concorrentes no mesmo arquivo ainda podem causar conflito.

Antes de ingerir documentos automaticamente, valide caminho, tamanho, extensão, segredos, HTML, dados pessoais e prompt injection.
