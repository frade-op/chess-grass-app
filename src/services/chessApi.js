export const engineDifficulties = Object.freeze({
  easy: { label: 'Fácil', depth: 1 },
  medium: { label: 'Médio', depth: 5 },
  hard: { label: 'Difícil', depth: 10 },
})

const endpoint = 'https://chess-api.com/v1'
const uciPattern = /^([a-h][1-8])([a-h][1-8])([qrbn])?$/

export async function requestEngineMove(fen, difficulty, signal) {
  const settings = engineDifficulties[difficulty]
  if (!settings) throw new Error('Selecione uma dificuldade válida para o Stockfish.')

  let response
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fen, depth: settings.depth, maxThinkingTime: 50 }),
      signal,
    })
  } catch (error) {
    if (signal?.aborted) throw error
    throw new Error('Não foi possível conectar à API Stockfish. Verifique sua conexão e tente novamente.')
  }

  if (!response.ok) {
    throw new Error(`A API Stockfish respondeu com erro (${response.status}). Tente novamente.`)
  }

  let result
  try {
    result = await response.json()
  } catch (error) {
    if (signal?.aborted) throw error
    throw new Error('A API Stockfish retornou uma resposta inválida. Tente novamente.')
  }

  const match = typeof result?.move === 'string' ? uciPattern.exec(result.move) : null
  if (!match) throw new Error('A API Stockfish não retornou um lance válido. Tente novamente.')

  return { from: match[1], to: match[2], promotion: match[3] ?? 'q' }
}
