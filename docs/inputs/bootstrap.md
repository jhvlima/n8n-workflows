# Inputs — Bootstrap

Workflow: `Bootstrap - Documentação n8n`

O Bootstrap não é uma entrada humana direta. Ele recebe os dados do Formulário ou de outro subworkflow autorizado.

## Edit Fields `Configuração Bootstrap`

| Campo | Regra | Como definir |
| --- | --- | --- |
| `projectSlug` | Livre e obrigatório | Slug escolhido no formulário e já validado pelo Core. |
| `owner` | Livre e obrigatório | Usuário ou organização GitHub. |
| `repository` | Livre e obrigatório | Nome do repositório, sem URL. |
| `branch` | Livre e obrigatório | Branch já existente para a documentação. |
| `forceBootstrap` | Booleano controlado | Normalmente `false`. Use `true` somente para republicação deliberada, sabendo que documentos humanos podem ser substituídos. |
| `aiMode` | Fixo | Mantenha `bootstrap`; a IA é obrigatória. |
| `documentationMode` | Fixo | Mantenha `bootstrap`. |

As expressões preservam os campos vindos do Formulário. Os placeholders `YOUR_GITHUB_USER` e `YOUR_REPOSITORY` precisam ser substituídos após a importação.

## Credenciais e subworkflows

- `Consultar projeto existente`: credencial **GitHub API** com leitura no destino.
- `Executar Core do projeto`: selecione o Core importado.
- `Executar enriquecimento inicial`: selecione a IA importada; a credencial OpenAI fica nela.
- `Publicar Bootstrap`: selecione o Publisher importado; a credencial GitHub de escrita fica nele.

## Exemplo

```text
projectSlug = carteira-invest
owner = acme
repository = n8n-workflows
branch = docs/generated
forceBootstrap = false
aiMode = bootstrap
documentationMode = bootstrap
```
