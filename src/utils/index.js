# Capturar a entrada do usuário
escolhaCarteira = input("Escolha uma carteira puzzle (1-161): ")
opcao = input("Escolha uma opção (1 - Começar do início, 2 - Escolher uma porcentagem, 3 - Escolher mínimo, 4 - Dividir em blocos, 5 - Dividir em blocos (Aleatório)): ")

# Adicionar entrada adicional se a opção for 4 ou 5
numBlocos = ""
if opcao in ['4', '5']:
    numBlocos = input("Digite o número de blocos para dividir o intervalo: ")

# Executar o script principal com os argumentos fornecidos
!node /content/BT_project/btc-findersrc/main.js {escolhaCarteira} {opcao} {numBlocos}
