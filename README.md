# Jardim de Xadrez

Jogo de xadrez local para duas pessoas, feito com Vue. Os vasos marrons jogam primeiro; os vasos amarelos jogam em seguida.

A interface usa Tailwind CSS. Os componentes visuais ficam em `src/components`, e o estado da partida em `src/composables/useChessGame.js`.

## Executar

Requer Node.js 20.19+ ou 22.12+.

```sh
npm install
npm run dev
```

Abra o endereço exibido no terminal. Use `npm run build` para gerar a versão de produção e `npm test` para verificar as regras.

Selecione uma peça e depois uma casa destacada. O jogo aplica as regras do xadrez, incluindo roque, captura en passant, promoção, xeque e empates. Os botões permitem desfazer o último lance, começar outra partida e controlar o som.

As imagens e os sons fornecidos estão em `public/assets`. Os sons são reproduzidos após movimentos e capturas, sujeitos às permissões de áudio do navegador.

## Créditos

A textura opcional do tabuleiro está desativada, mas mantida em `public/assets/board`. É um recorte de [“wood texture 2”, de Lisa Ann Yount](https://www.flickr.com/photos/136594255@N06/24428362405), publicada sob [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/).
