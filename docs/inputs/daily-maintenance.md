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
| `baseBranch` | Livre e obrigatório | Branch aprovada usada como fonte de verdade; normalmente `main`. |
| `publicationBranch` | Livre e obrigatório | Branch auxiliar que receberá a atualização e originará o PR; normalmente `docs/generated`. |
| `aiMode` | Fixo | Mantenha `bootstrap` como metadado. A Maintenance nunca chama IA. |
| `documentationMode` | Fixo | Mantenha `maintenance`. |

## Credenciais e subworkflows

- `Consultar project.json aprovado` e `Consultar project.json em revisão`: credencial **GitHub API** com leitura.
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
baseBranch = main
publicationBranch = docs/generated
aiMode = bootstrap
documentationMode = maintenance
```

O estado atual do n8n é comparado primeiro com a `baseBranch`. A `publicationBranch` também é consultada para impedir commits duplicados ou a sobrescrita de uma revisão pendente.

- Hash igual ao aprovado: `skipped`.
- Hash já presente na branch auxiliar: `awaiting-review`.
- Branch auxiliar com outra versão ainda não aprovada: `review-conflict`.
- Mudança nova: publica somente `workflows/**` e `project.json` na branch auxiliar.

Se a branch auxiliar tiver sido apagada, o Publisher a recria automaticamente a partir da `baseBranch` quando surgir uma mudança publicável. `README.md` e `docs/**` permanecem intocados.
