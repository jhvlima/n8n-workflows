# Inputs — Publisher

Workflow: `Publisher - GitHub n8n-workflows`

O Publisher não possui Edit Fields. Ele é um subworkflow genérico e publica exatamente os arquivos recebidos.

## Contrato do payload

| Campo | Regra | Como definir |
| --- | --- | --- |
| `owner` | Livre e obrigatório | Usuário ou organização do GitHub, sem URL. |
| `repository` | Livre e obrigatório | Nome do repositório, sem proprietário e sem URL. |
| `branch` | Livre e obrigatório | Branch já existente. |
| `projectSlug` | Livre e obrigatório | Slug do projeto correspondente aos caminhos. |
| `files` | Obrigatório | Objeto `{ "caminho": "conteúdo" }` ou a lista aceita pelo node de expansão. |
| `commitMessage` | Livre | Mensagem do commit; se ausente, o workflow usa um fallback. |

Todo caminho precisa começar por `projects/` e não pode conter `..`. Conteúdos idênticos são ignorados.

## Credencial

Use a mesma credencial **GitHub API** nos nodes `Consultar arquivo existente` e `Criar ou atualizar no GitHub`. Ela precisa ler conteúdo e criar/atualizar arquivos na branch escolhida.

## Exemplo

```json
{
  "owner": "acme",
  "repository": "n8n-workflows",
  "branch": "docs/generated",
  "projectSlug": "carteira-invest",
  "commitMessage": "docs(carteira-invest): bootstrap documentation",
  "files": {
    "projects/carteira-invest/project.json": "{\"projectSlug\":\"carteira-invest\"}"
  }
}
```
