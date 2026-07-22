# Inputs — Core

Workflow: `Core - Documentação n8n (Dry Run)`

## Edit Fields `Configuração`

| Campo | Regra | Como definir |
| --- | --- | --- |
| `requiredTag` | Livre | Tag que autoriza a documentação. Padrão: `docs-internal`. |
| `projectTagPrefix` | Livre | Prefixo da tag de agrupamento. Padrão: `project:`. Inclua os dois-pontos. |
| `projectSlug` | Livre | Vazio processa todos os projetos; um slug processa somente aquele projeto. Use minúsculas, números e hífens. |
| `aiMode` | Fixo | Mantenha `bootstrap`. É metadado; o Core não chama IA. |
| `documentationMode` | Controlado | `core`, `bootstrap`, `maintenance` ou `form-discovery`. Em execução direta, use `core`. |

Se chamado por outro workflow, as expressões do Edit Fields preservam os valores recebidos e usam os padrões apenas quando eles estão ausentes.

O Core ignora workflows que possuem `requiredTag`, mas não possuem nenhuma tag iniciada por `projectTagPrefix`. Eles aparecem em `ignoredWorkflows` e `ignoredWorkflowNames` no resumo. Um workflow com duas ou mais tags de projeto continua bloqueando a execução, pois não existe uma associação inequívoca com um projeto.

## Credencial

No node `Listar workflows`, configure uma credencial **n8n API** com acesso de leitura aos workflows e tags da própria instância. Em Docker, a URL da credencial precisa ser alcançável a partir do container.

## Exemplo

```text
requiredTag = docs-internal
projectTagPrefix = project:
projectSlug = carteira-invest
aiMode = bootstrap
documentationMode = core
```

O Core retorna `workflows/*.sanitized.json` e `project.json`; ele não publica e não gera documentos humanos. O resumo também informa quantos workflows foram ignorados por não possuírem uma tag de projeto.
