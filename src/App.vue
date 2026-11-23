<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import AppHeader from './components/AppHeader.vue'
import CheckmateDialog from './components/CheckmateDialog.vue'
import GameBoard from './components/GameBoard.vue'
import GameJournal from './components/GameJournal.vue'
import GameModeControls from './components/GameModeControls.vue'
import GameStatus from './components/GameStatus.vue'
import OnlineControls from './components/OnlineControls.vue'
import PlantGuide from './components/PlantGuide.vue'
import PieceTutorial from './components/PieceTutorial.vue'
import PromotionDialog from './components/PromotionDialog.vue'
import RoadmapDialog from './components/RoadmapDialog.vue'
import WelcomeDialog from './components/WelcomeDialog.vue'
import { useChessGame } from './composables/useChessGame.js'
import { useOnlineGame } from './composables/useOnlineGame.js'
import { sideName } from './game.js'

const welcomeVisible = ref(true)
const guideTutorialPiece = ref(null)
const checkmateVisible = ref(false)
const roadmapVisible = ref(false)
const online = useOnlineGame()

const {
  board, history, turn, status, finished, checkmate, legalMoves, lastMove, checkedKingSquare, selected, promotion,
  soundEnabled, soundError, playMode, difficulty, computerThinking, computerError,
  makeMove, selectSquare, resetGame, undoMove, setPlayMode, setDifficulty, retryComputerMove,
} = useChessGame(online)
const computerTurn = computed(() => playMode.value === 'computer' && turn.value === 'b')
const boardLocked = computed(() => computerTurn.value || (playMode.value === 'online' && !online.canMove.value))
watch(checkmate, (isCheckmate) => { checkmateVisible.value = isCheckmate }, { flush: 'sync' })
watch(online.roomId, (id) => {
  if (!id) return
  const url = new URL(window.location.href)
  url.searchParams.set('sala', id)
  window.history.replaceState(null, '', url)
})

function selectMode(mode) {
  if (mode === playMode.value) return
  if (playMode.value === 'online') {
    online.leave()
    const url = new URL(window.location.href)
    url.searchParams.delete('sala')
    window.history.replaceState(null, '', url)
  }
  setPlayMode(mode)
}

onMounted(() => {
  const invite = new URL(window.location.href).searchParams.get('sala')
  if (invite) {
    setPlayMode('online')
    void online.start(invite)
  }
})
</script>

<template>
  <AppHeader :sound-enabled="soundEnabled" @toggle-sound="soundEnabled = !soundEnabled" />

  <main class="mx-auto max-w-[1370px] px-[5%]">
    <div class="grid grid-cols-[minmax(0,1fr)_350px] items-start gap-[38px] pt-[44px] max-[900px]:grid-cols-[minmax(0,1fr)_300px] max-[900px]:gap-5 max-[680px]:grid-cols-1 max-[680px]:pt-[30px]">
      <GameBoard :board="board" :turn="turn" :mode="playMode" :online-color="online.color.value" :computer-thinking="computerThinking" :finished="finished" :input-locked="boardLocked" :selected="selected" :legal-moves="legalMoves" :last-move="lastMove" :checked-king-square="checkedKingSquare" @select-square="selectSquare" />
      <aside class="grid gap-4 max-[680px]:mt-[10px]">
        <GameModeControls
          :mode="playMode"
          :difficulty="difficulty"
          :thinking="computerThinking"
          :error="computerError"
          @select-mode="selectMode"
          @select-difficulty="setDifficulty"
          @retry="retryComputerMove"
        />
        <OnlineControls v-if="playMode === 'online'" :room="online.room.value" :room-id="online.roomId.value" :color="online.color.value" :connected="online.connected.value" :busy="online.busy.value" :error="online.error.value" @create="online.start()" />
        <GameStatus :status="status" :move-count="history.length" :sound-error="soundError" :online="playMode === 'online'" @reset="resetGame" @undo="undoMove" />
        <PlantGuide @select-piece="guideTutorialPiece = $event" />
        <GameJournal :history="history" />
      </aside>
    </div>

    <footer class="flex flex-wrap items-center gap-x-5 gap-y-3 pt-[60px] pb-[35px] text-[10px] font-bold tracking-[1px] text-[#70846a] max-[680px]:pt-10">
      <span><span class="text-[15px]">✳</span> FEITO PARA JOGAR COM CALMA</span>
      <span class="h-px min-w-5 flex-1 bg-[#e3e7dd]"></span>
      <button type="button" class="cursor-pointer hover:underline" aria-haspopup="dialog" @click="roadmapVisible = true">PRÓXIMOS PASSOS</button>
      <a class="hover:underline" href="https://www.linkedin.com/in/frade-op/" target="_blank" rel="noopener noreferrer">LINKEDIN</a>
      <a class="hover:underline" href="https://github.com/frade-op" target="_blank" rel="noopener noreferrer">GITHUB</a>
    </footer>
  </main>

  <WelcomeDialog v-if="welcomeVisible" @dismiss="welcomeVisible = false" />
  <RoadmapDialog v-if="roadmapVisible" @dismiss="roadmapVisible = false" />
  <PieceTutorial
    v-if="guideTutorialPiece"
    :piece-type="guideTutorialPiece"
    @back="guideTutorialPiece = null"
    @dismiss="guideTutorialPiece = null"
  />
  <PromotionDialog v-if="promotion" :promotion="promotion" @choose="makeMove(promotion.from, promotion.to, $event)" @cancel="promotion = null" />
  <CheckmateDialog
    v-if="checkmateVisible"
    :winner="sideName(turn === 'w' ? 'b' : 'w')"
    :online="playMode === 'online'"
    @dismiss="checkmateVisible = false"
    @reset="resetGame"
  />
</template>
