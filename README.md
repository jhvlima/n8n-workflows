# Documentação versionada de projetos n8n

Este repositório contém um pipeline reutilizável para agrupar workflows n8n em projetos, gerar a documentação inicial e manter snapshots técnicos diários no GitHub sem sobrescrever documentos mantidos pelo time.

> Os templates não incluem credenciais. Toda saída automática mantém `reviewRequired: true`.

## Workflows do pipeline

| Workflow | Responsabilidade | Template |
| --- | --- | --- |
| Core | Agrupa workflows pelas tags `docs-internal` e `project:<slug>`, sanitiza e calcula o hash funcional | [core-documentation.json](workflows/core-documentation.json) |
| IA | Gera `README.md` e `docs/architecture.mmd` a partir do projeto sanitizado | [ai-enrichment.json](workflows/ai-enrichment.json) |
| Publisher | Recebe caminhos completos, ignora conteúdo idêntico e publica serialmente | [github-publisher.json](workflows/github-publisher.json) |
| Formulário | Lista os projetos documentáveis e coleta a escolha do usuário autenticado | [bootstrap-form.json](workflows/bootstrap-form.json) |
| Bootstrap | Recebe o projeto escolhido e cria uma vez os arquivos humanos e técnicos | [bootstrap-documentation.json](workflows/bootstrap-documentation.json) |
| Maintenance | Compara hashes diariamente e atualiza somente arquivos técnicos | [daily-maintenance.json](workflows/daily-maintenance.json) |

O fluxo foi validado com n8n `2.28.6`.

## Ciclo de vida

```mermaid
flowchart TD
    T[docs-internal + project:slug] --> C[Core]
    C --> F[Formulário autenticado]
    F --> B[Bootstrap]
    B --> A[IA obrigatória]
    A --> P[Publisher]
    P --> G[GitHub]

    S[Schedule diário 23:50] --> M[Maintenance]
    M --> C
    M --> H{Hash mudou?}
    H -->|não| X[Encerrar sem publicação]
    H -->|sim| Q[Somente arquivos técnicos]
    Q --> P
```

Depois do Bootstrap, `README.md` e `docs/architecture.mmd` pertencem ao time. A Maintenance atualiza apenas `workflows/` e `project.json`.

## Identificação dos projetos

Todo workflow documentado precisa de exatamente duas informações:

```text
docs-internal
project:<slug-do-projeto>
```

Tags opcionais descrevem o papel do componente:

```text
component:agent
component:tool
component:subflow
```

Vários workflows com o mesmo `project:<slug>` formam um único projeto e compartilham uma versão.

## Instalação rápida

1. Importe os seis templates da pasta [workflows](workflows/).
2. Configure as credenciais n8n, OpenAI e GitHub.
3. Selecione novamente os subworkflows nos nós `Execute Workflow`.
4. Configure usuário, repositório e branch no Bootstrap e na Maintenance.
5. Aplique `docs-internal` e `project:<slug>` aos workflows de negócio.
6. Ative Core, IA, Publisher, Bootstrap, Formulário e Maintenance.
7. Abra o formulário e escolha o projeto para executar o Bootstrap.

Consulte [Instalação](docs/INSTALLATION.md), [Configuração](docs/CONFIGURATION.md) e [Ciclo de vida](docs/LIFECYCLE.md).

## Estrutura por projeto

```text
projects/<project-slug>/
├── README.md
├── docs/
│   └── architecture.mmd
├── workflows/
│   └── <workflow>.sanitized.json
└── project.json
```

A pasta `projects/` é preenchida pelo Bootstrap; cada subdiretório representa um projeto identificado por `project:<slug>`.

## Guias

- [Instalação em outra instância](docs/INSTALLATION.md)
- [Configuração dos workflows](docs/CONFIGURATION.md)
- [Arquitetura e contratos](docs/ARCHITECTURE.md)
- [Bootstrap e Maintenance](docs/LIFECYCLE.md)
- [Documentos humanos e de agentes](docs/CONTRIBUTING-DOCUMENTS.md)
- [Segurança](docs/SECURITY.md)

## Manutenção dos templates

Preencha a URL, a chave da API e os seis IDs em `.env`:

```bash
set -a
source .env
set +a
node scripts/export-workflow-templates.mjs
node scripts/validate-repository.mjs
```

O exportador remove credenciais e troca IDs locais de subworkflows por marcadores portáteis.
