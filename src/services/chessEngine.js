export const engineDifficulties = Object.freeze({
  easy: { label: 'Fácil', depth: 1 },
  medium: { label: 'Médio', depth: 4 },
  hard: { label: 'Difícil', depth: 10 },
})

const engineUrl = new URL('../../node_modules/stockfish/bin/stockfish-19-lite-single.js', import.meta.url).href
const wasmUrl = new URL('../../node_modules/stockfish/bin/stockfish-19-lite-single.wasm', import.meta.url).href
const bestMovePattern = /^bestmove ([a-h][1-8])([a-h][1-8])([qrbn])?(?:\s|$)/
const engineTimeout = 30000

export function requestEngineMove(fen, difficulty, signal) {
  const settings = engineDifficulties[difficulty]
  if (!settings) return Promise.reject(new Error('Selecione uma dificuldade válida para o Stockfish.'))
  if (signal?.aborted) return Promise.reject(new DOMException('Busca cancelada.', 'AbortError'))

  return new Promise((resolve, reject) => {
    let worker
    try {
      worker = new Worker(`${engineUrl}#${encodeURIComponent(wasmUrl)}`)
    } catch {
      reject(new Error('Não foi possível iniciar o Stockfish neste navegador.'))
      return
    }

    let finished = false
    const timer = setTimeout(() => finish(new Error('Stockfish demorou para responder. Tente novamente.')), engineTimeout)
    const abort = () => finish(new DOMException('Busca cancelada.', 'AbortError'))

    function finish(error, move) {
      if (finished) return
      finished = true
      clearTimeout(timer)
      signal?.removeEventListener('abort', abort)
      worker.terminate()
      if (error) reject(error)
      else resolve(move)
    }

    signal?.addEventListener('abort', abort, { once: true })
    worker.onerror = () => finish(new Error('Não foi possível carregar o Stockfish. Tente novamente.'))
    worker.onmessage = ({ data }) => {
      if (typeof data !== 'string' || !data.startsWith('bestmove ')) return
      const match = bestMovePattern.exec(data)
      if (!match) {
        finish(new Error('Stockfish não retornou um lance válido. Tente novamente.'))
        return
      }
      finish(null, { from: match[1], to: match[2], promotion: match[3] ?? 'q' })
    }

    try {
      worker.postMessage(`position fen ${fen}`)
      worker.postMessage(`go depth ${settings.depth} movetime 50`)
    } catch {
      finish(new Error('Não foi possível iniciar a busca do Stockfish. Tente novamente.'))
    }
  })
}
