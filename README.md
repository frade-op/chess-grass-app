# Jardim de Xadrez

Jogo de xadrez feito com Vue, com partidas locais, online por convite ou contra Stockfish. Os vasos cinzas representam as peças brancas e jogam primeiro; os vasos marrons representam as pretas.

A interface usa Tailwind CSS. Os componentes visuais ficam em `src/components`, e o estado da partida em `src/composables/useChessGame.js`.

## Executar

Requer Node.js 20.19+ ou 22.12+.

```sh
npm install
npm run dev
```

Abra o endereço exibido no terminal. Use `npm run build` para gerar a versão de produção e `npm test` para verificar as regras.

Selecione uma peça e depois uma casa destacada. O jogo aplica as regras do xadrez, incluindo roque, captura en passant, promoção, xeque e empates. Os botões permitem desfazer lances, começar outra partida e controlar o som. Use **Escala do tabuleiro** para ajustar seu tamanho de 75% a 100% da largura disponível; a escala volta a 100% ao recarregar a página.

Para jogar contra a máquina, escolha **Contra Stockfish** e selecione Fácil, Médio ou Difícil. Você joga com os vasos cinzas; a máquina joga com os marrons. O Stockfish 19 Lite roda em um Web Worker no navegador, sem consultar uma API. O nível limita a profundidade de análise a 1, 4 ou 10, com até 50 ms de busca; a profundidade atingida e a força do jogo dependem do dispositivo. No Fácil, a máquina também escolhe um lance legal aleatório em 75% das vezes. A máquina espera pelo menos 1,2 segundo antes de jogar, contando o carregamento e a busca. O nível pode ser trocado durante a partida sem reiniciar o tabuleiro. Trocar entre os modos inicia uma nova partida.

O navegador precisa suportar Web Workers e WebAssembly. O motor é baixado do próprio site ao iniciar uma busca; isso exige acesso aos arquivos publicados, mas não à API externa. Após o carregamento, a partida não envia posições a terceiros.

Para jogar online, selecione **Jogar online**, crie uma sala e compartilhe o convite. O Firebase precisa estar configurado e as regras do banco publicadas; consulte o [guia de configuração e segurança](docs/firebase.md). Não é possível desfazer ou reiniciar lances online. As salas não expiram automaticamente.

As imagens e os sons fornecidos estão em `public/assets`. Os sons são reproduzidos após movimentos e capturas, sujeitos às permissões de áudio do navegador.

## Publicação

Execute `npm ci`, `npm test` e `npm run build`. Publique o conteúdo de `dist` no diretório desejado do site estático; não publique `node_modules`. A configuração do Vite usa caminhos relativos, permitindo servir o jogo tanto na raiz quanto em um subdiretório, incluindo um repositório do GitHub Pages. Acesse o diretório publicado pela URL terminada em `/` ou em `index.html`. Para verificar a versão gerada localmente, use `npm run preview`.

O documento inclui título e descrição para mecanismos de busca. Depois de escolher o endereço público definitivo, configure nesse site a URL canônica e o sitemap, se necessários, e confira se suas regras de indexação permitem acessar a página. Este projeto não define um domínio ou workflow de publicação, pois eles dependem do repositório e da hospedagem de destino. Sirva os arquivos `.wasm` com o tipo `application/wasm`; o site deve permitir Web Workers e WebAssembly em sua política de segurança.

## Próximos passos

As ideias para o futuro são aprimorar as partidas online, criar uma nova variante de xadrez envolvendo plantas e, possivelmente, desenvolver um aplicativo para celular.

## Créditos

O motor [Stockfish.js 19.0.1](https://github.com/nmrugg/stockfish.js/tree/v19.0.1), baseado em Stockfish, é distribuído sob [GPL-3.0](https://github.com/nmrugg/stockfish.js/blob/v19.0.1/Copying.txt). A interface disponibiliza a licença e o link para o código-fonte dessa versão. Antes de redistribuir o projeto ou o motor, confira a compatibilidade das licenças e cumpra as condições da GPL, incluindo a disponibilização do código-fonte correspondente.

A textura opcional do tabuleiro está desativada, mas mantida em `public/assets/board`. É um recorte de [“wood texture 2”, de Lisa Ann Yount](https://www.flickr.com/photos/136594255@N06/24428362405), publicada sob [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/).

Projeto de [Felipe no LinkedIn](https://www.linkedin.com/in/frade-op/) e [GitHub](https://github.com/frade-op).
