# Dicionário de configurações e tags

O caminho normal de instalação e os dois cenários de uso estão no [README](../README.md). Este arquivo é a referência central dos valores definidos nos Edit Fields e no formulário.

Para credenciais e exemplos completos de um workflow específico, consulte [Inputs e credenciais](inputs/README.md).

## Onde os campos aparecem

| Edit Fields | Campos |
| --- | --- |
| Core — `Configuração` | `requiredTag`, `projectTagPrefix`, `projectSlug`, `aiMode`, `documentationMode` |
| Formulário — `Configuração do formulário` | `requiredTag`, `projectTagPrefix`, `projectSlug`, `aiMode`, `documentationMode`, `owner`, `repository`, `branch` |
| Notion — `Configuração Notion` | `notionRootUrl`, `maxPages`, `maxCharsPerPage`, `maxSummaryCharsPerPage`, `maxTotalChars`, `notionApiVersion` |
| Bootstrap — `Configuração Bootstrap` | `projectSlug`, `notionRootUrl`, `documentationLayout`, `aiMode`, `owner`, `repository`, `branch`, `forceBootstrap`, `documentationMode` |
| Maintenance — `Configuração Maintenance` | `requiredTag`, `projectTagPrefix`, `projectSlug`, `aiMode`, `owner`, `repository`, `branch`, `documentationMode` |

## Dicionário de campos

### `requiredTag`

| Propriedade | Valor |
| --- | --- |
| Tipo | Texto livre |
| Padrão | `docs-internal` |
| Onde aparece | Core, Formulário e Maintenance |

É a tag que autoriza um workflow a entrar no pipeline. Pode ser substituída por outra tag, mas o Formulário e a Maintenance precisam usar o mesmo valor. Workflows sem essa tag são ignorados.

O campo aceita texto livre tecnicamente, mas o pipeline completo fornecido pressupõe `docs-internal` no Bootstrap. Para usar outra tag de ponta a ponta também seria necessário propagar esse campo pela configuração do Bootstrap. Sem modificar os workflows, mantenha o padrão.

### `projectTagPrefix`

| Propriedade | Valor |
| --- | --- |
| Tipo | Texto livre |
| Padrão | `project:` |
| Onde aparece | Core, Formulário e Maintenance |

Identifica qual tag contém o agrupamento do projeto. Com o padrão, `project:carteira-invest` produz o slug `carteira-invest`. Inclua o separador final no prefixo e mantenha o mesmo valor no Formulário e na Maintenance. Um workflow que tenha `requiredTag`, mas nenhuma tag com esse prefixo, é ignorado. Duas ou mais tags com o prefixo continuam sendo um erro por tornarem o projeto ambíguo.

Assim como `requiredTag`, o campo aceita texto livre no Core, mas o Bootstrap fornecido usa o padrão `project:`. Mantenha esse valor para o funcionamento completo sem customizar os workflows.

### `projectSlug`

| Contexto | Valor e efeito |
| --- | --- |
| Core | Vazio processa todos os projetos; preenchido filtra um projeto |
| Formulário | Deve permanecer vazio durante a descoberta |
| Bootstrap | Obrigatório; recebe o projeto escolhido no formulário |
| Maintenance | Vazio processa todos; preenchido faz uma execução direcionada |

O Core normaliza o valor para minúsculas, remove acentos e converte espaços ou símbolos em hífens. Use um slug estável porque ele define `projects/<slug>/` no GitHub.

### `notionRootUrl`

| Propriedade | Valor |
| --- | --- |
| Tipo | Texto livre opcional |
| Padrão | Vazio |
| Onde aparece | Formulário, Bootstrap e coletor Notion |

Aceita a URL completa `notion.so`/`notion.site` ou um page ID UUID da página raiz do projeto. Vazio mantém o comportamento anterior e gera a documentação sem reuniões. Quando preenchido, o coletor encontra as subpáginas, sanitiza e resume cada reunião com um agente dedicado. Somente os resumos limitados seguem transitoriamente à IA principal, principalmente para `docs/INTERNAL.md`.

O link, os IDs, as transcrições e os resumos não são gravados no GitHub. `project.json` recebe somente `contextSources.notion` com status, data, contagens, número de fallbacks, hash e indicação de truncamento.

### `aiMode`

| Opção | Suporte atual | Efeito |
| --- | --- | --- |
| `bootstrap` | Suportada e obrigatória | A IA gera os documentos humanos no Bootstrap; a Maintenance nunca chama IA |

Atualmente não existem opções operacionais como `never`, `manual` ou `on-change`. Informar outro texto não cria um novo comportamento, pois o Bootstrap chama a IA obrigatoriamente e a Maintenance não possui uma ramificação de IA.

O campo permanece no manifesto como registro explícito da política utilizada. Para desligar ou alterar essa política seria necessário modificar os workflows, não apenas trocar o valor.

### `documentationLayout`

| Valor | Efeito |
| --- | --- |
| `separated` | Gera README operacional com Mermaid, documento técnico, documento interno e roteiro de revisão em arquivos separados |

Esse campo é fixo e não aparece no formulário. O Bootstrap registra `documentationLayout=separated` e `documentationSchemaVersion=2` em `project.json`. A Maintenance conserva esses valores, mas não regenera documentos humanos.

O pacote contém `docs/INTERNAL.md`; portanto, a separação editorial não substitui controle de acesso. Use repositório privado ou publique apenas uma cópia explicitamente sanitizada quando houver dados internos.

### `documentationMode`

Esse campo é controlado pelo pipeline e não deve ser apresentado como escolha ao usuário.

| Opção | Workflow | Efeito |
| --- | --- | --- |
| `core` | Core executado diretamente | Identifica uma geração determinística sem publicação |
| `form-discovery` | Formulário | Faz o Core descobrir projetos para o dropdown |
| `bootstrap` | Bootstrap | Identifica a primeira geração humana e técnica |
| `maintenance` | Maintenance | Identifica a atualização exclusivamente técnica |

`documentationMode` descreve o contexto da chamada. Alterar somente esse texto não transforma um workflow em outro nem liga ou desliga a IA.

### `owner`

| Propriedade | Valor |
| --- | --- |
| Tipo | Texto livre obrigatório |
| Exemplo | `minha-organizacao` |
| Onde aparece | Formulário, Bootstrap e Maintenance |

Usuário ou organização proprietária do repositório GitHub. Informe apenas o nome, sem URL.

### `repository`

| Propriedade | Valor |
| --- | --- |
| Tipo | Texto livre obrigatório |
| Exemplo | `n8n-docs` |
| Onde aparece | Formulário, Bootstrap e Maintenance |

Nome do repositório de destino, sem o proprietário e sem URL. Pode ser qualquer repositório ao qual a credencial GitHub configurada tenha acesso.

### `branch`

| Propriedade | Valor |
| --- | --- |
| Tipo | Texto livre obrigatório |
| Exemplo | `docs/generated` |
| Onde aparece | Formulário, Bootstrap e Maintenance |

A branch precisa existir antes da primeira publicação. Use o mesmo destino nos três workflows. Recomenda-se uma branch dedicada e protegida por revisão.

### `forceBootstrap`

| Opção | Efeito |
| --- | --- |
| `false` | Comportamento normal; bloqueia Bootstrap quando `project.json` já existe |
| `true` | Lê e sanitiza README, documento técnico e documento interno anteriores, reorganiza o conteúdo e substitui `README.md`, `docs/**` e o manifesto |

Mantenha `false` como padrão administrativo. O formulário envia `true` automaticamente quando o usuário escolhe um projeto já publicado. O README anterior entra como contexto da IA, mas a mesclagem é semântica e não uma união determinística linha a linha. O resultado precisa de revisão humana.

## Campos apresentados no formulário

| Campo | Opções | Efeito |
| --- | --- | --- |
| `projectSlug` | Dropdown controlado | Mostra todos os projetos descobertos pelo Core; projetos já publicados acionam rebootstrap |
| `notionRootUrl` | Texto livre opcional | Página raiz com reuniões e subpáginas; vazio desativa a coleta |
| `documentationLayout` | `separated` | Valor técnico fixo; não é apresentado ao usuário |

O formulário não solicita confirmação para carregar a lista. O Form Trigger padrão apresenta apenas o botão `Carregar projetos`; o campo oculto e fixo `loadProjects=true` acompanha essa submissão técnica.

`owner`, `repository`, `branch` e o valor técnico de `forceBootstrap` não são expostos ao usuário final.

## Tags obrigatórias

Cada workflow documentado precisa ter:

```text
docs-internal
project:<slug>
```

- Use exatamente uma tag `project:<slug>` em cada workflow que realmente será documentado.
- Workflows com o mesmo slug formam um projeto N:1 e compartilham versão e documentação.
- Um workflow sem `requiredTag` fica fora do pipeline.
- Um workflow somente com `requiredTag`, sem `project:<slug>`, também fica fora do pipeline e aparece no resumo como ignorado.
- Um workflow com mais de uma tag `project:<slug>` bloqueia o Core por ambiguidade.

## Papéis opcionais

| Tag | Papel registrado |
| --- | --- |
| `component:agent` | Agente principal |
| `component:tool` | Tool chamada por agente |
| `component:subflow` | Subworkflow interno |
| Sem tag de papel | Workflow genérico |

O Core encontra referências diretas por ID em `Execute Workflow` e `Workflow Tool`. Referências dinâmicas por expressão exigem revisão manual.

## Propriedade dos arquivos

| Caminho | Responsável após o Bootstrap |
| --- | --- |
| `README.md` | Pessoas ou agentes |
| `docs/**` | Pessoas ou agentes |
| `workflows/**` | Maintenance |
| `project.json` | Maintenance |
