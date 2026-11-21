import { computed, ref } from 'vue'
import { createGame, gameStatus } from '../game.js'
import { engineDifficulties, requestEngineMove } from '../services/chessApi.js'

const minimumThinkingTime = 1200
const easyRandomMoveChance = 0.75

function waitForThinkingTime(startedAt, signal) {
  const remaining = minimumThinkingTime - (performance.now() - startedAt)
  if (remaining <= 0 || signal.aborted) return Promise.resolve()

  return new Promise((resolve) => {
    const timer = setTimeout(finish, Math.ceil(remaining))
    function finish() {
      clearTimeout(timer)
      signal.removeEventListener('abort', finish)
      resolve()
    }
    signal.addEventListener('abort', finish, { once: true })
  })
}

export function useChessGame() {
  const game = createGame()
  const revision = ref(0)
  const selected = ref(null)
  const promotion = ref(null)
  const soundEnabled = ref(true)
  const soundError = ref('')
  const playMode = ref('local')
  const difficulty = ref('medium')
  const computerThinking = ref(false)
  const computerError = ref('')
  let engineRequestId = 0
  let engineAbortController = null

  const board = computed(() => {
    revision.value
    return game.board()
  })
  const history = computed(() => {
    revision.value
    return game.history({ verbose: true })
  })
  const turn = computed(() => {
    revision.value
    return game.turn()
  })
  const status = computed(() => {
    revision.value
    return gameStatus(game)
  })
  const finished = computed(() => {
    revision.value
    return game.isGameOver()
  })
  const checkmate = computed(() => {
    revision.value
    return game.isCheckmate()
  })
  const legalMoves = computed(() => {
    revision.value
    return selected.value ? game.moves({ square: selected.value, verbose: true }) : []
  })
  const lastMove = computed(() => history.value.at(-1))
  const checkedKingSquare = computed(() => {
    revision.value
    if (!game.isCheck()) return null

    const position = game.board()
    for (let rowIndex = 0; rowIndex < 8; rowIndex++) {
      for (let colIndex = 0; colIndex < 8; colIndex++) {
        const piece = position[rowIndex][colIndex]
        if (piece?.type === 'k' && piece.color === game.turn()) {
          return `${'abcdefgh'[colIndex]}${8 - rowIndex}`
        }
      }
    }

    return null
  })
  const computerTurn = computed(() => playMode.value === 'computer' && turn.value === 'b')

  function cancelComputerRequest() {
    engineRequestId++
    engineAbortController?.abort()
    engineAbortController = null
    computerThinking.value = false
  }

  async function requestComputerMove() {
    if (!computerTurn.value || game.isGameOver()) return

    cancelComputerRequest()
    const requestId = engineRequestId
    const controller = new AbortController()
    const requestedFen = game.fen()
    const requestedDifficulty = difficulty.value
    const startedAt = performance.now()
    engineAbortController = controller
    computerThinking.value = true
    computerError.value = ''

    try {
      const move = await requestEngineMove(requestedFen, requestedDifficulty, controller.signal)
      await waitForThinkingTime(startedAt, controller.signal)
      if (
        requestId !== engineRequestId
        || controller.signal.aborted
        || playMode.value !== 'computer'
        || game.turn() !== 'b'
        || game.fen() !== requestedFen
      ) return

      const availableMoves = game.moves({ verbose: true })
      const engineMove = availableMoves.find((candidate) =>
        candidate.from === move.from && candidate.to === move.to
        && (!candidate.promotion || candidate.promotion === move.promotion))
      if (!engineMove) {
        computerError.value = 'Stockfish retornou um lance ilegal. Tente novamente ou inicie outra partida.'
        return
      }

      const chosenMove = requestedDifficulty === 'easy' && Math.random() < easyRandomMoveChance
        ? availableMoves[Math.floor(Math.random() * availableMoves.length)]
        : engineMove
      let playedMove
      try {
        playedMove = game.move(chosenMove)
      } catch {
        computerError.value = 'Stockfish retornou um lance ilegal. Tente novamente ou inicie outra partida.'
        return
      }

      selected.value = null
      promotion.value = null
      revision.value++
      playSound(Boolean(playedMove.captured))
    } catch (error) {
      if (requestId !== engineRequestId || controller.signal.aborted) return
      computerError.value = error instanceof Error
        ? error.message
        : 'Não foi possível consultar a API Stockfish. Tente novamente.'
    } finally {
      if (requestId === engineRequestId) {
        computerThinking.value = false
        engineAbortController = null
      }
    }
  }

  function playSound(capture) {
    if (!soundEnabled.value) return
    const audio = new Audio(`${import.meta.env.BASE_URL}assets/sounds/${capture ? 'vaso-quebrando' : 'vaso-movendo'}.mp3`)
    audio.play().then(() => { soundError.value = '' }).catch(() => {
      soundError.value = 'Não foi possível reproduzir o som. Verifique as permissões de áudio do navegador.'
    })
  }

  function makeMove(from, to, piece = 'q') {
    const move = game.move({ from, to, promotion: piece })
    selected.value = null
    promotion.value = null
    revision.value++
    playSound(Boolean(move.captured))
    if (computerTurn.value && !game.isGameOver()) void requestComputerMove()
  }

  function selectSquare(square) {
    if (promotion.value || finished.value || computerTurn.value) return
    const piece = game.get(square)
    const move = legalMoves.value.find((candidate) => candidate.to === square)
    if (selected.value && move) {
      if (move.flags.includes('p')) {
        promotion.value = { from: selected.value, to: square, color: turn.value }
      } else {
        makeMove(selected.value, square)
      }
      return
    }
    selected.value = piece?.color === turn.value && selected.value !== square ? square : null
  }

  function resetGame() {
    cancelComputerRequest()
    computerError.value = ''
    game.reset()
    selected.value = null
    promotion.value = null
    revision.value++
  }

  function undoMove() {
    const playedHistory = history.value
    if (!playedHistory.length) return
    cancelComputerRequest()
    computerError.value = ''
    const undoCount = playMode.value === 'computer'
      && playedHistory.length > 1
      && playedHistory.at(-1).color === 'b'
      ? 2 : 1
    for (let index = 0; index < undoCount; index++) game.undo()
    selected.value = null
    promotion.value = null
    revision.value++
  }

  function setPlayMode(mode) {
    if (!['local', 'computer'].includes(mode)) throw new Error('Modo de jogo inválido.')
    if (playMode.value === mode) return
    playMode.value = mode
    resetGame()
  }

  function setDifficulty(level) {
    if (!Object.hasOwn(engineDifficulties, level)) throw new Error('Dificuldade inválida.')
    if (difficulty.value === level) return
    const shouldRequestMove = playMode.value === 'computer'
      && computerTurn.value
      && (computerThinking.value || Boolean(computerError.value))
    difficulty.value = level
    computerError.value = ''
    if (shouldRequestMove) void requestComputerMove()
  }

  function retryComputerMove() {
    void requestComputerMove()
  }

  return {
    board, history, turn, status, finished, checkmate, legalMoves, lastMove, checkedKingSquare, selected, promotion,
    soundEnabled, soundError, playMode, difficulty, computerThinking, computerError,
    makeMove, selectSquare, resetGame, undoMove, setPlayMode, setDifficulty, retryComputerMove,
  }
}
