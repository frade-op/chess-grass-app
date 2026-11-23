import test from 'node:test'
import assert from 'node:assert/strict'
import { Chess } from 'chess.js'
import { watch } from 'vue'
import { useChessGame } from '../src/composables/useChessGame.js'

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function mockWorkers(onSearch) {
  const originalWorker = globalThis.Worker
  const workers = []
  globalThis.Worker = class {
    constructor() { this.commands = []; workers.push(this) }
    postMessage(command) {
      this.commands.push(command)
      if (command.startsWith('go ')) onSearch(this, command)
    }
    terminate() { this.terminated = true }
    reply(move) { this.onmessage({ data: `bestmove ${move}` }) }
  }
  return { workers, restore: () => { globalThis.Worker = originalWorker } }
}

test('identifica o rei em xeque na casa correta', () => {
  const game = useChessGame()
  game.soundEnabled.value = false
  assert.equal(game.checkedKingSquare.value, null)
  assert.equal(game.checkmate.value, false)

  for (const [from, to] of [['f2', 'f3'], ['e7', 'e5'], ['g2', 'g4'], ['d8', 'h4']]) {
    game.makeMove(from, to)
  }
  assert.equal(game.checkedKingSquare.value, 'e1')
  assert.equal(game.checkmate.value, true)
  game.undoMove()
  assert.equal(game.checkmate.value, false)
  game.makeMove('d8', 'h4')
  assert.equal(game.checkmate.value, true)
  game.resetGame()
  assert.equal(game.checkmate.value, false)
})

test('um xeque sem mate não encerra a partida', () => {
  const game = useChessGame()
  game.soundEnabled.value = false
  for (const [from, to] of [['e2', 'e4'], ['f7', 'f6'], ['d1', 'h5']]) game.makeMove(from, to)
  assert.equal(game.checkedKingSquare.value, 'e8')
  assert.equal(game.checkmate.value, false)
})

test('a partida contra Stockfish responde ao lance humano e desfaz a rodada inteira', async () => {
  const mock = mockWorkers((worker) => worker.reply('e7e5'))
  try {
    const game = useChessGame()
    game.soundEnabled.value = false
    game.setPlayMode('computer')
    let responseAt
    const stopWatching = watch(game.history, (history) => {
      if (history.length === 2) responseAt = performance.now()
    }, { flush: 'sync' })
    const startedAt = performance.now()
    game.selectSquare('e2')
    game.selectSquare('e4')
    game.selectSquare('e7')
    await wait(1100)
    assert.equal(game.computerThinking.value, true)
    assert.equal(game.history.value.length, 1)
    await wait(200)
    assert.match(mock.workers[0].commands[1], /depth 4/)
    assert.deepEqual(game.history.value.map((move) => move.san), ['e4', 'e5'])
    assert.ok(responseAt - startedAt >= 1200)
    stopWatching()
    assert.equal(game.turn.value, 'w')
    assert.equal(game.computerThinking.value, false)
    game.undoMove()
    assert.equal(game.history.value.length, 0)
    assert.equal(game.turn.value, 'w')
  } finally {
    mock.restore()
  }
})

test('exibe falha do motor e permite tentar novamente', async () => {
  let requests = 0
  const mock = mockWorkers((worker) => {
    if (++requests === 1) worker.onerror()
    else worker.reply('e7e5')
  })
  try {
    const game = useChessGame()
    game.soundEnabled.value = false
    game.setPlayMode('computer')
    game.makeMove('e2', 'e4')
    await wait(0)
    assert.match(game.computerError.value, /Não foi possível carregar/)
    assert.equal(game.history.value.length, 1)
    game.retryComputerMove()
    await wait(1300)
    assert.equal(game.computerError.value, '')
    assert.deepEqual(game.history.value.map((move) => move.san), ['e4', 'e5'])
  } finally {
    mock.restore()
  }
})

test('cancela o worker e descarta resposta atrasada ao reiniciar', async () => {
  const mock = mockWorkers(() => {})
  try {
    const game = useChessGame()
    game.soundEnabled.value = false
    game.setPlayMode('computer')
    game.makeMove('e2', 'e4')
    assert.equal(game.computerThinking.value, true)
    game.resetGame()
    assert.equal(mock.workers[0].terminated, true)
    mock.workers[0].reply('e7e5')
    await wait(0)
    assert.equal(game.history.value.length, 0)
    assert.equal(game.turn.value, 'w')
    assert.equal(game.computerThinking.value, false)
  } finally {
    mock.restore()
  }
})

test('no fácil, intercala lances legais aleatórios com os sugeridos pelo Stockfish', async () => {
  const mock = mockWorkers((worker) => worker.reply('e7e5'))
  const originalRandom = Math.random
  try {
    const game = useChessGame()
    game.soundEnabled.value = false
    game.setDifficulty('easy')
    game.setPlayMode('computer')
    Math.random = () => 0
    game.makeMove('e2', 'e4')
    await wait(1300)
    const randomMove = game.history.value.at(-1)
    assert.notEqual(randomMove.san, 'e5')
    const reference = new Chess()
    reference.move('e4')
    assert.ok(reference.moves({ verbose: true }).some((move) =>
      move.from === randomMove.from && move.to === randomMove.to))
    game.resetGame()
    Math.random = () => 0.99
    game.makeMove('e2', 'e4')
    await wait(1300)
    assert.equal(game.history.value.at(-1).san, 'e5')
  } finally {
    Math.random = originalRandom
    mock.restore()
  }
})

test('cancelar durante o tempo de pensamento impede o lance atrasado', async () => {
  const mock = mockWorkers((worker) => worker.reply('e7e5'))
  try {
    const game = useChessGame()
    game.soundEnabled.value = false
    game.setPlayMode('computer')
    game.makeMove('e2', 'e4')
    await wait(20)
    assert.equal(game.computerThinking.value, true)
    game.resetGame()
    await wait(1300)
    assert.equal(game.history.value.length, 0)
    assert.equal(game.computerThinking.value, false)
  } finally {
    mock.restore()
  }
})

test('trocar a dificuldade durante o pensamento descarta a resposta anterior', async () => {
  const mock = mockWorkers((worker, command) => worker.reply(command.includes('depth 4') ? 'e7e5' : 'd7d5'))
  try {
    const game = useChessGame()
    game.soundEnabled.value = false
    game.setPlayMode('computer')
    game.makeMove('e2', 'e4')
    await wait(20)
    game.setDifficulty('hard')
    await wait(1300)
    assert.match(mock.workers[0].commands[1], /depth 4/)
    assert.match(mock.workers[1].commands[1], /depth 10/)
    assert.deepEqual(game.history.value.map((move) => move.san), ['e4', 'd5'])
  } finally {
    mock.restore()
  }
})

test('o tempo da busca conta para o tempo mínimo de pensamento', async () => {
  const mock = mockWorkers((worker) => setTimeout(() => worker.reply('e7e5'), 1300))
  try {
    const game = useChessGame()
    game.soundEnabled.value = false
    game.setPlayMode('computer')
    game.makeMove('e2', 'e4')
    await wait(1700)
    assert.deepEqual(game.history.value.map((move) => move.san), ['e4', 'e5'])
    assert.equal(game.computerThinking.value, false)
  } finally {
    mock.restore()
  }
})
