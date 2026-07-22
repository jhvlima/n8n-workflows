# Checklist detalhado de implantação

O procedimento completo de uso está no [README](../README.md). Use este checklist para validar uma instalação nova ou uma migração para outra instância.

Não é necessário clonar este repositório para operar o pipeline. Baixe ou importe os seis templates na interface do n8n e configure qualquer repositório GitHub como destino. A pasta `projects/` deste repositório é somente um conjunto de exemplos.

## Pré-requisitos

- n8n com API habilitada;
- chave da API n8n dedicada;
- repositório e branch GitHub já existentes;
- credencial GitHub com `Contents: read and write`;
- credencial OpenAI;
- usuário n8n autorizado a abrir o formulário.

O repositório de destino pode ser o mesmo que contém os templates, um monorepo existente ou um repositório separado para documentação.

Compatibilidade validada: n8n `2.28.6` e `1.121.2`. Consulte as [diferenças entre as variantes](COMPATIBILITY.md).

## Importação

- [ ] Escolher `workflows/n8n-2.28.6/` ou `workflows/n8n-1.121.2/` conforme a instância.
- [ ] Importar Core, IA, Publisher, Bootstrap, Formulário e Maintenance, nessa ordem, sem misturar variantes.
- [ ] Opcionalmente, colocar os seis no folder `githubDocs`.
- [ ] Configurar n8n API em `Listar workflows`.
- [ ] Configurar OpenAI em `Modelo OpenAI`.
- [ ] Configurar GitHub nos nodes indicados pelos Sticky Notes.
- [ ] Selecionar novamente todos os subworkflows nos nodes `Execute Workflow`.
- [ ] Substituir `YOUR_GITHUB_USER` e `YOUR_REPOSITORY` nos Edit Fields.
- [ ] Confirmar que a branch configurada já existe.
- [ ] Manter `forceBootstrap=false`.
- [ ] No n8n 2.28.6, manter o Form Trigger protegido por `n8n User Auth`.
- [ ] No n8n 1.121.2, configurar uma credencial `HTTP Basic Auth` no Form Trigger.

Os IDs `SELECT_*_AFTER_IMPORT` são placeholders e não podem permanecer na instância configurada.

## Docker e rede

A URL da credencial n8n é acessada pelo container. `localhost` dentro do container aponta para o próprio container, não necessariamente para o host. Use um endereço alcançável pela rede Docker ou o nome correto do serviço.

## Teste de fumaça

1. Crie ou escolha um workflow de teste.
2. Aplique `docs-internal` e `project:teste-documentacao`.
3. Execute o Core com esse slug e confirme que apenas o workflow esperado aparece.
4. Abra o formulário autenticado e execute o Bootstrap.
5. Confira no GitHub o README, os documentos técnico e interno, os documentos individuais, os snapshots sanitizados e o manifesto.
6. Confirme no histórico que o Bootstrap criou exatamente um commit contendo todo o pacote.
7. Edite um documento humano manualmente.
8. Faça uma alteração técnica no workflow e execute a Maintenance.
9. Confirme que a Maintenance criou um único commit para o projeto e preservou os documentos humanos.

## Antes de ativar o Schedule

- [ ] Fuso `America/Sao_Paulo` confirmado.
- [ ] Cron `50 23 * * *` confirmado.
- [ ] Branch protegida ou dedicada.
- [ ] Diff revisado por pull request.
- [ ] Projeto de teste removido ou mantido deliberadamente.

Consulte também [Segurança](SECURITY.md) e [Inputs e credenciais](inputs/README.md).
