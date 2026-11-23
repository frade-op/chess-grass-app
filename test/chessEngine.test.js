import test from 'node:test'
import assert from 'node:assert/strict'
import { engineDifficulties, requestEngineMove } from '../src/services/chessEngine.js'

test('envia a posição e a dificuldade ao worker e converte o lance UCI', async () => {
  const originalWorker = globalThis.Worker
  let worker
  globalThis.Worker = class {
    constructor(url) { this.url = url; this.commands = []; worker = this }
    postMessage(command) { this.commands.push(command) }
    terminate() { this.terminated = true }
  }
  try {
    const result = requestEngineMove('fen-atual', 'medium')
    assert.match(worker.url, /stockfish-19-lite-single\.js#/)
    assert.deepEqual(worker.commands, ['position fen fen-atual', `go depth ${engineDifficulties.medium.depth} movetime 50`])
    worker.onmessage({ data: 'info depth 5' })
    worker.onmessage({ data: 'bestmove a7a8n ponder e8e7' })
    assert.deepEqual(await result, { from: 'a7', to: 'a8', promotion: 'n' })
    assert.equal(worker.terminated, true)
  } finally {
    globalThis.Worker = originalWorker
  }
})

test('encerra o worker ao cancelar e rejeita respostas ou carregamentos inválidos', async () => {
  const originalWorker = globalThis.Worker
  let worker
  globalThis.Worker = class {
    constructor() { worker = this }
    postMessage() {}
    terminate() { this.terminated = true }
  }
  try {
    const controller = new AbortController()
    const cancelled = requestEngineMove('fen-atual', 'easy', controller.signal)
    controller.abort()
    await assert.rejects(cancelled, { name: 'AbortError' })
    assert.equal(worker.terminated, true)
    await assert.rejects(requestEngineMove('fen-atual', 'easy', controller.signal), { name: 'AbortError' })

    const invalid = requestEngineMove('fen-atual', 'hard')
    worker.onmessage({ data: 'bestmove (none)' })
    await assert.rejects(invalid, /não retornou um lance válido/)
    assert.equal(worker.terminated, true)

    const failure = requestEngineMove('fen-atual', 'hard')
    worker.onerror()
    await assert.rejects(failure, /Não foi possível carregar/)
    assert.equal(worker.terminated, true)
    await assert.rejects(requestEngineMove('fen-atual', 'unknown'), /dificuldade válida/)
  } finally {
    globalThis.Worker = originalWorker
  }
})

test('encerra o worker quando não é possível enviar comandos', async () => {
  const originalWorker = globalThis.Worker
  let worker
  globalThis.Worker = class {
    constructor() { worker = this }
    postMessage() { throw new Error('Worker indisponível') }
    terminate() { this.terminated = true }
  }
  try {
    await assert.rejects(requestEngineMove('fen-atual', 'medium'), /Não foi possível iniciar a busca/)
    assert.equal(worker.terminated, true)
  } finally {
    globalThis.Worker = originalWorker
  }
})
