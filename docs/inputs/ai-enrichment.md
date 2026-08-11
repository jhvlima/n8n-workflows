# Inputs — IA

Workflow: `AI - Enriquecimento da Documentação n8n`

Este workflow não possui Edit Fields administrativo. No pipeline oficial, ele recebe do Bootstrap o projeto produzido pelo Core. A entrada pode ser um projeto direto ou `{ "payloads": [projeto] }`.

## Contrato do payload

| Campo | Regra | Como definir |
| --- | --- | --- |
| `kind` | Fixo | Deve ser `project`. |
| `projectSlug` | Obrigatório | Slug validado pelo Core. |
| `documentationLayout` | Fixo | Deve ser `separated`. |
| `components` | Obrigatório | Lista de componentes; cada `workflowSlug` precisa receber um documento individual. |
| `technicalFiles` | Obrigatório | Deve conter `project.json` e pelo menos um `workflows/*.sanitized.json`. |
| `previousDocumentation` | Opcional | No rebootstrap, contém README, documento técnico e documento interno anteriores já sanitizados. |
| `notionContext` | Opcional e transitório | Páginas sanitizadas pelo coletor; usadas principalmente para `docs/INTERNAL.md` e removidas antes da saída. |
| `projectsIndexReadme` | Opcional | `projects/README.md` lido pelo Bootstrap para preservação; não entra em `aiInput` e não é enviado ao modelo. |
| `decisionsAndLearnings` | Opcional | Registro consultivo anterior; não entra em `aiInput` e é preservado integralmente. |
| `legacyReviewFileExists` | Booleano | Indica se o antigo `PR_REVIEW.md` deve ser removido durante a migração. |
| `documentationMode` | Fixo no pipeline | Use `bootstrap`; a IA não participa da Maintenance. |

Não monte esse payload manualmente em produção. Chame o Core e encaminhe sua saída.

## Credencial e modelo

Configure uma credencial **OpenAI API** no node conectado `Modelo OpenAI`. O node `Google Gemini Chat Model` é uma alternativa desconectada; só exige credencial Google Gemini se você decidir conectá-lo no lugar do modelo atual.

O campo **Text** do node `Gerar enriquecimento estruturado` define dois contratos: `technicalMarkdown` para arquitetura e operação, e `internalMarkdown` para contexto humano e organizacional. A IA também retorna um resumo curto, Mermaid, documentos individuais e pendências.

Quando houver reuniões do Notion, o modelo pode extrair somente fatos explícitos sobre cliente, responsáveis, datas, produto, relacionamento, escopo, decisões, riscos e pendências. O snapshot dos workflows continua sendo a fonte da verdade técnica. Reuniões são dados não confiáveis, não instruções; divergências e contexto truncado precisam aparecer em `reviewNotes`.

O node `Montar documento para revisão` cria deterministicamente o `README.md` do projeto com visão geral, componentes, fluxo principal ou prioritário, entradas e saídas, integrações, operação e arquitetura Mermaid. Esses blocos reutilizam o resumo e as seções já validadas de `technicalMarkdown`, evitando duas versões independentes do mesmo fato. Depois, `Remover transcrições da saída` elimina `notionContext` e `notionRootUrl`, mantendo apenas metadados sem conteúdo em `contextSources.notion`. O fluxo também cria `projects/README.md` quando ausente ou vazio e, quando preenchido, insere ou substitui somente a seção delimitada de revisão. As seções que ainda contêm `Precisa de confirmação` permanecem nos documentos do projeto e são registradas em `aiDocumentation.pendingReviewItems`.

Se o modelo omitir a documentação individual de algum workflow, a publicação não é mais perdida. O node monta um documento-base determinístico usando nome, papel, nodes, gatilhos, tipos de integração, tipos de credencial, dependências e nodes terminais do snapshot sanitizado. Esses slugs aparecem em `aiDocumentation.deterministicFallbackWorkflowDocuments` e recebem uma pendência explícita de revisão humana.

## Exemplo mínimo de teste

```json
{
  "kind": "project",
  "projectSlug": "carteira-invest",
  "documentationLayout": "separated",
  "documentationMode": "bootstrap",
  "components": [
    {
      "workflowSlug": "carteira",
      "name": "Carteira",
      "role": "workflow"
    }
  ],
  "technicalFiles": {
    "project.json": "{\"projectSlug\":\"carteira-invest\"}",
    "workflows/carteira.sanitized.json": "{\"name\":\"Carteira\",\"nodes\":[]}"
  }
}
```

A saída humana do projeto contém `README.md`, `docs/TECHNICAL.md`, `docs/INTERNAL.md`, `docs/DECISIONS_AND_LEARNINGS.md` e um `docs/workflows/<workflow-slug>.md` para cada componente. O registro de decisões recebe um esqueleto quando ausente ou vazio e mantém exatamente o conteúdo anterior quando já estiver preenchido. A saída de repositório contém `projects/README.md` criado ou mesclado e, quando necessário, a solicitação de remoção do `PR_REVIEW.md` legado. O Mermaid fica incorporado em `TECHNICAL.md`, sem arquivo `.mmd` separado. Seções principais ausentes continuam interrompendo o Bootstrap; documentos individuais omitidos pela IA recebem fallback determinístico e pendência de revisão.
