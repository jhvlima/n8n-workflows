# Inputs — Publisher

Workflow: `Publisher - GitHub n8n-workflows`

O Publisher não possui Edit Fields. Ele é um subworkflow genérico que recebe exatamente um payload por execução e publica todos os arquivos em no máximo um commit.

## Contrato do payload

| Campo | Regra | Como definir |
| --- | --- | --- |
| `owner` | Livre e obrigatório | Usuário ou organização do GitHub, sem URL. |
| `repository` | Livre e obrigatório | Nome do repositório, sem proprietário e sem URL. |
| `branch` | Livre e obrigatório | Branch já existente. |
| `projectSlug` | Livre e obrigatório | Slug do projeto correspondente aos caminhos. |
| `files` | Obrigatório | Objeto `{ "caminho": "conteúdo" }` ou a lista aceita pelo node de expansão. |
| `deletePaths` | Opcional e controlado | Aceita somente `PR_REVIEW.md`, usado para a migração do roteiro para `projects/README.md`. |
| `commitMessage` | Livre | Mensagem do commit; se ausente, o workflow usa um fallback. |

Todo caminho de escrita precisa começar por `projects/`. Nenhum caminho pode conter `..`. Isso permite criar `projects/README.md` sem liberar escrita arbitrária na raiz. A única remoção permitida na raiz é `PR_REVIEW.md`.

O Publisher cria uma tree baseada na tree atual da branch. Se o SHA não mudar, encerra com `commitsCreated=0`. Se houver qualquer alteração, cria uma única tree, um único commit e atualiza a branch com `force=false`, retornando `commitsCreated=1`. A execução falha se receber mais de um payload; Bootstrap e Maintenance já chamam o subworkflow uma vez por projeto.

## Credencial

Use a mesma credencial **GitHub API** em todos os nodes HTTP do Publisher. Um fine-grained token precisa de **Contents: Read and write** no repositório escolhido. Não é necessário conceder `Administration`, `Actions`, `Pull requests` ou `Workflows` para publicar esses arquivos.

## Concorrência e recuperação

O fluxo lê o commit base antes de criar a nova tree. Se outra execução ou uma pessoa avançar a branch antes da última etapa, o GitHub rejeita a atualização por não ser fast-forward. Repita a execução; o Publisher nunca usa force e não sobrescreve o trabalho concorrente. Uma falha antes do update final pode deixar objetos Git sem referência, mas não publica arquivos parciais na branch.

## Exemplo

```json
{
  "owner": "acme",
  "repository": "n8n-workflows",
  "branch": "docs/generated",
  "projectSlug": "carteira-invest",
  "commitMessage": "docs(carteira-invest): bootstrap documentation",
  "files": {
    "projects/carteira-invest/project.json": "{\"projectSlug\":\"carteira-invest\"}",
    "projects/README.md": "# Projetos documentados\n\n<!-- n8n-docs:pr-review:start -->\n..."
  },
  "deletePaths": ["PR_REVIEW.md"]
}
```
