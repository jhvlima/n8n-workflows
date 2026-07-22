# Inputs — Formulário do Bootstrap

Workflow: `Bootstrap - Formulário de Documentação n8n`

## Campos apresentados ao usuário

| Campo | Regra | Como preencher |
| --- | --- | --- |
| `projectSlug` | Lista controlada | Escolha qualquer slug descoberto pelo Core. Um projeto já publicado será rebootstrapado. |

O Form Trigger padrão mostra uma primeira página apenas com o botão `Carregar projetos`, sem checkbox de confirmação. Depois do clique, o Core consulta as tags e o próximo Form mostra o dropdown de projeto. O campo `loadProjects=true` é interno e oculto.

Na variante n8n 1.121.2, a definição JSON usa somente o rótulo `Projeto`, pois essa versão rejeita `fieldName` nesse campo dinâmico. O node `Validar seleção` aceita tanto `Projeto` quanto `projectSlug`.

Não existe escolha de estilo. O payload sempre usa `documentationLayout=separated`, gerando README, documento técnico e documento interno. O roteiro compartilhado fica em `projects/README.md#pr-review`.

Ao escolher um projeto já presente em `projects/`, o formulário define `forceBootstrap=true` somente no payload dessa execução. O campo técnico não aparece na interface.

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

- Form Trigger: use **n8n User Auth** na variante 2.28.6 ou uma credencial **HTTP Basic Auth** na variante 1.121.2.
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

O usuário final vê somente o botão de carregamento e a seleção do projeto; os dados do GitHub e os campos técnicos não são expostos.
