# Inputs — Maintenance

Workflow: `Maintenance - Fechamento Diário n8n`

## Edit Fields `Configuração Maintenance`

| Campo | Regra | Como definir |
| --- | --- | --- |
| `requiredTag` | Livre | Normalmente `docs-internal`. |
| `projectTagPrefix` | Livre | Normalmente `project:`. |
| `projectSlug` | Livre | Vazio fecha todos os projetos; use um slug apenas em teste direcionado. |
| `owner` | Livre e obrigatório | Usuário ou organização GitHub. |
| `repository` | Livre e obrigatório | Nome do repositório, sem URL. |
| `branch` | Livre e obrigatório | Branch que contém `projects/<slug>/project.json`. |
| `aiMode` | Fixo | Mantenha `bootstrap` como metadado. A Maintenance nunca chama IA. |
| `documentationMode` | Fixo | Mantenha `maintenance`. |

## Credenciais e subworkflows

- `Consultar project.json remoto`: credencial **GitHub API** com leitura.
- `Executar Core diário`: selecione o Core importado.
- `Publicar Maintenance`: selecione o Publisher importado; a credencial GitHub de escrita fica nele.

O Schedule padrão é `50 23 * * *`, no fuso `America/Sao_Paulo`.

## Exemplo — todos os projetos

```text
requiredTag = docs-internal
projectTagPrefix = project:
projectSlug =
owner = acme
repository = n8n-workflows
branch = docs/generated
aiMode = bootstrap
documentationMode = maintenance
```

Quando o hash muda, somente `workflows/**` e `project.json` são publicados. `README.md` e `docs/**` permanecem intocados.
