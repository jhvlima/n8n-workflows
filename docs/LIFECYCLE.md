# Bootstrap e Maintenance

## Bootstrap

O Bootstrap é executado uma vez por projeto:

1. Valida que `project.json` ainda não existe.
2. Chama o Core filtrando `projectSlug`.
3. Executa IA conforme `aiMode`.
4. Publica arquivos humanos e técnicos.
5. Grava `project.json` por último com `bootstrapCompleted: true`.

Depois disso, `README.md` e `docs/` não pertencem mais à automação diária.

## Maintenance

A Maintenance roda diariamente às 23:50:

1. Core lista e agrupa todos os projetos.
2. Para cada projeto, consulta `project.json` no GitHub.
3. Compara o hash remoto ao hash calculado.
4. Hash igual: registra `skipped`.
5. Hash diferente: prepara somente arquivos técnicos.
6. `aiMode: on-change`: produz análise em `generated/`.
7. Publisher sincroniza os arquivos e grava `project.json` por último.

## Versão

`currentVersion` usa calendário no formato `YYYY.MM.DD.N`. O contador aumenta quando o mesmo projeto recebe outra mudança no mesmo dia.

O Git continua sendo o histórico completo. O manifesto registra também `previousFunctionalHash` para facilitar auditoria.

## Recuperação

- Projeto sem Bootstrap: executar Bootstrap manualmente.
- Publicação parcial sem `project.json`: repetir Bootstrap.
- Falha parcial de Maintenance: repetir a Maintenance; arquivos idênticos serão ignorados.
- Rebootstrap intencional: revisar a documentação humana e habilitar `forceBootstrap` apenas durante a execução controlada.
