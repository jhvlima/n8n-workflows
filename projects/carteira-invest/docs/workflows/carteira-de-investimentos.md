# Carteira de Investimentos

[Voltar para a documentação do projeto](../../README.md)

## Papel no projeto

É o workflow que importa movimentações financeiras do Google Drive, separa registros de movimentações e renda passiva, atualiza planilhas e arquiva o arquivo processado.

## Gatilhos e entradas

- `Google Drive Trigger`: inicia a execução quando ocorre o evento configurado no Drive.
- A entrada esperada é um arquivo de movimentações disponível no Google Drive.
- O formato exato do arquivo e a pasta monitorada foram sanitizados e precisam de confirmação.

## Etapas principais

1. O trigger inicia três ramos para consultar movimentações arquivadas, listar arquivos novos e consultar renda passiva já arquivada.
2. `Download file` baixa o arquivo e `get movimentação` extrai seus registros.
3. `get movimentação novas` combina os registros recebidos com as movimentações já arquivadas.
4. Os registros são ordenados e adicionados à planilha de Movimentações.
5. `get Renda Passiva novas` combina os dados, `filtra recebimentos` seleciona os recebimentos e os ordena.
6. Os recebimentos são adicionados à planilha de Renda Passiva.
7. Após atualizar Movimentações, `Arquiva Movimentações` move ou arquiva o arquivo no Google Drive.

## Integrações e credenciais

- Google Drive: credencial com leitura, download, monitoramento e arquivamento dos arquivos envolvidos.
- Google Sheets: credencial com leitura e escrita nas planilhas de Movimentações e Renda Passiva.

Os IDs, caminhos e valores das credenciais foram sanitizados.

## Dependências

Não foram identificadas chamadas a subworkflows ou tools de agente. O processamento depende das APIs do Google Drive e Google Sheets e do formato dos arquivos de entrada.

## Saídas

- Novas linhas na planilha de Movimentações.
- Novas linhas de recebimentos na planilha de Renda Passiva.
- Arquivo processado encaminhado para o estado ou pasta de arquivamento configurado no Drive.

## Tratamento de erros

Nenhum ramo explícito de erro foi identificado. O comportamento diante de arquivo inválido, falha de extração, duplicidade ou indisponibilidade das APIs precisa de confirmação.

## Limitações e pontos de confirmação

- Confirmar formato, colunas e codificação do arquivo de entrada.
- Confirmar a regra usada pelos Merge nodes para identificar registros novos.
- Confirmar se a escrita parcial pode ocorrer antes de uma falha no arquivamento.
- Definir retentativas, alertas e procedimento de reprocessamento seguro.
