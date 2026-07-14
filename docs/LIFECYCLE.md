# Versionamento, falhas e recuperação

O fluxo normal do Bootstrap e os passos para projetos novos ou em produção estão no [README](../README.md).

## Versionamento

`currentVersion` usa `YYYY.MM.DD.N`. O contador aumenta quando o mesmo projeto recebe outra publicação no mesmo dia. O Git mantém o histórico completo, enquanto `project.json` registra o hash atual e o anterior.

`project.json` é gravado por último. Sua presença com `bootstrapCompleted: true` indica que a publicação inicial foi concluída.

## Idempotência

- Conteúdo idêntico não é publicado novamente.
- Hash funcional igual faz a Maintenance registrar `skipped`.
- A escrita serial reduz conflitos entre arquivos do mesmo projeto.
- A Maintenance nunca inclui `README.md` ou `docs/**` no payload.

## Recuperação

| Situação | Ação |
| --- | --- |
| Core falhou | Corrigir tags/API e repetir; nada foi publicado |
| IA falhou | Corrigir modelo/credencial e repetir o Bootstrap |
| Bootstrap parcial sem `project.json` | Repetir o Bootstrap; arquivos idênticos serão ignorados |
| Projeto sem Bootstrap na Maintenance | Executar pelo Formulário; a Maintenance registra `needs-bootstrap` |
| Maintenance parcial | Repetir; o Publisher ignora arquivos já idênticos |
| `project.json` já existe | Não executar Bootstrap normal; o projeto já está registrado |

## Rebootstrap excepcional

`forceBootstrap=true` pode regenerar e sobrescrever `README.md` e `docs/`. Antes de usá-lo:

1. salve ou revise as edições humanas existentes;
2. execute em uma branch dedicada;
3. compare todo o diff;
4. volte `forceBootstrap` para `false` imediatamente.
