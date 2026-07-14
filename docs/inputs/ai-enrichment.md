# Inputs — IA

Workflow: `AI - Enriquecimento da Documentação n8n`

Este workflow não possui Edit Fields administrativo. No pipeline oficial, ele recebe do Bootstrap o projeto produzido pelo Core. A entrada pode ser um projeto direto ou `{ "payloads": [projeto] }`.

## Contrato do payload

| Campo | Regra | Como definir |
| --- | --- | --- |
| `kind` | Fixo | Deve ser `project`. |
| `projectSlug` | Obrigatório | Slug validado pelo Core. |
| `technicalFiles` | Obrigatório | Deve conter `project.json` e pelo menos um `workflows/*.sanitized.json`. |
| `documentationMode` | Fixo no pipeline | Use `bootstrap`; a IA não participa da Maintenance. |

Não monte esse payload manualmente em produção. Chame o Core e encaminhe sua saída.

## Credencial e modelo

Configure uma credencial **OpenAI API** no node conectado `Modelo OpenAI`. O node `Google Gemini Chat Model` é uma alternativa desconectada; só exige credencial Google Gemini se você decidir conectá-lo no lugar do modelo atual.

## Exemplo mínimo de teste

```json
{
  "kind": "project",
  "projectSlug": "carteira-invest",
  "documentationMode": "bootstrap",
  "technicalFiles": {
    "project.json": "{\"projectSlug\":\"carteira-invest\"}",
    "workflows/main.sanitized.json": "{\"name\":\"Carteira\",\"nodes\":[]}"
  }
}
```

A saída humana contém somente `README.md` e `docs/architecture.mmd`, ambos sujeitos a revisão.
