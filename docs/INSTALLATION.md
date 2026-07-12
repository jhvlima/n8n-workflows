# Instalação em outra instância n8n

## Pré-requisitos

- Instância n8n com API habilitada.
- Chave da API n8n.
- Repositório e branch GitHub para a documentação.
- Credencial GitHub com leitura e escrita de conteúdo.
- Credencial OpenAI para gerar os dois documentos do Bootstrap.

O projeto foi testado no n8n `2.28.6`.

## 1. Importe os templates

Importe nesta ordem:

1. `core-documentation.json`
2. `ai-enrichment.json`
3. `github-publisher.json`
4. `bootstrap-documentation.json`
5. `bootstrap-form.json`
6. `daily-maintenance.json`

Se a instância oferecer folders, agrupe os seis workflows em `githubDocs`.

## 2. Configure credenciais

- Core: configure a credencial n8n API no nó `Listar workflows`.
- IA: configure a credencial no nó `Modelo OpenAI`.
- Publisher: configure GitHub em `Consultar arquivo existente` e `Criar ou atualizar no GitHub`.
- Bootstrap: configure GitHub em `Consultar projeto existente`.
- Formulário: reutilize a credencial GitHub no nó `Listar projetos já publicados`; o acesso ao formulário exige login no n8n.
- Maintenance: configure GitHub em `Consultar project.json remoto`.

Em Docker, a URL da credencial n8n precisa ser acessível de dentro do container.

## 3. Selecione os subworkflows

- IA: `Executar Core determinístico` → Core.
- Bootstrap: selecione Core, IA e Publisher.
- Formulário: `Descobrir projetos documentáveis` → Core; `Executar Bootstrap selecionado` → Bootstrap.
- Maintenance: selecione Core e Publisher.

Os IDs dos templates são placeholders e precisam ser selecionados novamente após a importação.

## 4. Configure o destino

Nos nós `Configuração Bootstrap` e `Configuração Maintenance`, ajuste:

- usuário ou organização GitHub;
- repositório;
- branch de documentação;

Crie a branch antes da primeira publicação. Não publique diretamente em `main` durante a implantação.

## 5. Aplique as tags

Cada workflow documentado precisa de:

```text
docs-internal
project:<slug>
```

Use opcionalmente `component:agent`, `component:tool` ou `component:subflow`.

## 6. Ative e teste

- Ative Core, Publisher e Bootstrap, pois são subworkflows.
- Ative a IA, pois todo Bootstrap depende dela.
- Ative o Formulário para disponibilizar sua URL de produção.
- Ative Maintenance somente depois de validar o Bootstrap.
- Confirme o fuso `America/Sao_Paulo` e o Schedule das 23:50.

## 7. Primeiro projeto

1. Abra `/form/bootstrap-documentacao` autenticado no n8n.
2. Carregue os projetos e selecione o `projectSlug` no dropdown.
3. Confirme a geração; o formulário chama o Bootstrap automaticamente.
4. Revise `README.md` e `docs/architecture.mmd` no GitHub.
5. Faça uma edição humana em `README.md`.
6. Altere tecnicamente um workflow e execute a Maintenance manualmente.
7. Confirme que os documentos humanos foram preservados.

Leia [Segurança](SECURITY.md) antes de ativar a agenda.
