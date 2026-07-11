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
5. `daily-maintenance.json`

Se a instância oferecer folders, agrupe os cinco workflows em `githubDocs`.

## 2. Configure credenciais

- Core: configure a credencial n8n API no nó `Listar workflows`.
- IA: configure a credencial no nó `Modelo OpenAI`.
- Publisher: configure GitHub em `Consultar arquivo existente` e `Criar ou atualizar no GitHub`.
- Bootstrap: configure GitHub em `Consultar projeto existente`.
- Maintenance: configure GitHub em `Consultar project.json remoto`.

Em Docker, a URL da credencial n8n precisa ser acessível de dentro do container.

## 3. Selecione os subworkflows

- IA: `Executar Core determinístico` → Core.
- Bootstrap: selecione Core, IA e Publisher.
- Maintenance: selecione Core e Publisher.

Os IDs dos templates são placeholders e precisam ser selecionados novamente após a importação.

## 4. Configure o destino

Nos nós `Configuração Bootstrap` e `Configuração Maintenance`, ajuste:

- usuário ou organização GitHub;
- repositório;
- branch de documentação;
- slug do projeto no Bootstrap;

Crie a branch antes da primeira publicação. Não publique diretamente em `main` durante a implantação.

## 5. Aplique as tags

Cada workflow documentado precisa de:

```text
docs-internal
project:<slug>
```

Use opcionalmente `component:agent`, `component:tool` ou `component:subflow`.

## 6. Ative e teste

- Ative Core e Publisher, pois são subworkflows.
- Ative a IA, pois todo Bootstrap depende dela.
- Mantenha Bootstrap inativo e execute-o manualmente.
- Ative Maintenance somente depois de validar o Bootstrap.
- Confirme o fuso `America/Sao_Paulo` e o Schedule das 23:50.

## 7. Primeiro projeto

1. Configure `projectSlug` no Bootstrap.
2. Execute o Bootstrap.
3. Revise `README.md` e `docs/architecture.mmd` no GitHub.
4. Faça uma edição humana em `README.md`.
5. Altere tecnicamente um workflow e execute a Maintenance manualmente.
6. Confirme que os documentos humanos foram preservados.

Leia [Segurança](SECURITY.md) antes de ativar a agenda.
