# MVP
## Papel no projeto
O workflow MVP é o componente central do projeto Agente Mej, responsável por toda a lógica de processamento e resposta às mensagens recebidas via Telegram.
## Gatilhos e entradas
O gatilho principal é o recebimento de mensagens através do Telegram. As entradas incluem mensagens de texto e, potencialmente, arquivos de áudio.
## Etapas principais
1. Recebimento de mensagem do Telegram.
2. Verificação se a mensagem contém um arquivo de áudio.
3. Processamento da mensagem utilizando modelos de linguagem e ferramentas de IA.
4. Armazenamento e recuperação de informações relevantes.
5. Envio de resposta através do Telegram.
## Integrações e credenciais
- Telegram para recebimento e envio de mensagens.
- Google Gemini e OpenAI para processamento de linguagem natural.
- Supabase para armazenamento de dados.
## Dependências
Não há dependências externas além das integrações mencionadas.
## Saídas
As saídas são respostas processadas que são enviadas de volta ao chat do Telegram.
## Tratamento de erros
Gestão de erros relacionados à falha nos serviços externos e erros de processamento de IA.
## Limitações e pontos de confirmação
- Detalhes específicos sobre a configuração e uso das APIs de terceiros.
- Políticas de segurança e privacidade aplicadas ao projeto.
