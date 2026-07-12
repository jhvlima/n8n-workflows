# Bootstrap e Maintenance

## Bootstrap

O Bootstrap é executado uma vez por projeto, a partir do formulário:

1. O formulário consulta o Core e apresenta os projetos encontrados.
2. O usuário autenticado escolhe um `projectSlug`.
3. O Bootstrap valida que `project.json` ainda não existe.
4. Chama o Core filtrando `projectSlug`.
5. Executa a IA para gerar `README.md` e `docs/architecture.mmd`.
6. Publica os dois documentos e os arquivos técnicos.
7. Grava `project.json` por último com `bootstrapCompleted: true`.

Depois disso, `README.md` e `docs/` não pertencem mais à automação diária.

## Maintenance

A Maintenance roda diariamente às 23:50:

1. Core lista e agrupa todos os projetos.
2. Para cada projeto, consulta `project.json` no GitHub.
3. Compara o hash remoto ao hash calculado.
4. Hash igual: registra `skipped`.
5. Hash diferente: prepara somente arquivos técnicos.
6. Publisher sincroniza `workflows/` e grava `project.json` por último.

A Maintenance nunca chama IA e nunca altera `README.md` ou `docs/`.

## Versão

`currentVersion` usa calendário no formato `YYYY.MM.DD.N`. O contador aumenta quando o mesmo projeto recebe outra mudança no mesmo dia.

O Git continua sendo o histórico completo. O manifesto registra também `previousFunctionalHash` para facilitar auditoria.

## Recuperação

- Projeto sem Bootstrap: selecioná-lo no formulário.
- Publicação parcial sem `project.json`: repetir Bootstrap.
- Falha parcial de Maintenance: repetir a Maintenance; arquivos idênticos serão ignorados.
- Rebootstrap intencional: revisar a documentação humana e habilitar `forceBootstrap` apenas durante a execução controlada.
