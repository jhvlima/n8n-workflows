# Inputs — Contexto de reuniões do Notion

Workflow: `Notion - Contexto de Reuniões do Projeto`

Este subworkflow recebe uma página raiz opcional do Notion, identifica as subpáginas de reunião, sanitiza cada conteúdo e usa um agente para produzir um resumo individual antes da documentação principal. Ele não publica as transcrições nem mantém uma cópia delas no GitHub.

## Edit Fields `Configuração Notion`

| Campo | Regra | Como definir |
| --- | --- | --- |
| `notionRootUrl` | Livre e opcional | URL completa `notion.so`/`notion.site` ou page ID UUID. Vazio desativa a coleta sem falhar o Bootstrap. |
| `maxPages` | Inteiro controlado | Padrão `100`; aceita de 1 a 500 subpáginas de reunião. |
| `maxCharsPerPage` | Inteiro controlado | Padrão `20000`; limita a entrada sanitizada de cada reunião antes do agente resumidor. |
| `maxSummaryCharsPerPage` | Inteiro controlado | Padrão `4000`; limita o resumo produzido para cada reunião. |
| `maxTotalChars` | Inteiro controlado | Padrão `40000`; limita o conjunto de resumos entregue ao agente de documentação. |
| `notionApiVersion` | Controlado | Mantenha `2026-03-11` enquanto a API usada pelos nodes for essa versão. |

O Bootstrap encaminha `notionRootUrl` recebido do formulário. Os demais limites são administrativos e permanecem dentro deste subworkflow.

## Credencial

Nos nodes `Listar blocos da página raiz` e `Ler página como Markdown`, selecione a mesma credencial **Notion API**. No node `Modelo OpenAI - Resumo de reuniões`, selecione uma credencial **OpenAI API**.

Compartilhar somente a raiz normalmente torna seus descendentes acessíveis, mas páginas com restrições próprias podem continuar indisponíveis. Confirme o acesso usando a própria credencial antes de liberar o formulário ao time.

## Descoberta e limites

O node `Listar blocos da página raiz` consulta, com paginação, os blocos filhos da página informada. `Selecionar subpáginas de reunião` mantém somente blocos do tipo `child_page`, preserva a ordem exibida na raiz e usa o título de cada subpágina, como `16/09/2025`.

A estrutura esperada é:

```text
Reuniões (página raiz)
├── 16/09/2025 (subpágina)
├── 23/09/2025 (subpágina)
└── 30/09/2025 (subpágina)
```

Cada subpágina selecionada é então lida como Markdown. Blocos comuns que não são subpáginas são ignorados. Se nenhuma `child_page` direta for encontrada, o fluxo encerra com uma mensagem orientando a revisar o link e o compartilhamento com a integração.

Depois, o coletor processa uma reunião por vez:

- mascara padrões conhecidos de token, senha, segredo e URL interna;
- limita o texto sanitizado antes da primeira chamada de IA;
- pede ao `Agente resumidor de reuniões` um resumo factual com decisões, responsáveis, datas, riscos e pendências;
- limita cada resumo e descarta o Markdown bruto do payload agregado;
- utiliza um trecho sanitizado como contingência quando uma sumarização falha;
- interrompe o conjunto de resumos ao atingir o limite total;
- informa `truncated=true` quando algum conteúdo pode estar incompleto;
- informa quantos resumos usaram fallback;
- calcula um hash sem guardar a URL ou o page ID na saída publicada.

## Saída transitória

Durante a chamada para a IA, a saída possui:

```json
{
  "notionContext": {
    "enabled": true,
    "status": "collected-and-summarized",
    "pagesProcessed": 8,
    "pagesDiscovered": 8,
    "summarized": true,
    "summarizedPages": 8,
    "summaryFallbacks": 0,
    "contentHash": "HASH",
    "truncated": false,
    "contentPublished": false,
    "pages": [
      {
        "title": "Reunião de levantamento",
        "lastEditedTime": "2026-08-01T14:00:00.000Z",
        "markdown": "Resumo sanitizado da reunião",
        "summarized": true,
        "summaryFallback": false
      }
    ]
  }
}
```

Depois da IA, `Remover transcrições da saída` elimina `pages`, `notionRootUrl`, URLs e IDs. O `project.json` recebe somente:

```json
{
  "contextSources": {
    "notion": {
      "enabled": true,
      "status": "collected",
      "collectedAt": "2026-08-03T18:00:00.000Z",
      "pagesProcessed": 8,
      "pagesDiscovered": 8,
      "summarized": true,
      "summarizedPages": 8,
      "summaryFallbacks": 0,
      "contentHash": "HASH",
      "truncated": false,
      "contentPublished": false
    }
  }
}
```

## Segurança e revisão

O conteúdo do Notion é tratado como dado não confiável: instruções encontradas em uma transcrição não podem alterar o comportamento do agente. As reuniões são usadas principalmente em `docs/INTERNAL.md`; fatos técnicos precisam ser comprovados pelos workflows sanitizados.

Mesmo sanitizado, o conteúdo pode conter dados pessoais, comerciais ou contratuais. Use um repositório de documentação com visibilidade adequada e revise `docs/INTERNAL.md` antes do merge.
