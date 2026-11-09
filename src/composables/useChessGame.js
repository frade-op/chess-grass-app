import { computed, ref } from 'vue'
import { createGame, gameStatus } from '../game.js'

export function useChessGame() {
  const game = createGame()
  const revision = ref(0)
  const selected = ref(null)
  const promotion = ref(null)
  const soundEnabled = ref(true)
  const soundError = ref('')

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
  const legalMoves = computed(() => {
    revision.value
    return selected.value ? game.moves({ square: selected.value, verbose: true }) : []
  })
  const lastMove = computed(() => history.value.at(-1))

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
  }

  function selectSquare(square) {
    if (promotion.value || finished.value) return
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
    game.reset()
    selected.value = null
    promotion.value = null
    revision.value++
  }

  function undoMove() {
    if (!history.value.length) return
    game.undo()
    selected.value = null
    promotion.value = null
    revision.value++
  }

  return {
    board, history, turn, status, finished, legalMoves, lastMove, selected, promotion,
    soundEnabled, soundError, makeMove, selectSquare, resetGame, undoMove,
  }
}
