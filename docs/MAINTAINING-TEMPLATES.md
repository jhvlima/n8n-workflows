# Manutenção e reexportação dos templates

Este guia é somente para quem modifica os seis workflows que formam o pipeline de documentação. Ele não é necessário para usar o pipeline normalmente.

## Duas sanitizações diferentes

| Processo | Entrada | Saída |
| --- | --- | --- |
| Core | Workflows dos projetos documentados | `projects/<slug>/workflows/*.sanitized.json` |
| Exportador de templates | Core, IA, Publisher, Bootstrap, Formulário e Maintenance da instância mantenedora | `workflows/*.json` deste repositório |

O Core protege os snapshots dos projetos. O exportador torna os próprios workflows do pipeline portáteis para que outras pessoas possam importá-los em outra instância.

## Quando executar

Execute o exportador somente depois de alterar um dos seis workflows na instância n8n e decidir atualizar os templates deste repositório.

Não execute se você apenas:

- importou os templates em sua instância;
- está documentando um projeto;
- executou Bootstrap ou Maintenance;
- editou documentos dentro de `projects/`.

## Configuração

Copie [.env.example](../.env.example) para `.env` e informe:

- URL e chave da API n8n;
- ID do Core;
- ID da IA;
- ID do Publisher;
- ID do Bootstrap;
- ID do Formulário;
- ID da Maintenance.

Não versionar `.env` nem compartilhar a chave da API.

## Reexportação

Execute a partir da raiz do repositório:

```bash
set -a
source .env
set +a
node scripts/export-workflow-templates.mjs
node scripts/validate-repository.mjs
git diff --check
```

O exportador sobrescreve os seis arquivos em `workflows/` com o estado atual da instância. Antes de aceitar as alterações, revise o diff completo.

## Transformações aplicadas

O exportador:

- remove referências de credenciais;
- troca IDs locais de subworkflows por seletores `SELECT_*_AFTER_IMPORT`;
- substitui usuário, repositório e branch reais por placeholders;
- mantém os nodes administrativos como Edit Fields;
- preserva apenas configurações portáteis do workflow.

O validador confere arquivos obrigatórios, formato dos JSONs, placeholders, Sticky Notes de configuração e padrões conhecidos de segredos. Isso não substitui revisão manual nem scanner dedicado.
