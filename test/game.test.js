import test from 'node:test'
import assert from 'node:assert/strict'
import { Chess } from 'chess.js'
import { createGame, gameStatus, plants } from '../src/game.js'

test('a partida começa com marrom e permite apenas movimentos legais', () => {
  const game = createGame()
  assert.equal(game.turn(), 'w')
  assert.equal(gameStatus(game), 'Vez de marrom')
  assert.throws(() => game.move({ from: 'e2', to: 'e5' }))
  game.move({ from: 'e2', to: 'e4' })
  assert.equal(game.turn(), 'b')
  assert.equal(game.undo().san, 'e4')
  assert.equal(game.turn(), 'w')
})

test('capturas e xeque-mate são registrados', () => {
  const game = createGame()
  for (const move of ['f3', 'e5', 'g4']) game.move(move)
  const final = game.move('Qh4#')
  assert.equal(final.san, 'Qh4#')
  assert.equal(gameStatus(game), 'Xeque-mate! Preto venceu.')

  const capture = new Chess()
  for (const move of ['e4', 'd5']) capture.move(move)
  assert.equal(capture.move('exd5').captured, 'p')
})

test('regras especiais e associações das plantas estão disponíveis', () => {
  const castle = new Chess('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1')
  assert.equal(castle.move('O-O').san, 'O-O')
  const enPassant = new Chess('4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1')
  assert.equal(enPassant.move('exd6').captured, 'p')
  const promotion = new Chess('4k3/P7/8/8/8/8/8/4K3 w - - 0 1')
  assert.equal(promotion.move({ from: 'a7', to: 'a8', promotion: 'n' }).promotion, 'n')
  assert.deepEqual(Object.values(plants).map((plant) => plant.name), ['Orquídea', 'Jiboia', 'Samambaia', 'Cacto', 'Espada', 'Suculenta'])
})
