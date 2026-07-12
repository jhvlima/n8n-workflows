# Agente Mej

## Visão Geral
O projeto Agente Mej consiste em um workflow automatizado que utiliza inteligência artificial para interagir com mensagens de chat, especificamente através do Telegram. O sistema é capaz de identificar mensagens, processar conteúdo e responder de forma inteligente.

## Componentes
O projeto inclui um workflow principal chamado MVP, que contém diversos nós responsáveis pela lógica de processamento e resposta.

## Fluxo Principal
1. Recebimento de mensagem do Telegram.
2. Verificação se a mensagem contém um arquivo de áudio.
3. Processamento da mensagem utilizando modelos de linguagem e ferramentas de IA.
4. Armazenamento e recuperação de informações relevantes.
5. Envio de resposta através do Telegram.

## Entradas e Saídas
- **Entrada:** Mensagens de chat do Telegram.
- **Saída:** Respostas processadas enviadas de volta ao chat do Telegram.

## Integrações
- Telegram para recebimento e envio de mensagens.
- Google Gemini e OpenAI para processamento de linguagem natural.
- Supabase para armazenamento de dados.

## Operação
O workflow é ativado por eventos de mensagens recebidas no Telegram e processa as informações conforme configurado nos nós do workflow.

## Riscos
- Dependência de serviços externos como Telegram e APIs de IA.
- Gestão de privacidade e segurança das informações processadas.

## Pontos que Precisam de Confirmação
- Detalhes específicos sobre a configuração e uso das APIs de terceiros.
- Políticas de segurança e privacidade aplicadas ao projeto.
