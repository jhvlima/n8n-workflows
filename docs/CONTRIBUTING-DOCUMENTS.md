# Documentos contribuídos

Depois do Bootstrap, `README.md` e `docs/` pertencem ao time. Pessoas, Codex, Claude e outras ferramentas podem editar esses caminhos sem que a Maintenance os sobrescreva.

## Estrutura recomendada

```text
projects/<projeto>/
├── README.md
└── docs/
    ├── architecture.mmd
    └── <outros-documentos-do-time>.md
```

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
- O Publisher não remove arquivos extras.
- Alterações concorrentes no mesmo arquivo ainda podem causar conflito.

Antes de ingerir documentos automaticamente, valide caminho, tamanho, extensão, segredos, HTML, dados pessoais e prompt injection.
