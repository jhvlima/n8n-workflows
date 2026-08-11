# Versionamento, falhas e recuperação

O fluxo normal do Bootstrap e os passos para projetos novos ou em produção estão no [README](../README.md).

## Versionamento

`currentVersion` usa `YYYY.MM.DD.N`. O contador aumenta quando o mesmo projeto recebe outra publicação no mesmo dia. O Git mantém o histórico completo, enquanto `project.json` registra o hash atual e o anterior.

`project.json` e os demais arquivos da execução são gravados no mesmo commit. Sua presença com `bootstrapCompleted: true` indica que a publicação inicial foi concluída.

## Idempotência

- Conteúdo idêntico não é publicado novamente.
- Hash funcional igual faz a Maintenance registrar `skipped`.
- Cada chamada do Publisher cria no máximo um commit atômico.
- A referência da branch é atualizada sem force para não sobrescrever alterações concorrentes.
- A Maintenance nunca inclui `README.md` ou `docs/**` no payload.
- A Maintenance preserva `documentationLayout` e `documentationSchemaVersion` no `project.json`.
- A Maintenance preserva `contextSources` sem reler o Notion nem alterar documentos humanos.

## Recuperação

| Situação | Ação |
| --- | --- |
| Core falhou | Corrigir tags/API e repetir; nada foi publicado |
| Notion não foi informado | Nenhuma ação; o Bootstrap continua sem contexto de reuniões |
| Notion foi informado e falhou | Corrigir credencial/permissão/link e repetir; a IA e o Publisher ainda não foram executados |
| IA falhou | Corrigir modelo/credencial e repetir o Bootstrap |
| Publisher falhou antes de mover a branch | Repetir o Bootstrap; nenhum estado parcial ficou visível |
| Projeto sem Bootstrap na Maintenance | Executar pelo Formulário; a Maintenance registra `needs-bootstrap` |
| Maintenance falhou no Publisher | Repetir; a branch anterior foi preservada e conteúdo idêntico não cria commit |
| `project.json` já existe | Não executar Bootstrap normal; o projeto já está registrado |

## Rebootstrap excepcional

Ao selecionar no formulário um projeto que já está publicado, o payload usa `forceBootstrap=true`. O Bootstrap lê `README.md`, `docs/TECHNICAL.md` e `docs/INTERNAL.md`, sanitiza padrões sensíveis e pede à IA que preserve e reorganize os fatos no arquivo correto. Um README legado que ainda misture as duas camadas também é aceito como contexto de migração. Depois, o fluxo regenera e sobrescreve os documentos humanos. A preservação é semântica, não uma mesclagem determinística. Antes de usá-lo:

1. salve ou revise as edições humanas existentes;
2. execute em uma branch dedicada;
3. compare todo o diff;
4. confirme que a execução foi iniciada por um usuário autorizado.

Se uma página do Notion for informada no rebootstrap, as reuniões atuais entram como evidência adicional principalmente para `docs/INTERNAL.md`. Elas não são armazenadas no GitHub e não substituem a precedência técnica do snapshot dos workflows.

Se uma informação anterior conflitar com o snapshot técnico atual, o estado comprovado pelos workflows descreve a situação corrente e a divergência deve permanecer em `Pontos que precisam de confirmação`. Arquivos antigos que deixaram de ser gerados não são removidos pelo Publisher.

## Melhorias futuras

### Completar a arquitetura do projeto pela Maintenance

Uma evolução possível é permitir que a Maintenance complete uma única vez o diagrama geral de projetos cujo README ainda não possua Mermaid. A automação poderá:

1. consultar no `project.json` se a arquitetura já foi registrada;
2. quando ainda não estiver registrada, verificar o `README.md` do projeto;
3. marcar no manifesto um diagrama já existente, evitando novas consultas enquanto a arquitetura funcional permanecer igual;
4. se o diagrama não existir, procurar uma descrição de componentes explicitamente revisada por uma pessoa;
5. gerar somente o Mermaid a partir dessa descrição e do snapshot sanitizado;
6. inserir apenas uma seção delimitada no README e atualizar o `project.json` no mesmo commit atômico.

Essa melhoria não faz parte do comportamento atual. Até que seja implementada, a Maintenance continua alterando somente `workflows/**` e `project.json`; diagramas posteriores ao Bootstrap devem ser atualizados manualmente ou por rebootstrap controlado. Uma implementação futura deverá preservar integralmente o restante do README, validar o Mermaid e reabrir a revisão quando o `functionalHash` indicar mudança estrutural.
