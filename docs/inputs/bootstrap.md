# Inputs — Bootstrap

Workflow: `Bootstrap - Documentação n8n`

O Bootstrap não é uma entrada humana direta. Ele recebe os dados do Formulário ou de outro subworkflow autorizado.

## Edit Fields `Configuração Bootstrap`

| Campo | Regra | Como definir |
| --- | --- | --- |
| `projectSlug` | Livre e obrigatório | Slug escolhido no formulário e já validado pelo Core. |
| `notionRootUrl` | Livre e opcional | Página raiz do projeto no Notion. Vazio executa o Bootstrap sem reuniões. |
| `documentationLayout` | Fixo | Mantenha `separated`. |
| `owner` | Livre e obrigatório | Usuário ou organização GitHub. |
| `repository` | Livre e obrigatório | Nome do repositório, sem URL. |
| `branch` | Livre e obrigatório | Branch já existente para a documentação. |
| `forceBootstrap` | Booleano controlado | Normalmente `false`. Com `true`, lê e sanitiza os documentos humanos anteriores antes de reorganizá-los. |
| `aiMode` | Fixo | Mantenha `bootstrap`; a IA é obrigatória. |
| `documentationMode` | Fixo | Mantenha `bootstrap`. |

As expressões preservam os campos vindos do Formulário. Os placeholders `YOUR_GITHUB_USER` e `YOUR_REPOSITORY` precisam ser substituídos após a importação.

## Credenciais e subworkflows

- `Consultar projeto existente`, os documentos anteriores, `Consultar decisões e aprendizados anteriores`, `Consultar README da pasta projects` e `Consultar PR_REVIEW legado`: use a mesma credencial **GitHub API** com leitura.
- `Anexar documentação anterior`: limita cada arquivo a 120.000 bytes e mascara padrões de token, segredo, senha e URL privada antes da IA.
- `Executar Core do projeto`: selecione o Core importado.
- `Coletar reuniões do Notion`: selecione `Notion - Contexto de Reuniões do Projeto`; a credencial Notion fica nele.
- `Executar enriquecimento inicial`: selecione a IA importada; a credencial OpenAI fica nela.
- `Publicar Bootstrap`: selecione o Publisher importado; a credencial GitHub de escrita fica nele.

`projects/README.md` não é enviado ao modelo. Se estiver ausente ou vazio, o Bootstrap o cria com o título `# Projetos documentados` e o roteiro. Se já tiver conteúdo, substitui somente o trecho entre `<!-- n8n-docs:pr-review:start -->` e `<!-- n8n-docs:pr-review:end -->`, preservando o restante. Se o antigo `PR_REVIEW.md` existir na raiz, ele é removido no mesmo commit da migração.

`docs/DECISIONS_AND_LEARNINGS.md` também não é enviado à IA. Quando ausente ou vazio, recebe um esqueleto com contexto, decisão ou aprendizado, alternativas, consequências, evidências e ações futuras. Quando já estiver preenchido, o rebootstrap preserva o conteúdo integralmente.

Quando `notionRootUrl` estiver preenchido, o coletor sanitiza e resume cada página separadamente. A IA principal recebe somente esses resumos durante a execução e os usa principalmente em `docs/INTERNAL.md`. Antes da publicação, resumos, transcrições, URLs e IDs são removidos; `project.json` guarda somente os metadados `contextSources.notion`.

## Exemplo

```text
projectSlug = carteira-invest
notionRootUrl = https://www.notion.so/acme/Projeto-0123456789abcdef0123456789abcdef
documentationLayout = separated
owner = acme
repository = n8n-workflows
branch = docs/generated
forceBootstrap = false
aiMode = bootstrap
documentationMode = bootstrap
```
