<script setup>
import { ref } from 'vue'
import AppHeader from './components/AppHeader.vue'
import GameBoard from './components/GameBoard.vue'
import GameJournal from './components/GameJournal.vue'
import GameStatus from './components/GameStatus.vue'
import PlantGuide from './components/PlantGuide.vue'
import PieceTutorial from './components/PieceTutorial.vue'
import PromotionDialog from './components/PromotionDialog.vue'
import WelcomeDialog from './components/WelcomeDialog.vue'
import { useChessGame } from './composables/useChessGame.js'

const welcomeVisible = ref(true)
const guideTutorialPiece = ref(null)

const {
  board, history, turn, status, finished, legalMoves, lastMove, selected, promotion,
  soundEnabled, soundError, makeMove, selectSquare, resetGame, undoMove,
} = useChessGame()
</script>

<template>
  <AppHeader :sound-enabled="soundEnabled" @toggle-sound="soundEnabled = !soundEnabled" />

  <main class="mx-auto max-w-[1370px] px-[5%]">
    <div class="grid grid-cols-[minmax(0,1fr)_350px] items-start gap-[38px] pt-[44px] max-[900px]:grid-cols-[minmax(0,1fr)_300px] max-[900px]:gap-5 max-[680px]:grid-cols-1 max-[680px]:pt-[30px]">
      <GameBoard :board="board" :turn="turn" :finished="finished" :selected="selected" :legal-moves="legalMoves" :last-move="lastMove" @select-square="selectSquare" />
      <aside class="grid gap-4 max-[680px]:mt-[10px]">
        <GameStatus :status="status" :move-count="history.length" :sound-error="soundError" @reset="resetGame" @undo="undoMove" />
        <PlantGuide @select-piece="guideTutorialPiece = $event" />
        <GameJournal :history="history" />
      </aside>
    </div>

    <footer class="flex items-center gap-[10px] pt-[60px] pb-[35px] text-[8px] font-bold tracking-[1.5px] text-[#a4af9d] max-[680px]:pt-10">
      <span class="text-[15px]">✳</span> FEITO PARA JOGAR COM CALMA <span class="h-px flex-1 bg-[#e3e7dd]"></span> CULTIVE BONS MOVIMENTOS
    </footer>
  </main>

  <WelcomeDialog v-if="welcomeVisible" @dismiss="welcomeVisible = false" />
  <PieceTutorial
    v-if="guideTutorialPiece"
    :piece-type="guideTutorialPiece"
    @back="guideTutorialPiece = null"
    @dismiss="guideTutorialPiece = null"
  />
  <PromotionDialog v-if="promotion" :promotion="promotion" @choose="makeMove(promotion.from, promotion.to, $event)" @cancel="promotion = null" />
</template>
