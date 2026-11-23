<script setup>
import { computed } from 'vue'

const props = defineProps({
  color: { type: String, required: true },
  active: Boolean,
  mode: { type: String, default: 'local' },
  computerThinking: Boolean,
  onlineColor: { type: String, default: '' },
})

const isComputer = computed(() => props.mode === 'computer' && props.color === 'b')
const playerName = computed(() => isComputer.value
  ? 'Stockfish'
  : `Vasos ${props.color === 'b' ? 'marrons' : 'cinzas'}`)
const playerLabel = computed(() => {
  if (props.mode === 'online') return `${props.color === props.onlineColor ? 'VOCÊ' : 'ADVERSÁRIO'} · VASOS ${props.color === 'b' ? 'MARRONS' : 'CINZAS'}`
  if (props.mode !== 'computer') return `JOGADOR ${props.color === 'b' ? '2' : '1'}`
  return isComputer.value ? 'MÁQUINA · VASOS MARRONS' : 'VOCÊ · VASOS CINZAS'
})
const activeLabel = computed(() => {
  if (props.mode === 'online' && props.color !== props.onlineColor) return 'VEZ DO ADVERSÁRIO'
  if (isComputer.value) return props.computerThinking ? 'STOCKFISH PENSANDO' : 'VEZ DA MÁQUINA'
  return 'SUA VEZ'
})
</script>

<template>
  <div class="flex items-center gap-[11px] px-[3px] py-[15px]">
    <div class="grid size-[37px] place-items-center rounded-full text-[19px]" :class="color === 'b' ? 'bg-[#f0dfc9] text-[#a56d42]' : 'bg-[#e4e5e2] text-[#626762]'">♟</div>
    <div>
      <strong class="block text-[12px]">{{ playerName }}</strong>
      <small class="mt-1 block text-[8px] font-bold tracking-[1.5px] text-[#a4ac9a]">{{ playerLabel }}</small>
    </div>
    <span v-if="active" class="ml-auto rounded-[16px] bg-[#e9f0e2] px-[10px] py-[8px] text-[8px] font-bold tracking-[1.5px] text-[#749369]">● &nbsp; {{ activeLabel }}</span>
  </div>
</template>
