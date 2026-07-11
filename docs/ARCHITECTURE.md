# Arquitetura e contratos

## Componentes

```mermaid
flowchart TD
    T[Tags docs-internal e project:slug] --> C[Core N:1]
    C --> B[Bootstrap manual]
    C --> M[Maintenance diária]
    B --> A[IA obrigatória]
    M --> D{Hash mudou?}
    D -->|não| S[Skip]
    D -->|sim| P
    A --> P
    P --> G[GitHub monorepo]
```

## Contrato do Core

```json
{
  "kind": "project",
  "projectSlug": "agente-vendas",
  "functionalHash": "hash-agregado",
  "components": [],
  "dependencies": [],
  "humanFiles": {},
  "technicalFiles": {
    "workflows/agente.sanitized.json": "...",
    "project.json": "..."
  },
  "reviewRequired": true
}
```

O hash agrega os hashes funcionais de todos os componentes e suas dependências. Credenciais, IDs de credenciais e caminhos privados não participam do conteúdo público.

## Agentes, tools e subworkflows

O `project.json` registra cada componente com `componentId`, papel, hash e ID local. Dependências diretas formam relações `usesTool` ou `callsSubflow` e são fornecidas à IA para a criação da arquitetura.

Uma tool compartilhada é documentada uma vez e pode aparecer como dependência de vários agentes.

## Contrato da IA

A IA recebe somente o snapshot sanitizado do Core e produz exatamente dois arquivos humanos no Bootstrap:

- `README.md`, em Markdown e português do Brasil;
- `docs/architecture.mmd`, como Mermaid puro.

A Maintenance não chama a IA. Depois do Bootstrap, esses documentos podem ser revisados pelo time sem risco de sobrescrita diária.

## Contrato do Publisher

O Publisher recebe caminhos completos e não conhece regras de Bootstrap ou Maintenance. Cada arquivo é consultado, comparado e então criado, atualizado ou ignorado.

Como a escrita é serial, os orquestradores enviam `project.json` por último. Assim ele funciona como marcador de uma versão completamente publicada.

## Falhas e idempotência

- Core falhou: nada é publicado.
- IA falhou: a publicação do projeto é interrompida.
- Publisher falhou antes de `project.json`: a próxima execução ainda pode recuperar os arquivos.
- Hash igual: Maintenance não chama Publisher.
- Projeto sem `project.json` concluído: Maintenance exige Bootstrap.
