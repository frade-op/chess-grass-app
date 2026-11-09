<script setup>
import { pieceImage, plants, sideName } from '../game.js'
import PlayerRow from './PlayerRow.vue'

defineProps({
  board: { type: Array, required: true },
  turn: { type: String, required: true },
  finished: Boolean,
  selected: { type: String, default: null },
  legalMoves: { type: Array, required: true },
  lastMove: { type: Object, default: null },
})
defineEmits(['select-square'])
const files = 'abcdefgh'

function squareLabel(square, piece) {
  return piece ? `${square}, ${plants[piece.type].role} ${sideName(piece.color).toLowerCase()}, ${plants[piece.type].name}` : `${square}, casa vazia`
}
</script>

<template>
  <section class="min-w-0" aria-label="Partida de xadrez">
    <div class="flex items-center justify-between">
      <div>
        <span class="text-[9px] font-bold tracking-[1.5px] text-[#96a68d]">O TABULEIRO</span>
        <h2 class="mt-[5px] font-serif text-[25px]">Hora de jogar<span class="text-[#d29a5b]">.</span></h2>
      </div>
      <span class="rounded-[20px] border border-[#dce5d6] bg-[#f8faf2] px-[11px] py-[9px] text-[8px] font-bold tracking-[1.5px] text-[#819379]"><span class="mr-[5px] inline-block size-[7px] rounded-full bg-[#8eae7a]"></span> PARTIDA LOCAL</span>
    </div>
    <PlayerRow color="b" :active="turn === 'b' && !finished" />
    <div class="rounded-[5px] border border-[#60472e] bg-[#735438] p-[11px] shadow-[0_7px_0_#59402c,0_14px_23px_#59402c26] max-[680px]:p-[7px]">
      <div class="grid aspect-square grid-cols-8 grid-rows-8 border-2 border-[#57412c]" aria-label="Tabuleiro de xadrez">
        <template v-for="(row, rowIndex) in board" :key="rowIndex">
          <button
            v-for="(piece, colIndex) in row"
            :key="`${rowIndex}-${colIndex}`"
            type="button"
            class="relative grid min-w-0 cursor-pointer place-items-center rounded-none border-0 p-0"
            :class="[
              (rowIndex + colIndex) % 2 === 1 ? 'bg-[#8d9c72]' : 'bg-[#e6d9bb]',
              selected === `${files[colIndex]}${8 - rowIndex}`
                ? 'shadow-[inset_0_0_0_4px_#f0c973]'
                : lastMove && [lastMove.from, lastMove.to].includes(`${files[colIndex]}${8 - rowIndex}`)
                  ? 'shadow-[inset_0_0_0_100px_#e1c97b38]' : '',
            ]"
            :aria-label="squareLabel(`${files[colIndex]}${8 - rowIndex}`, piece)"
            :aria-pressed="selected === `${files[colIndex]}${8 - rowIndex}`"
            @click="$emit('select-square', `${files[colIndex]}${8 - rowIndex}`)"
          >
            <span v-if="colIndex === 0" class="absolute top-1 left-[5px] z-[2] text-[10px] font-bold max-[680px]:text-[8px]" :class="(rowIndex + colIndex) % 2 ? 'text-[#e1e3cc]' : 'text-[#728261]'">{{ 8 - rowIndex }}</span>
            <span v-if="rowIndex === 7" class="absolute right-[5px] bottom-[3px] z-[2] text-[10px] font-bold max-[680px]:text-[8px]" :class="(rowIndex + colIndex) % 2 ? 'text-[#e1e3cc]' : 'text-[#728261]'">{{ files[colIndex] }}</span>
            <img v-if="piece" class="pointer-events-none relative z-[1] object-contain drop-shadow-[0_3px_2px_#30271635]" :class="piece.type === 'r' ? 'size-[75%]' : 'size-[78%]'" :src="pieceImage(piece)" alt="" draggable="false" />
            <span v-if="legalMoves.some((move) => move.to === `${files[colIndex]}${8 - rowIndex}`)" class="pointer-events-none absolute aspect-square rounded-full" :class="piece ? 'w-[86%] border-4 border-[#314f3d88] bg-transparent' : 'w-[20%] bg-[#314f3d77]'"></span>
          </button>
        </template>
      </div>
    </div>
    <PlayerRow color="w" :active="turn === 'w' && !finished" />
    <p class="mt-[7px] text-center text-[11px] text-[#9aa18f]"><span class="text-[15px] text-[#9ab38b]">✳</span> Selecione uma planta para ver seus movimentos possíveis.</p>
  </section>
</template>
