# Configuração dos workflows

## Core

Workflow: `Core - Documentação n8n (Dry Run)`

| Configuração | Padrão |
| --- | --- |
| Tag de inclusão | `docs-internal` |
| Prefixo de projeto | `project:` |
| Credencial | API da própria instância n8n |

O Core exige exatamente uma tag `project:<slug>` em cada workflow com `docs-internal`. Ele agrupa componentes, sanitiza parâmetros, descobre referências diretas de subworkflows e calcula o `functionalHash` agregado.

## Papéis dos componentes

| Tag | Papel |
| --- | --- |
| `component:agent` | Agente principal |
| `component:tool` | Tool chamada por agente |
| `component:subflow` | Subworkflow interno |
| Sem tag de papel | Workflow genérico |

Uma referência por ID em `Execute Workflow` ou `Workflow Tool` aparece em `dependencies`. Referências dinâmicas por expressão precisam de revisão manual.

## IA

A IA é uma etapa obrigatória do Bootstrap e escreve `README.md` e `docs/architecture.mmd`. Ela não participa da Maintenance diária. O manifesto mantém `aiMode: bootstrap` para registrar essa política.

## Publisher

O Publisher recebe:

```json
{
  "owner": "usuario",
  "repository": "repositorio",
  "branch": "docs/generated",
  "projectSlug": "meu-projeto",
  "files": {
    "projects/meu-projeto/project.json": "..."
  }
}
```

Ele aceita apenas caminhos sob `projects/`, rejeita segmentos `..`, compara o conteúdo remoto e publica serialmente somente arquivos alterados. Não chama Core nem IA e não remove arquivos extras.

## Bootstrap

Configure em `Configuração Bootstrap`:

- `projectSlug`;
- `owner`, `repository` e `branch`;
- `forceBootstrap`, que deve permanecer `false`.

O Bootstrap publica arquivos humanos e técnicos. Se `project.json` já existir, ele falha para evitar sobrescrever documentação mantida pelo time.

## Maintenance

Configure em `Configuração Maintenance`:

- `requiredTag` e `projectTagPrefix`;
- `owner`, `repository` e `branch`.

O Schedule padrão é `50 23 * * *`, no fuso `America/Sao_Paulo`. Projetos sem Bootstrap são reportados como `needs-bootstrap` e ignorados.

## Propriedade dos caminhos

| Caminho | Responsável |
| --- | --- |
| `README.md` | Pessoas e agentes após o Bootstrap |
| `docs/**` | Pessoas e agentes após o Bootstrap |
| `workflows/**` | Maintenance |
| `project.json` | Maintenance |

Use branch dedicada e revisão por pull request.
