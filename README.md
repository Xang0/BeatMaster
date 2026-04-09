# Beat Master: Produtor Incremental

Um jogo estilo clicker (incremental) construído inteiramente com HTML, CSS e JavaScript puro (Vanilla JS), focado na jornada de um produtor musical independente. O objetivo é alcançar 1 Milhão de Streams e assinar com uma grande gravadora, gerenciando seus ganhos e os custos operacionais do estúdio.

## Funcionalidades

- Mecânica de Clique: Clique no disco de vinil para compor e gerar "Streams" iniciais.
- Upgrades Passivos: Compre equipamentos de estúdio, contrate músicos e pague por marketing para gerar Streams automaticamente por segundo.
- Desafio Econômico: Gerencie o seu saldo com cuidado. Equipamentos e contratos avançados possuem custos operacionais fixos. Se o seu fluxo de caixa ficar negativo e seu saldo zerar, é o fim da linha (falência)!
- Persistência de Dados: O progresso do seu estúdio (pontuação e inventário) é salvo automaticamente no seu navegador via localStorage.
- Efeitos Sonoros: Feedback de áudio integrado para interações de clique e confirmação de compras na loja.

## Como Executar o Projeto localmente

Como o jogo não possui dependências externas, bibliotecas de terceiros ou necessidade de um servidor backend, rodá-lo na sua máquina é muito simples:

1. Faça o clone deste repositório ou baixe os arquivos fonte.
2. Certifique-se de que a estrutura base contém os arquivos index.html, style.css e app.js (ou organize-os em pastas como css/ e js/ se preferir).
3. Dê um clique duplo e abra o arquivo index.html diretamente em qualquer navegador web moderno.

## Como Jogar

1. Ao carregar a página, clique no botão "INICIAR CARREIRA MUSICAL" na tela inicial para confirmar a entrada e permitir a ativação de áudio.
2. Clique repetidamente no disco de vinil no centro da tela para ganhar seus primeiros fãs/streams.
3. Com o saldo acumulado, compre as melhorias disponíveis no painel à direita ("Loja de Equipamentos").
4. Fique de olho na sua taxa de Geração Líquida (+/- Streams por segundo) para não falir.
5. Alcance a marca de 1.000.000 de Streams para vencer o jogo.

## Licença

Este projeto é de código aberto e está licenciado sob a Licença MIT. Para que o GitHub e outros desenvolvedores identifiquem essa licença automaticamente, certifique-se de incluir o texto completo da licença em um arquivo chamado LICENSE ou LICENSE.txt diretamente na pasta raiz do repositório.