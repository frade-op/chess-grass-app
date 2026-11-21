# Jardim de Xadrez

Jogo de xadrez feito com Vue, com partidas locais para duas pessoas ou contra Stockfish. Os vasos cinzas representam as peças brancas e jogam primeiro; os vasos marrons representam as pretas.

A interface usa Tailwind CSS. Os componentes visuais ficam em `src/components`, e o estado da partida em `src/composables/useChessGame.js`.

## Executar

Requer Node.js 20.19+ ou 22.12+.

```sh
npm install
npm run dev
```

Abra o endereço exibido no terminal. Use `npm run build` para gerar a versão de produção e `npm test` para verificar as regras.

Selecione uma peça e depois uma casa destacada. O jogo aplica as regras do xadrez, incluindo roque, captura en passant, promoção, xeque e empates. Os botões permitem desfazer lances, começar outra partida e controlar o som.

Para jogar contra a máquina, escolha **Contra Stockfish** e selecione Fácil, Médio ou Difícil. Você joga com os vasos cinzas; a máquina joga com os marrons. O nível altera a profundidade de análise (1, 5 ou 10); no Fácil, a máquina também escolhe um lance legal aleatório em 75% das vezes. A máquina espera pelo menos 1,2 segundo antes de jogar, contando o tempo da consulta. O nível pode ser trocado durante a partida sem reiniciar o tabuleiro. Trocar entre os modos inicia uma nova partida. Esse modo precisa de conexão com a internet e consulta `https://chess-api.com/v1`.

As imagens e os sons fornecidos estão em `public/assets`. Os sons são reproduzidos após movimentos e capturas, sujeitos às permissões de áudio do navegador.

## Créditos

A textura opcional do tabuleiro está desativada, mas mantida em `public/assets/board`. É um recorte de [“wood texture 2”, de Lisa Ann Yount](https://www.flickr.com/photos/136594255@N06/24428362405), publicada sob [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/).
