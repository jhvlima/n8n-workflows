# Inputs — Formulário do Bootstrap

Workflow: `Bootstrap - Formulário de Documentação n8n`

## Campos apresentados ao usuário

| Campo | Regra | Como preencher |
| --- | --- | --- |
| `confirmLoad` | Checkbox controlado | Marque para autorizar a descoberta de projetos. |
| `projectSlug` | Lista controlada | Escolha um slug descoberto pelo Core e ainda não publicado no GitHub. Não há texto livre. |

## Edit Fields `Configuração do formulário`

| Campo | Regra | Como definir |
| --- | --- | --- |
| `requiredTag` | Livre | Normalmente `docs-internal`. |
| `projectTagPrefix` | Livre | Normalmente `project:`. |
| `owner` | Livre e obrigatório | Usuário ou organização GitHub. |
| `repository` | Livre e obrigatório | Nome do repositório, sem URL. |
| `branch` | Livre e obrigatório | Branch que contém `projects/`. |
| `projectSlug` | Fixo | Mantenha vazio durante a descoberta. |
| `aiMode` | Fixo | Mantenha `bootstrap`. |
| `documentationMode` | Fixo | Mantenha `form-discovery`. |

## Credenciais e subworkflows

- Form Trigger: mantenha autenticação **n8n User Auth**.
- `Listar projetos já publicados`: credencial **GitHub API** com leitura.
- `Descobrir projetos documentáveis`: selecione o Core importado.
- `Executar Bootstrap selecionado`: selecione o Bootstrap importado.

## Exemplo administrativo

```text
requiredTag = docs-internal
projectTagPrefix = project:
owner = acme
repository = n8n-workflows
branch = docs/generated
projectSlug =
aiMode = bootstrap
documentationMode = form-discovery
```

O usuário final vê apenas confirmação e seleção do projeto; os dados do GitHub não são expostos no formulário.
