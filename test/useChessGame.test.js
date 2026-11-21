import test from 'node:test'
import assert from 'node:assert/strict'
import { Chess } from 'chess.js'
import { watch } from 'vue'
import { useChessGame } from '../src/composables/useChessGame.js'

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

test('identifica o rei em xeque na casa correta', () => {
  const game = useChessGame()
  game.soundEnabled.value = false
  assert.equal(game.checkedKingSquare.value, null)
  assert.equal(game.checkmate.value, false)

  for (const [from, to] of [
    ['f2', 'f3'],
    ['e7', 'e5'],
    ['g2', 'g4'],
    ['d8', 'h4'],
  ]) {
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
  for (const [from, to] of [['e2', 'e4'], ['f7', 'f6'], ['d1', 'h5']]) {
    game.makeMove(from, to)
  }
  assert.equal(game.checkedKingSquare.value, 'e8')
  assert.equal(game.checkmate.value, false)
})

test('a partida contra Stockfish responde ao lance humano e desfaz a rodada inteira', async () => {
  const originalFetch = globalThis.fetch
  let requestBody
  globalThis.fetch = async (_url, options) => {
    requestBody = JSON.parse(options.body)
    return {
      ok: true,
      status: 200,
      json: async () => ({ type: 'bestmove', move: 'e7e5' }),
    }
  }

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

    assert.equal(requestBody.depth, 5)
    assert.deepEqual(game.history.value.map((move) => move.san), ['e4', 'e5'])
    assert.ok(responseAt - startedAt >= 1200)
    stopWatching()
    assert.equal(game.turn.value, 'w')
    assert.equal(game.computerThinking.value, false)

    game.undoMove()
    assert.equal(game.history.value.length, 0)
    assert.equal(game.turn.value, 'w')
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('exibe falha da API e permite tentar novamente o lance da máquina', async () => {
  const originalFetch = globalThis.fetch
  let requests = 0
  globalThis.fetch = async () => {
    requests++
    if (requests === 1) return { ok: false, status: 503 }
    return {
      ok: true,
      status: 200,
      json: async () => ({ type: 'bestmove', move: 'e7e5' }),
    }
  }

  try {
    const game = useChessGame()
    game.soundEnabled.value = false
    game.setPlayMode('computer')
    game.selectSquare('e2')
    game.selectSquare('e4')
    await wait(0)

    assert.match(game.computerError.value, /erro \(503\)/)
    assert.equal(game.history.value.length, 1)

    game.retryComputerMove()
    await wait(1300)
    assert.equal(game.computerError.value, '')
    assert.deepEqual(game.history.value.map((move) => move.san), ['e4', 'e5'])
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('descarta uma resposta atrasada quando uma nova partida é iniciada', async () => {
  const originalFetch = globalThis.fetch
  let resolveResponse
  globalThis.fetch = () => new Promise((resolve) => {
    resolveResponse = resolve
  })

  try {
    const game = useChessGame()
    game.soundEnabled.value = false
    game.setPlayMode('computer')
    game.selectSquare('e2')
    game.selectSquare('e4')
    assert.equal(game.computerThinking.value, true)

    game.resetGame()
    resolveResponse({
      ok: true,
      status: 200,
      json: async () => ({ type: 'bestmove', move: 'e7e5' }),
    })
    await wait(0)

    assert.equal(game.history.value.length, 0)
    assert.equal(game.turn.value, 'w')
    assert.equal(game.computerThinking.value, false)
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('no fácil, intercala lances legais aleatórios com os sugeridos pelo Stockfish', async () => {
  const originalFetch = globalThis.fetch
  const originalRandom = Math.random
  globalThis.fetch = async () => ({
    ok: true,
    status: 200,
    json: async () => ({ type: 'bestmove', move: 'e7e5' }),
  })

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
    globalThis.fetch = originalFetch
  }
})

test('cancelar durante o tempo de pensamento impede o lance atrasado', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => ({
    ok: true,
    status: 200,
    json: async () => ({ type: 'bestmove', move: 'e7e5' }),
  })

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
    globalThis.fetch = originalFetch
  }
})

test('trocar a dificuldade durante o pensamento descarta a resposta anterior', async () => {
  const originalFetch = globalThis.fetch
  const depths = []
  globalThis.fetch = async (_url, options) => {
    const { depth } = JSON.parse(options.body)
    depths.push(depth)
    return {
      ok: true,
      status: 200,
      json: async () => ({ type: 'bestmove', move: depth === 5 ? 'e7e5' : 'd7d5' }),
    }
  }

  try {
    const game = useChessGame()
    game.soundEnabled.value = false
    game.setPlayMode('computer')
    game.makeMove('e2', 'e4')
    await wait(20)
    game.setDifficulty('hard')
    await wait(1300)
    assert.deepEqual(depths, [5, 10])
    assert.deepEqual(game.history.value.map((move) => move.san), ['e4', 'd5'])
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('o tempo da consulta conta para o tempo mínimo de pensamento', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => {
    await wait(1300)
    return {
      ok: true,
      status: 200,
      json: async () => ({ type: 'bestmove', move: 'e7e5' }),
    }
  }

  try {
    const game = useChessGame()
    game.soundEnabled.value = false
    game.setPlayMode('computer')
    game.makeMove('e2', 'e4')
    await wait(1700)
    assert.deepEqual(game.history.value.map((move) => move.san), ['e4', 'e5'])
    assert.equal(game.computerThinking.value, false)
  } finally {
    globalThis.fetch = originalFetch
  }
})
