<script setup>
import { pieceImage, plants } from '../game.js'

defineProps({ promotion: { type: Object, required: true } })
defineEmits(['choose', 'cancel'])
</script>

<template>
  <div class="fixed inset-0 z-10 grid place-items-center bg-[#1d2b20a8] p-5" @click.self="$emit('cancel')">
    <div class="w-[min(460px,100%)] rounded-lg bg-[#fffef9] p-7 shadow-[0_12px_40px_#17231b55]" role="dialog" aria-modal="true" aria-labelledby="promotion-title">
      <span class="text-[9px] font-bold tracking-[1.5px] text-[#96a68d]">UMA NOVA FASE</span>
      <h2 id="promotion-title" class="my-2 font-serif text-[28px]">Sua suculenta floresceu<span class="text-[#d29a5b]">.</span></h2>
      <p class="text-[12px] text-[#899082]">Escolha uma planta para promover seu peão.</p>
      <div class="mt-5 grid grid-cols-4 gap-2">
        <button v-for="type in ['q', 'r', 'b', 'n']" :key="type" class="cursor-pointer rounded-[5px] border border-[#e2e9da] bg-[#f1f4ea] px-1 py-2 text-[#293a28] hover:border-[#809d72]" type="button" @click="$emit('choose', type)">
          <img class="h-[75px] w-full object-contain" :src="pieceImage({ type, color: promotion.color })" alt="" />
          <strong class="block text-[10px]">{{ plants[type].name }}</strong>
          <small class="mt-1 block text-[10px] text-[#8b9b84]">{{ plants[type].role }}</small>
        </button>
      </div>
      <button class="mx-auto mt-5 block cursor-pointer border-0 bg-transparent text-[12px] text-[#758b6d]" type="button" @click="$emit('cancel')">Cancelar</button>
    </div>
  </div>
</template>
