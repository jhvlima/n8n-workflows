# Documentos contribuídos

Arquivos escritos por pessoas, agentes CLI ou ferramentas de navegador podem complementar a documentação automática sem quebrar o pipeline.

## Estrutura recomendada

```text
projects/<projeto>/
├── docs/
│   ├── contributed/
│   │   ├── human/
│   │   ├── agents/
│   │   └── conversations/
│   ├── runbook.md
│   ├── troubleshooting.md
│   └── ai-enrichment.md
└── sources/
    └── conversation-exports/
```

Use `sources/` para arquivos originais que não devem ser publicados diretamente. Converta o material revisado para Markdown em `docs/contributed/`.

## Arquivos reservados

Não edite manualmente estes caminhos, pois o Publisher poderá sobrescrevê-los:

- `README.md`
- `workflow.sanitized.json`
- `architecture.mmd`
- `metadata.json`
- `AI_PROMPT.md`
- `docs/runbook.md`
- `docs/troubleshooting.md`
- `docs/ai-enrichment.md`

## Metadados de proveniência

Adicione front matter aos documentos contribuídos:

```yaml
---
origin: codex
author: nome-ou-equipe
created_at: 2026-07-10
review_status: pending
source_file: conversa-original.html
---
```

Valores possíveis para `origin` incluem `human`, `codex`, `claude`, `chatgpt` e `other`.

## Comportamento atual

- O Publisher não remove arquivos extras existentes no repositório.
- Documentos em `docs/contributed/` permanecem preservados.
- O Core e a IA ainda não leem automaticamente esses documentos.
- Alterações no mesmo arquivo e na mesma branch durante uma execução podem causar conflito.

## Requisitos para ingestão automática futura

Antes de enviar documentos externos para a IA ou o Publisher, a etapa de ingestão deve:

1. Aceitar inicialmente apenas Markdown ou texto simples.
2. Rejeitar caminhos absolutos e segmentos `..`.
3. Aplicar limite de tamanho.
4. Procurar tokens, credenciais, dados pessoais e URLs privadas.
5. Remover HTML e scripts perigosos.
6. Tratar o texto como conteúdo não confiável contra prompt injection.
7. Registrar origem e estado de revisão.
8. Exigir aprovação humana antes do merge.

Não publique exportações completas de conversas sem revisar anexos, instruções ocultas, informações pessoais e segredos presentes no histórico.
