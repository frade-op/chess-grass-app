<script setup>
import { computed } from 'vue'
import { pieceImage, plants, sideName } from '../game.js'

const props = defineProps({ history: { type: Array, required: true } })
const movePairs = computed(() => {
  const pairs = []
  for (let i = 0; i < props.history.length; i += 2) {
    pairs.push({ number: i / 2 + 1, white: props.history[i], black: props.history[i + 1] })
  }
  return pairs
})
const captures = (color) => props.history.filter((move) => move.captured && move.color === color)
</script>

<template>
  <div class="rounded-lg border border-[#e5e9dd] bg-[#fffef9] p-[22px]">
    <div class="flex items-center justify-between">
      <div>
        <span class="text-[9px] font-bold tracking-[1.5px] text-[#96a68d]">ACOMPANHE O JOGO</span>
        <h3 class="mt-[5px] font-serif text-[23px]">Diário da partida<span class="text-[#d29a5b]">.</span></h3>
      </div>
      <span class="text-[8px] font-bold tracking-[1.5px] text-[#a8b2a1]">{{ history.length }} LANCES</span>
    </div>
    <div v-if="!history.length" class="pt-[25px] pb-[9px] text-center text-[#a7b3a0]">
      <span class="text-[26px]">♧</span>
      <p class="mt-[6px] text-[11px] leading-[1.6]">A história começa com<br />o primeiro movimento.</p>
    </div>
    <div v-else class="mt-[15px] max-h-[150px] overflow-y-auto" aria-label="Histórico de movimentos">
      <div v-for="pair in movePairs" :key="pair.number" class="grid grid-cols-[35px_1fr_1fr] p-2 text-[11px] odd:bg-[#f3f5ed]">
        <span class="text-[#a4b09d]">{{ String(pair.number).padStart(2, '0') }}</span>
        <strong>{{ pair.white.san }}</strong>
        <strong>{{ pair.black?.san || '—' }}</strong>
      </div>
    </div>
    <div v-if="captures('w').length || captures('b').length" class="mt-[15px] border-t border-[#e9ede4] pt-3">
      <span class="text-[9px] font-bold tracking-[1px] text-[#96a68d]">CAPTURAS</span>
      <div v-for="color in ['w', 'b']" :key="color" class="flex min-h-[25px] items-center gap-[2px]">
        <small class="w-12 text-[10px] text-[#8b9985]">{{ sideName(color) }}</small>
        <img v-for="(move, index) in captures(color)" :key="index" class="size-[25px] object-contain" :src="pieceImage({ type: move.captured, color: color === 'w' ? 'b' : 'w' })" :alt="plants[move.captured].name" />
      </div>
    </div>
  </div>
</template>
