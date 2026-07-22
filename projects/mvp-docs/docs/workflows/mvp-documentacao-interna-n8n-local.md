# MVP - Documentação Interna n8n (Local)

[Voltar para a documentação do projeto](../../README.md)

## Papel no projeto

É o workflow principal do MVP local de documentação. Ele disponibiliza páginas e endpoints para consultar workflows, gerar ou editar Markdown e persistir documentos no sistema de arquivos.

## Gatilhos e entradas

- Webhook `docsify`: atende a interface principal da documentação.
- Webhook `single workflow`: atende operações relacionadas a um workflow e seus documentos.
- As ações, nomes de arquivo e parâmetros de configuração chegam pelas requisições HTTP e são roteados pelos nodes `file types`, `md files` e `doc action`.

## Etapas principais

1. `CONFIG` prepara os parâmetros comuns das requisições.
2. O fluxo consulta workflows e tags pela API n8n para montar páginas de visão geral.
3. Para um workflow individual, tenta carregar um arquivo Markdown existente ou consulta o workflow pela API.
4. Quando a ação exige geração, usa `Basic LLM Chain`, OpenAI e parsers estruturados.
5. `Generate Mermaid Chart` prepara o diagrama e os nodes HTML montam as páginas de leitura ou edição.
6. Em uma ação de salvamento, converte o conteúdo em arquivo e usa `Save New Doc File` para persistir o Markdown.
7. Os nodes `Respond to Webhook` devolvem HTML, Markdown ou confirmação da gravação.

## Integrações e credenciais

- API n8n: credencial com leitura de workflows e tags.
- OpenAI: credencial do modelo usado pela cadeia LLM e pelo parser de correção.
- Sistema de arquivos: permissões de leitura, criação de diretórios e escrita nos caminhos configurados.
- HTTP/Webhooks: exposição de endpoints para consulta, edição e salvamento.

## Dependências

Nenhuma chamada a outro workflow n8n foi identificada. O workflow depende da API da própria instância, do modelo OpenAI, do sistema de arquivos local e da disponibilidade dos webhooks.

## Saídas

- Páginas HTML para navegação e edição.
- Conteúdo Markdown e diagramas para workflows individuais.
- Arquivos Markdown gravados no diretório configurado.
- Respostas HTTP de confirmação após salvamento.

## Tratamento de erros

O `Auto-fixing Output Parser` tenta corrigir respostas estruturadas da IA. Não foram identificados ramos gerais de erro para falhas de API, acesso ao sistema de arquivos, comandos locais ou respostas HTTP.

## Limitações e pontos de confirmação

- Confirmar autenticação e autorização dos webhooks de leitura e escrita.
- Confirmar os caminhos permitidos e impedir path traversal na manipulação de arquivos.
- Revisar o conteúdo gerado pela IA antes de tratá-lo como documentação oficial.
- Definir retentativas, alertas e limites para chamadas à API n8n e OpenAI.
