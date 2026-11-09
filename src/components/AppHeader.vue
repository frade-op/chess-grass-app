<script setup>
defineProps({ soundEnabled: Boolean })
defineEmits(['toggle-sound'])
</script>

<template>
  <header class="flex h-[76px] items-center justify-between border-b border-[#e8eadf] bg-[#fffef9] px-[max(5%,calc((100%_-_1370px)_/_2))] max-[680px]:h-[65px]">
    <a class="flex items-center gap-[9px] font-serif text-[23px] tracking-[-.8px] text-[#243f2b] no-underline max-[680px]:text-[20px]" href="#" aria-label="Jardim de Xadrez, início">
      <span class="grid size-[31px] place-items-center rounded-full bg-[#405d3c] font-sans text-[23px] text-[#f7f5e8]">✳</span>
      <span>jardim<span class="font-normal italic text-[#78906b]">de</span>xadrez<span class="text-[#d29a5b]">.</span></span>
    </a>
    <div class="flex items-center gap-[25px]">
      <span class="text-[9px] font-bold tracking-[1.5px] text-[#929b88] max-[900px]:hidden">UM JOGO PARA FLORESCER</span>
      <button class="cursor-pointer rounded-[22px] border border-[#e4e9dc] bg-transparent px-[14px] py-[9px] text-[11px] text-[#526a4c]" type="button" :aria-label="soundEnabled ? 'Desativar som' : 'Ativar som'" @click="$emit('toggle-sound')">
        <span class="pr-[5px] text-[15px]" aria-hidden="true">{{ soundEnabled ? '♪' : '♫' }}</span>
        <span>{{ soundEnabled ? 'Som ligado' : 'Som desligado' }}</span>
      </button>
    </div>
  </header>
</template>
