<script setup>
import { pieceImage, pieceImageStyle, plants } from '../game.js'

const pieceOrder = ['k', 'q', 'b', 'n', 'r', 'p']
defineEmits(['select-piece'])
</script>

<template>
  <div class="rounded-lg border border-[#e5e9dd] bg-[#fffef9] p-[22px]">
    <div class="flex items-center justify-between">
      <div>
        <span class="text-[9px] font-bold tracking-[1.5px] text-[#96a68d]">CONHEÇA AS PEÇAS</span>
        <h3 class="mt-[5px] font-serif text-[23px]">O seu jardim<span class="text-[#d29a5b]">.</span></h3>
      </div>
      <span class="text-[25px] text-[#c4d2ba]">✳</span>
    </div>
    <div class="mt-5 grid grid-cols-2 gap-x-2 gap-y-[14px]">
      <button
        v-for="type in pieceOrder"
        :key="type"
        class="flex min-w-0 cursor-pointer items-center gap-2 rounded-[5px] border border-transparent text-left hover:border-[#dce5d6] hover:bg-[#f8faf2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#819b72]"
        type="button"
        aria-haspopup="dialog"
        :aria-label="`Aprenda sobre ${plants[type].role}: ${plants[type].name}`"
        @click="$emit('select-piece', type)"
      >
        <div class="grid size-[50px] shrink-0 place-items-center rounded-[5px] bg-[#f1f3e9]">
          <img class="pointer-events-none min-h-0 min-w-0 max-h-[88%] max-w-[88%] self-center justify-self-center object-contain" :style="pieceImageStyle({ type, color: 'w' }, 27)" :src="pieceImage({ type, color: 'w' })" alt="" />
        </div>
        <div class="min-w-0">
          <strong class="block text-[10px]">{{ plants[type].role }}</strong>
          <small class="mt-1 block text-[10px] text-[#a3ac9b]">{{ plants[type].name }}</small>
        </div>
      </button>
    </div>
  </div>
</template>
