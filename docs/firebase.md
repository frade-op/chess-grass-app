# Partidas online com Firebase

O modo online usa Firebase Authentication anônimo e Realtime Database. O site continua estático: os navegadores sincronizam as partidas diretamente com o Firebase. As regras do banco precisam ser publicadas antes de usar o modo online.

## Preparar o Firebase

1. Abra o [console do Firebase](https://console.firebase.google.com/) e crie ou selecione um projeto. Prefira um projeto dedicado, para não afetar outros aplicativos.
2. Na visão geral do projeto, registre um aplicativo **Web** (`</>`). Firebase Hosting é opcional.
3. Copie a configuração web em **Configurações do projeto > Geral > Seus aplicativos**.
4. Em **Realtime Database**, crie um banco na região desejada. Escolha o **modo bloqueado**, não o modo de teste. Copie a URL mostrada na página de dados; ela é diferente da URL do console.
5. Em **Authentication > Sign-in method**, habilite o provedor **Anônimo**.
6. Confira o plano, os [preços e limites](https://firebase.google.com/pricing) e o uso do projeto. Se houver faturamento, considere [alertas de orçamento](https://firebase.google.com/docs/projects/billing/budget-alerts); eles não são limites automáticos de gastos.

A chave de API web Firebase identifica o projeto; a segurança depende das regras e da autenticação. Nunca coloque chaves de conta de serviço, segredos de banco ou credenciais de administrador no aplicativo. Consulte as [orientações sobre chaves do Firebase](https://firebase.google.com/docs/projects/api-keys).

## Configurar este projeto

O arquivo `.env.local` deste ambiente já contém a configuração fornecida para desenvolvimento. Ele é ignorado pelo Git. Em outro ambiente, crie `.env.local` a partir de `.env.example` e preencha:

```text
VITE_FIREBASE_API_KEY=<apiKey>
VITE_FIREBASE_AUTH_DOMAIN=<authDomain>
VITE_FIREBASE_PROJECT_ID=<projectId>
VITE_FIREBASE_APP_ID=<appId>
VITE_FIREBASE_DATABASE_URL=<URL do Realtime Database>
```

Reinicie `npm run dev` após alterar essas variáveis. A configuração web é incorporada ao código distribuído pelo Vite; não use valores secretos em variáveis `VITE_`. Em uma hospedagem com build automatizado, configure essas variáveis no ambiente de build. Para um build local, `npm run build` lê `.env.local`.

## Publicar as regras

As regras em [`database.rules.json`](../database.rules.json) restringem a leitura de salas, a entrada dos jogadores, a ordem dos turnos e o acréscimo ao histórico. Elas não validam a legalidade de movimentos de xadrez no servidor.

1. No Firebase Console, confirme que está no projeto e banco corretos.
2. Abra **Realtime Database > Regras**.
3. Para um banco dedicado ao Jardim de Xadrez, revise e copie todo o conteúdo de [`database.rules.json`](../database.rules.json) para o editor.
4. Clique em **Publicar**.

**A publicação substitui as regras atuais do banco.** Se ele já for usado por outros aplicativos, não substitua as regras diretamente: integre e teste as regras existentes antes. Para suspender o acesso de clientes em um banco dedicado, publique novamente regras que neguem leitura e gravação. Isso não apaga as partidas.

As regras foram testadas no emulador local, mas não são publicadas automaticamente. Depois da publicação, teste com dois navegadores ou dispositivos independentes.

## Jogar

1. Abra o site, selecione **Jogar online** e clique em **Criar sala**.
2. Compartilhe o link de convite com outra pessoa. O criador joga com os vasos cinzas; quem entra joga com os marrons.
3. A partida começa quando os dois ocupam a sala. Cada pessoa pode mover apenas na própria vez. Não há opção de desfazer ou reiniciar a partida online; para outra partida, troque de modo e crie outra sala.
4. Se a conexão cair, aguarde a reconexão. Reabrir o link no mesmo navegador permite retomar a partida enquanto a identidade anônima estiver disponível.

Compartilhe o link somente com o convidado: quem possui o link pode entrar na vaga disponível. Uma sala cheia só pode ser lida pelos dois participantes. Duas abas do mesmo navegador geralmente compartilham a identidade e não representam dois jogadores. Limpar os dados do navegador ou mudar de dispositivo pode impedir a recuperação da vaga.

Links com `localhost` ou `127.0.0.1` não acessam o computador do criador a partir do dispositivo do convidado. Para jogar entre dispositivos, publique o site em um endereço acessível aos dois.

As salas e os históricos ficam no banco e **não expiram automaticamente**. Monitore o armazenamento e remova apenas os dados que quiser excluir, pelo console, após avaliar o impacto nas partidas. O modo online envia ao Firebase as identidades anônimas e os lances; compartilhe essa informação com os jogadores.

## Testes locais

Execute `npm test` para os testes do aplicativo. Para testar as regras no emulador, instale Java e execute:

```sh
npm run test:firebase
```

O comando usa o projeto de demonstração `demo-chess-grass` e não altera o banco de produção. Para testar a interface com os emuladores de autenticação e banco, inicie-os com:

```sh
npx firebase emulators:start --project demo-chess-grass --only auth,database
```

Em outro terminal PowerShell, inicie o Vite com os valores de demonstração abaixo. As variáveis desse terminal substituem `.env.local`:

```powershell
$env:VITE_FIREBASE_USE_EMULATORS = 'true'
$env:VITE_FIREBASE_API_KEY = 'demo-key'
$env:VITE_FIREBASE_AUTH_DOMAIN = 'demo-chess-grass.firebaseapp.com'
$env:VITE_FIREBASE_PROJECT_ID = 'demo-chess-grass'
$env:VITE_FIREBASE_APP_ID = 'demo-app'
$env:VITE_FIREBASE_DATABASE_URL = 'http://127.0.0.1:9000?ns=demo-chess-grass'
npm run dev
```

O aplicativo conecta os emuladores apenas no modo de desenvolvimento. Use terminais separados para testes de produção e de demonstração. Não use a configuração de produção para testes que criem dados reais.

## Limitações de segurança

Os navegadores validam lances com `chess.js`, mas um participante pode modificar seu cliente. As regras verificam participantes, turno e formato do histórico, não as regras completas do xadrez. Um jogador malicioso pode registrar um lance inválido e interromper a sala. Para partidas competitivas, é necessária validação confiável no servidor.

Avalie [Firebase App Check](https://firebase.google.com/docs/app-check/web), as restrições de API e a política de segurança do site antes de publicar. App Check não substitui autenticação, regras ou monitoramento de abuso.

## Referências

- [Configurar o Firebase para a Web](https://firebase.google.com/docs/web/setup)
- [Criar um Realtime Database](https://firebase.google.com/docs/database/web/start)
- [Regras de segurança do Realtime Database](https://firebase.google.com/docs/database/security)
- [Autenticação anônima na Web](https://firebase.google.com/docs/auth/web/anonymous-auth)
