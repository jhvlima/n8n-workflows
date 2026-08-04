# Inputs e credenciais dos workflows

Para instalação e uso de projetos novos ou já em produção, comece pelo [README principal](../../README.md).

Para consultar o significado, as opções e o efeito de cada valor dos Edit Fields, use o [dicionário central de configurações](../CONFIGURATION.md#dicionário-de-campos).

Cada workflow possui um guia próprio com os campos livres, os valores controlados, as credenciais e um exemplo. As mesmas informações resumidas aparecem em um Sticky Note dentro do respectivo template.

| Workflow | Guia | Entrada |
| --- | --- | --- |
| Core | [core.md](core.md) | Manual ou subworkflow |
| Notion | [notion-project-context.md](notion-project-context.md) | Somente Bootstrap, com URL opcional |
| IA | [ai-enrichment.md](ai-enrichment.md) | Somente payload do Core/Bootstrap |
| Publisher | [github-publisher.md](github-publisher.md) | Somente payload de outro workflow |
| Bootstrap | [bootstrap.md](bootstrap.md) | Somente Formulário/subworkflow |
| Formulário | [bootstrap-form.md](bootstrap-form.md) | Usuário autenticado |
| Maintenance | [daily-maintenance.md](daily-maintenance.md) | Schedule ou execução manual |

## Convenções

- **Livre**: o administrador pode escolher o valor, respeitando formato e permissões descritos.
- **Controlado**: escolha apenas um dos valores enumerados.
- **Fixo**: não altere; o valor faz parte do contrato entre os workflows.
- Valores administrativos como `owner`, `repository`, `branch` e tags são definidos em nodes Edit Fields, nunca no formulário público.
- Os templates não contêm credenciais nem IDs reais de subworkflows. Após importar, selecione ambos na interface do n8n.

O comportamento oficial é: IA obrigatória no Bootstrap e nenhuma IA na Maintenance.
