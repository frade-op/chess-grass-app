import test from 'node:test'
import assert from 'node:assert/strict'
import { engineDifficulties, requestEngineMove } from '../src/services/chessApi.js'

test('solicita um lance à dificuldade escolhida e converte UCI', async () => {
  const originalFetch = globalThis.fetch
  let request
  globalThis.fetch = async (url, options) => {
    request = { url, options }
    return { ok: true, status: 200, json: async () => ({ type: 'bestmove', move: 'e2e4' }) }
  }

  try {
    const move = await requestEngineMove('fen-atual', 'medium')
    assert.equal(request.url, 'https://chess-api.com/v1')
    assert.equal(request.options.method, 'POST')
    assert.equal(request.options.headers['Content-Type'], 'application/json')
    assert.deepEqual(JSON.parse(request.options.body), {
      fen: 'fen-atual',
      depth: engineDifficulties.medium.depth,
      maxThinkingTime: 50,
    })
    assert.deepEqual(move, { from: 'e2', to: 'e4', promotion: 'q' })
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('preserva a promoção informada pela API', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => ({
    ok: true,
    status: 200,
    json: async () => ({ type: 'bestmove', move: 'a7a8n' }),
  })

  try {
    assert.deepEqual(await requestEngineMove('fen-atual', 'easy'), {
      from: 'a7',
      to: 'a8',
      promotion: 'n',
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('recusa resposta HTTP com erro ou lance UCI inválido', async () => {
  const originalFetch = globalThis.fetch
  try {
    globalThis.fetch = async () => ({ ok: false, status: 503 })
    await assert.rejects(requestEngineMove('fen-atual', 'hard'), /erro \(503\)/)

    globalThis.fetch = async () => ({
      ok: true,
      status: 200,
      json: async () => ({ type: 'bestmove', move: 'e2e9' }),
    })
    await assert.rejects(requestEngineMove('fen-atual', 'hard'), /não retornou um lance válido/)
  } finally {
    globalThis.fetch = originalFetch
  }
})
