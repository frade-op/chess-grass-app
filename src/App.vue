<script setup>
import AppHeader from './components/AppHeader.vue'
import GameBoard from './components/GameBoard.vue'
import GameJournal from './components/GameJournal.vue'
import GameStatus from './components/GameStatus.vue'
import PlantGuide from './components/PlantGuide.vue'
import PromotionDialog from './components/PromotionDialog.vue'
import { useChessGame } from './composables/useChessGame.js'

const {
  board, history, turn, status, finished, legalMoves, lastMove, selected, promotion,
  soundEnabled, soundError, makeMove, selectSquare, resetGame, undoMove,
} = useChessGame()
</script>

<template>
  <AppHeader :sound-enabled="soundEnabled" @toggle-sound="soundEnabled = !soundEnabled" />

  <main class="mx-auto max-w-[1370px] px-[5%]">
    <section class="flex items-end justify-between pt-[58px] pb-[47px] max-[680px]:pt-[38px] max-[680px]:pb-8">
      <div>
        <div class="flex items-center gap-[9px] text-[9px] font-bold tracking-[1.5px] text-[#849976]">
          <span class="h-px w-[25px] bg-[#91a783]"></span> UM JOGO DA NATUREZA
        </div>
        <h1 class="mt-[13px] font-serif text-[clamp(35px,4vw,55px)] leading-[1.07] tracking-[-1.6px]">Onde a estratégia <em class="text-[#819b72]">floresce.</em></h1>
        <p class="mt-[13px] max-w-[570px] text-[13px] leading-[1.7] text-[#899082]">Um clássico em uma nova estação. Cultive suas ideias, planeje seus movimentos e deixe o jogo crescer.</p>
      </div>
      <div class="pb-[5px] text-[9px] font-bold tracking-[1.5px] whitespace-nowrap text-[#9aa891] max-[900px]:hidden"><span class="mr-2 align-middle text-[20px]">✳</span> UMA PARTIDA DE CADA VEZ</div>
    </section>

    <div class="grid grid-cols-[minmax(0,1fr)_350px] items-start gap-[38px] max-[900px]:grid-cols-[minmax(0,1fr)_300px] max-[900px]:gap-5 max-[680px]:grid-cols-1">
      <GameBoard :board="board" :turn="turn" :finished="finished" :selected="selected" :legal-moves="legalMoves" :last-move="lastMove" @select-square="selectSquare" />
      <aside class="grid gap-4 max-[680px]:mt-[10px]">
        <GameStatus :status="status" :move-count="history.length" :sound-error="soundError" @reset="resetGame" @undo="undoMove" />
        <PlantGuide />
        <GameJournal :history="history" />
      </aside>
    </div>

    <footer class="flex items-center gap-[10px] pt-[60px] pb-[35px] text-[8px] font-bold tracking-[1.5px] text-[#a4af9d] max-[680px]:pt-10">
      <span class="text-[15px]">✳</span> FEITO PARA JOGAR COM CALMA <span class="h-px flex-1 bg-[#e3e7dd]"></span> CULTIVE BONS MOVIMENTOS
    </footer>
  </main>

  <PromotionDialog v-if="promotion" :promotion="promotion" @choose="makeMove(promotion.from, promotion.to, $event)" @cancel="promotion = null" />
</template>
