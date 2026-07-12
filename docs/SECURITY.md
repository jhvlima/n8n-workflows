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

`forceBootstrap` deve permanecer falso. Uma segunda inicialização pode sobrescrever `README.md` e `docs/`, que passam a pertencer ao time após o primeiro Bootstrap.

O `project.json` é publicado por último para reduzir o risco de marcar um Bootstrap parcial como concluído.

O formulário de Bootstrap exige autenticação de usuário do n8n, aceita somente slugs descobertos pelo Core e não permite enviar `forceBootstrap`, repositório ou branch.

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
- Evite execuções concorrentes.
- Revise o diff completo.
- Prefira repositórios privados para documentação interna.

## Validação automatizada

`scripts/validate-repository.mjs` verifica arquivos obrigatórios, JSON dos templates, placeholders, ausência de credenciais e formatos conhecidos de tokens. Isso não substitui revisão manual nem scanner dedicado.
