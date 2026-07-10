# Instalação em outra instância n8n

Este guia instala uma cópia independente do pipeline. Nenhuma credencial ou ID da instância original é distribuído nos templates.

## Pré-requisitos

- Uma instância n8n com acesso à API habilitado.
- Uma chave de API do n8n.
- Um repositório GitHub no qual a documentação será publicada.
- Uma credencial GitHub com permissão de leitura e escrita de conteúdo nesse repositório.
- Uma credencial OpenAI, caso o enriquecimento com IA seja usado.

O projeto foi testado no n8n `2.28.6`.

## 1. Obtenha os templates

Clone o repositório:

```bash
git clone https://github.com/jhvlima/n8n-workflows.git
cd n8n-workflows
```

Os arquivos importáveis estão em `workflows/`:

1. `core-documentation.json`
2. `ai-enrichment.json`
3. `github-publisher.json`

## 2. Importe no n8n

Na interface do n8n, importe os arquivos na ordem acima. Se sua versão oferecer folders, crie um folder como `githubDocs` para agrupar os três workflows.

Os workflows são importados sem credenciais e devem permanecer inativos até a configuração terminar.

## 3. Configure o Core

No workflow `Core - Documentação n8n (Dry Run)`:

1. Abra o nó `Listar workflows`.
2. Crie ou selecione uma credencial `n8n API` da sua própria instância.
3. No nó `Configuração`, mantenha `dryRun` como `true`.
4. Altere `requiredTag` somente se desejar usar outra tag.

A URL da credencial precisa ser alcançável pelo processo do n8n. Em instalações Docker, confirme se a URL escolhida funciona de dentro do container.

## 4. Configure a IA

No workflow `AI - Enriquecimento da Documentação n8n`:

1. Abra `Executar Core determinístico` e selecione o Core recém-importado.
2. Abra `Modelo OpenAI` e selecione sua credencial.
3. Escolha um modelo disponível na sua conta.
4. Mantenha temperatura baixa para reduzir variações na documentação.

O workflow trata o conteúdo dos nós como dados não confiáveis e exige revisão humana na saída.

## 5. Configure o Publisher

No workflow `Publisher - GitHub n8n-workflows`:

1. Em `Executar core determinístico`, selecione o Core importado.
2. Em `Executar enriquecimento com IA`, selecione o workflow de IA importado.
3. Configure a mesma credencial GitHub em `Consultar arquivo existente` e `Criar ou atualizar no GitHub`.
4. Edite as três constantes no início do código de `Expandir arquivos`:

```javascript
const owner = "YOUR_GITHUB_USER";
const repository = "YOUR_REPOSITORY";
const branch = "docs/generated";
```

Crie previamente a branch de documentação a partir da branch principal. Evite publicar diretamente em `main`.

## 6. Selecione os projetos

Adicione a tag `docs-internal` aos workflows que devem ser documentados. Não aplique a tag a workflows com informações que não podem aparecer no repositório, mesmo depois da sanitização.

## 7. Ative e teste

1. Ative o Core.
2. Ative o workflow de IA.
3. Mantenha o Publisher inativo, pois ele possui gatilho manual.
4. Execute manualmente o Core e confirme que `status` é `dry-run`.
5. Execute manualmente a IA e confirme que `status` é `ai-enriched`.
6. Execute o Publisher e confira a branch no GitHub.
7. Abra um pull request e revise todos os documentos.

## Uso sem IA

Para operar somente com documentação determinística:

1. No Publisher, conecte `Executar core determinístico` diretamente a `Expandir arquivos`.
2. Desative ou remova `Executar enriquecimento com IA`.
3. O arquivo `docs/ai-enrichment.md` deixará de ser gerado; os demais continuam funcionando.

## Depois da instalação

- Restrinja as credenciais ao menor escopo possível.
- Execute primeiro em um repositório privado e uma branch descartável.
- Não ative interfaces Docsify ou webhooks sem autenticação.
- Leia o [guia de segurança](SECURITY.md) antes de usar em produção.
