import test from 'node:test'
import assert from 'node:assert/strict'
import { gameFromRoom } from '../src/services/onlineGame.js'
import { useOnlineGame } from '../src/composables/useOnlineGame.js'
import { useChessGame } from '../src/composables/useChessGame.js'

const initialRoom = { host: 'host', guest: '', moves: '', lastMove: '', turn: 'w', version: 0 }

test('valida o histórico e a vez da sala', () => {
  assert.equal(gameFromRoom({ ...initialRoom, moves: ' e4 e5', lastMove: 'e5', version: 2 }).history().length, 2)
  assert.throws(() => gameFromRoom({ ...initialRoom, moves: ' e5', lastMove: 'e5', version: 1, turn: 'b' }), /lance inválido/)
  assert.throws(() => gameFromRoom({ ...initialRoom, moves: ' e4', lastMove: 'e4', version: 1 }), /vez da sala/)
})

test('o jogo online aceita lances somente na vez do jogador e sincroniza o tabuleiro', async () => {
  let updateRoom
  let sent
  const service = {
    connect: async () => ({ uid: 'host' }),
    watchConnection: (_session, callback) => { callback(true); return () => {} },
    create: async () => 'a'.repeat(32),
    watchRoom: (_session, _id, callback) => { updateRoom = callback; callback(initialRoom); return () => {} },
    move: async (_session, _id, _room, move) => { sent = move },
  }
  const online = useOnlineGame(service)
  const game = useChessGame(online)
  game.soundEnabled.value = false
  game.setPlayMode('online')
  await online.start()
  game.selectSquare('e2')
  assert.equal(game.selected.value, null)
  updateRoom({ ...initialRoom, guest: 'guest' })
  game.selectSquare('e2')
  game.selectSquare('e4')
  assert.deepEqual(sent, { from: 'e2', to: 'e4', promotion: 'q' })
  assert.equal(game.history.value.length, 0)
  await Promise.resolve()
  updateRoom({ ...initialRoom, guest: 'guest', moves: ' e4', lastMove: 'e4', turn: 'b', version: 1 })
  assert.deepEqual(game.history.value.map((move) => move.san), ['e4'])
  assert.equal(online.canMove.value, false)
  game.undoMove()
  game.resetGame()
  assert.equal(game.history.value.length, 1)
  game.setPlayMode('local')
  assert.equal(game.history.value.length, 0)
  online.leave()
})

test('ignora conexão concluída após sair da sala', async () => {
  let finishConnect
  const online = useOnlineGame({ connect: () => new Promise((resolve) => { finishConnect = resolve }) })
  const pending = online.start()
  online.leave()
  finishConnect({ uid: 'host' })
  await pending
  assert.equal(online.roomId.value, '')
  assert.equal(online.busy.value, false)
})

test('bloqueia a partida quando recebe histórico inválido e libera após correção', async () => {
  let updateRoom
  const service = {
    connect: async () => ({ uid: 'host' }),
    watchConnection: (_session, callback) => { callback(true); return () => {} },
    create: async () => 'a'.repeat(32),
    watchRoom: (_session, _id, callback) => { updateRoom = callback; return () => {} },
  }
  const online = useOnlineGame(service)
  await online.start()
  updateRoom({ ...initialRoom, guest: 'guest', moves: ' e5', lastMove: 'e5', version: 1, turn: 'b' })
  assert.equal(online.canMove.value, false)
  assert.match(online.error.value, /lance inválido/)
  updateRoom({ ...initialRoom, guest: 'guest' })
  assert.equal(online.error.value, '')
  assert.equal(online.canMove.value, true)
  online.leave()
})
