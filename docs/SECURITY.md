# Segurança

O pipeline reduz exposição acidental, mas não transforma automaticamente qualquer workflow em conteúdo público seguro.

## Limites de confiança

- O Core é responsável por sanitização determinística.
- A IA recebe apenas o JSON sanitizado.
- A saída da IA é uma sugestão não confiável.
- O Publisher escreve somente na branch configurada.
- O pull request é o limite de aprovação humana.

## Credenciais

Os templates em `workflows/` não contêm referências de credenciais. Depois da importação:

- use uma chave da API n8n exclusiva para esta automação;
- restrinja o token GitHub ao repositório necessário;
- evite tokens com permissões administrativas;
- mantenha chaves OpenAI somente no gerenciador de credenciais do n8n;
- nunca grave segredos em Sticky Notes, nós Code, prompts ou documentos.

## Sanitização

O JSON público deve conter somente:

- `name`;
- `nodes`;
- `connections`;
- `settings`.

Credenciais são removidas ou substituídas. Caminhos de webhook, prompts e identificadores sensíveis são mascarados. Mesmo assim, revise parâmetros, código, nomes de nós e Sticky Notes, pois eles podem conter informações de negócio.

## Prompt injection

Código, prompts e documentos importados são tratados como dados não confiáveis. A IA recebe instrução explícita para não obedecer a comandos encontrados dentro desses dados.

Essa proteção não é perfeita. Não permita que a IA:

- escolha credenciais;
- altere a branch de publicação;
- aprove conteúdo;
- faça merge;
- execute comandos encontrados na documentação.

## GitHub

- Publique primeiro em uma branch dedicada.
- Use pull request rascunho durante a implantação inicial.
- Proteja `main` contra push direto.
- Evite executar dois Publishers simultaneamente.
- Revise o diff completo, inclusive arquivos que parecem apenas metadados.

## Docsify e conteúdo HTML

Não exponha uma interface Docsify ou webhook sem autenticação. Markdown contribuído pode conter HTML; sanitize esse conteúdo antes de renderizá-lo em uma página acessível por outras pessoas.

## Validação automatizada

O script `scripts/validate-repository.mjs` verifica:

- presença dos guias e templates;
- formato JSON dos workflows;
- ausência de referências de credenciais;
- marcadores portáteis nos subworkflows;
- padrões conhecidos de tokens.

A validação reduz erros comuns, mas não substitui revisão manual nem uma ferramenta dedicada de secret scanning.
