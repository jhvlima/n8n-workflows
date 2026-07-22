# Segurança

O pipeline reduz exposição acidental, mas não torna qualquer workflow seguro para publicação.

## Limites de confiança

- Core sanitiza deterministicamente.
- IA recebe somente snapshots sanitizados.
- Saída da IA é sugestão com revisão obrigatória.
- Publisher escreve somente na branch configurada.
- Pull request é o limite de aprovação.

## Credenciais

Os templates não contêm referências de credenciais. Depois da importação:

- use uma chave n8n dedicada;
- restrinja o token GitHub ao repositório necessário;
- mantenha a chave OpenAI no gerenciador de credenciais;
- não grave segredos em tags, Sticky Notes, código ou documentos.

## Bootstrap

`forceBootstrap` deve permanecer falso na configuração administrativa. Ao selecionar explicitamente um projeto já publicado, o formulário envia `true` somente naquela execução. O processo lê README, documento técnico e documento interno anteriores, mascara padrões sensíveis antes da IA e sobrescreve os documentos humanos. A sanitização reduz risco, mas não substitui a revisão do diff.

O `project.json` é publicado no mesmo commit atômico que os demais arquivos, evitando marcar um Bootstrap parcial como concluído.

O formulário de Bootstrap exige autenticação, aceita somente slugs descobertos pelo Core e não permite enviar diretamente `forceBootstrap`, repositório ou branch.

### Documento interno

`projects/<slug>/docs/INTERNAL.md` pode conter cliente, responsáveis, dinâmica de relacionamento e decisões empresariais. A separação em arquivo próprio não altera a visibilidade do GitHub. Prefira repositório privado; para publicação externa, use outro destino ou remova explicitamente o conteúdo interno.

## Maintenance

A Maintenance compara `functionalHash` antes de chamar o Publisher. Ela publica somente:

- `workflows/**`;
- `project.json`.

Arquivos humanos ficam fora do payload diário.

## Prompt injection

Nomes, código, prompts, Sticky Notes e documentos são conteúdo não confiável. Não permita que a IA escolha credenciais, branch, aprovação, merge ou comandos a executar.

## GitHub

- Use branch dedicada.
- Proteja `main` contra push direto.
- Evite execuções concorrentes; se a branch avançar, o Publisher usa `force=false` e falha sem sobrescrever o novo estado.
- Revise o diff completo.
- Prefira repositórios privados para documentação interna.

## Validação automatizada

`scripts/validate-repository.mjs` verifica arquivos obrigatórios, JSON dos templates, placeholders, ausência de credenciais e formatos conhecidos de tokens. Isso não substitui revisão manual nem scanner dedicado.
