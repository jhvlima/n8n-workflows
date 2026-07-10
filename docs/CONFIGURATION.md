# Configuração dos workflows

Este documento lista os pontos que precisam ser ajustados depois da importação.

## Core determinístico

Workflow: `Core - Documentação n8n (Dry Run)`

| Nó | Configuração | Valor recomendado |
| --- | --- | --- |
| `Configuração` | `requiredTag` | `docs-internal` |
| `Configuração` | `dryRun` | `true` |
| `Listar workflows` | Credencial `n8n API` | A própria instância |

O Core seleciona somente workflows com a tag configurada. Ele não chama IA e não escreve no GitHub.

O JSON exportado contém apenas `name`, `nodes`, `connections` e `settings`. Credenciais, caminhos de webhook, prompts e identificadores sensíveis são substituídos ou removidos.

## Enriquecimento com IA

Workflow: `AI - Enriquecimento da Documentação n8n`

| Nó | Configuração | Observação |
| --- | --- | --- |
| `Executar Core determinístico` | Workflow alvo | Selecione o Core importado |
| `Modelo OpenAI` | Credencial | Configure localmente |
| `Modelo OpenAI` | Modelo | Use um modelo disponível na conta |
| `Modelo OpenAI` | Temperatura | Valor baixo, como `0.1` |

A entrada da IA é construída a partir de `workflow.sanitized.json`. Os arquivos brutos, credenciais e dados da instância não são enviados.

A saída adiciona:

- resumo técnico;
- finalidade de negócio, quando houver evidência;
- entradas e saídas;
- integrações;
- riscos;
- sugestões de troubleshooting;
- pontos que precisam de confirmação;
- nível de confiança;
- arquivo `docs/ai-enrichment.md`.

## Publisher GitHub

Workflow: `Publisher - GitHub n8n-workflows`

| Nó | Configuração | Observação |
| --- | --- | --- |
| `Executar core determinístico` | Workflow alvo | Selecione o Core importado |
| `Executar enriquecimento com IA` | Workflow alvo | Selecione a IA importada |
| `Expandir arquivos` | `owner` | Usuário ou organização do GitHub |
| `Expandir arquivos` | `repository` | Nome do repositório |
| `Expandir arquivos` | `branch` | Branch exclusiva para documentação |
| `Consultar arquivo existente` | Credencial GitHub | Leitura do conteúdo |
| `Criar ou atualizar no GitHub` | Credencial GitHub | Escrita do conteúdo |

O Publisher processa um arquivo por vez. Isso evita conflitos entre os próprios itens da execução, mas não impede conflito com outra pessoa ou agente alterando o mesmo arquivo simultaneamente.

Ele executa `create` quando o caminho ainda não existe e `update` usando o SHA atual quando o arquivo já existe. Arquivos extras no repositório não são removidos.

## Convenção de tags

Recomendação inicial:

| Tag | Uso |
| --- | --- |
| `docs-internal` | Inclui o workflow na geração |
| `portfolio` | Classificação opcional; não publica por si só |

Use uma tag dedicada em vez de documentar todos os workflows da instância.

## Branches

Use uma branch como `docs/generated` ou `test/n8n-docs`. O Publisher não deve escrever diretamente na branch principal.

Fluxo recomendado:

1. Publisher atualiza a branch.
2. GitHub abre ou atualiza um pull request.
3. Uma pessoa revisa os arquivos.
4. O merge promove a documentação aprovada.
