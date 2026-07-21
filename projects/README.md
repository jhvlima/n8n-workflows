# Projetos documentados

<!-- n8n-docs:pr-review:start -->

<a id="pr-review"></a>

## Roteiro de revisão dos PRs de documentação n8n

### Objetivo

Orientar quem completa, revisa e aprova a documentação gerada pelo Bootstrap antes do merge.

### Estrutura que deve ser revisada

- `projects/<slug>/README.md`: visão geral e links.
- `projects/<slug>/docs/TECHNICAL.md`: arquitetura e operação.
- `projects/<slug>/docs/INTERNAL.md`: dados humanos e organizacionais.
- `projects/<slug>/docs/workflows/`: detalhes de cada workflow.

### Dados humanos obrigatórios

- [ ] Nome e tipo do projeto.
- [ ] Data de início e término ou status atual.
- [ ] Responsáveis e seus papéis.
- [ ] Cliente, empresa ou confirmação de que não se aplica.
- [ ] Relacionamento, prazos, frequência de respostas e pedidos fora do escopo.
- [ ] Escopo, decisões, riscos e pendências internas.

### Validação técnica

- [ ] Arquitetura e dependências correspondem aos workflows reais.
- [ ] Gatilhos, entradas, integrações, dados, saídas e erros estão corretos.
- [ ] O Mermaid renderiza no GitHub.
- [ ] Cada workflow do `project.json` possui documento individual.

### Segurança

- [ ] Não existem tokens, senhas, IDs privados ou URLs internas.
- [ ] Credenciais são citadas somente por tipo.
- [ ] Dados pessoais e empresariais estão adequados à visibilidade do repositório.

### Como preparar o PR

1. Substitua `Precisa de confirmação` por informação validada ou por `Não se aplica`.
2. Faça as correções na mesma branch do PR.
3. Revise o diff completo e confirme que arquivos humanos não foram removidos indevidamente.
4. Marque o PR como pronto para revisão e solicite o aprovador responsável.

### Critérios para aprovação

- [ ] Todos os dados obrigatórios foram preenchidos.
- [ ] Documento técnico validado por quem conhece a automação.
- [ ] Documento interno validado por quem conhece o projeto ou cliente.
- [ ] Verificação de segurança concluída.
- [ ] Links e Mermaid renderizam corretamente.

### Como finalizar

Aprove o PR conforme a política da equipe e prefira **Squash and merge** para consolidar os commits automáticos e humanos. Depois do merge, a Maintenance altera somente workflows sanitizados e `project.json`.

<!-- n8n-docs:pr-review:end -->
