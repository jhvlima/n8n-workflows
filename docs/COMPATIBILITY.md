# Compatibilidade com versões do n8n

Os templates são distribuídos em duas variantes. Escolha uma delas conforme a versão da instância e não misture arquivos entre as pastas.

| Versão n8n | Pasta | Situação |
| --- | --- | --- |
| `2.28.6` | [`workflows/n8n-2.28.6/`](../workflows/n8n-2.28.6/) | Variante principal |
| `1.121.2` | [`workflows/n8n-1.121.2/`](../workflows/n8n-1.121.2/) | Variante de compatibilidade gerada e validada separadamente |

## Diferenças da variante 1.121.2

O n8n `1.121.2` não reconhece algumas versões de nodes exportadas pelo n8n 2 e exige campos adicionais no JSON do workflow.

| Item | n8n 2.28.6 | n8n 1.121.2 |
| --- | --- | --- |
| Execute Workflow Trigger | `1.2` | `1.1` |
| Form Trigger | `2.6` | `2.3` |
| Form | `2.5` | `2.3` |
| Google Gemini Chat Model | `1.1` | `1` |
| Autenticação do formulário | `n8n User Auth` | `HTTP Basic Auth` |
| Campos de topo | JSON portátil mínimo | Inclui `active: false` e `versionId` |

`includeUserInOutput` é removido do Form Trigger porque não existe no n8n `1.121.2`. Nenhum código do pipeline depende desse campo.

## Instalação no n8n 1.121.2

1. Importe somente os sete JSONs de [`workflows/n8n-1.121.2/`](../workflows/n8n-1.121.2/).
2. No Form Trigger, crie e selecione uma credencial `HTTP Basic Auth`.
3. Configure as demais credenciais normalmente.
4. Selecione novamente os subworkflows nos nodes `Execute Workflow`.
5. Revise os Edit Fields e ative os workflows depois do teste manual.

Os templates são importados inativos deliberadamente.

## O que foi validado

- importação estrutural dos sete workflows em container oficial `n8nio/n8n:1.121.2`;
- presença de todos os tipos de nodes utilizados;
- compatibilidade das `typeVersion` escolhidas com o catálogo dessa versão;
- suporte dos parâmetros usados pelos nodes Form, Form Trigger e Execute Workflow Trigger;
- execução funcional do Core no n8n 1.121.2 contra uma API n8n real;
- geração determinística da variante a partir dos templates `2.28.6`;
- validação de placeholders, ausência de credenciais e padrões conhecidos de segredos.

O coletor Notion utiliza HTTP Request 4.3 com credencial `notionApi` e AI Agent 2.2 com um Chat Model OpenAI, todos importáveis na variante 1.121.2. A leitura real, a sumarização e o endpoint Markdown dependem das credenciais, das permissões da integração e da versão atual das APIs; valide essa parte com uma página de teste antes do uso em produção.

A validação estrutural não substitui um teste integrado com as credenciais n8n, GitHub e OpenAI do ambiente de trabalho. Antes de ativar a agenda, execute um Bootstrap de teste em branch dedicada e confirme a Maintenance manualmente.

## Sincronização entre variantes

Não edite os arquivos de `n8n-1.121.2` diretamente. Altere a variante principal e execute:

```bash
node scripts/build-versioned-workflows.mjs
node scripts/validate-repository.mjs
```

O gerador aplica somente as diferenças documentadas acima e o validador detecta divergência entre as duas árvores.
