<script setup>
import { pieceImage, plants } from '../game.js'

const pieceOrder = ['k', 'q', 'b', 'n', 'r', 'p']
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
      <div v-for="type in pieceOrder" :key="type" class="flex min-w-0 items-center gap-2">
        <div class="grid size-[43px] shrink-0 place-items-center rounded-[5px] bg-[#f1f3e9]">
          <img class="size-[90%] object-contain" :src="pieceImage({ type, color: 'w' })" alt="" />
        </div>
        <div>
          <strong class="block text-[10px]">{{ plants[type].role }}</strong>
          <small class="mt-1 block text-[10px] text-[#a3ac9b]">{{ plants[type].name }}</small>
        </div>
      </div>
    </div>
  </div>
</template>
