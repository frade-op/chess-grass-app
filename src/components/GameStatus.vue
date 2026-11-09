<script setup>
defineProps({
  status: { type: String, required: true },
  moveCount: { type: Number, required: true },
  soundError: { type: String, default: '' },
})
defineEmits(['reset', 'undo'])
</script>

<template>
  <div class="rounded-lg border border-[#e1e9d8] bg-[#e9efdf] p-[23px]">
    <div class="flex items-center justify-between">
      <span class="text-[9px] font-bold tracking-[1.5px] text-[#96a68d]">A PARTIDA</span>
      <span class="text-[26px] text-[#a9bd9a]">✳</span>
    </div>
    <h2 class="mt-2 mb-[19px] font-serif text-[29px] leading-[1.08]">Um movimento<br /><em class="text-[#77916a]">de cada vez.</em></h2>
    <div class="flex items-center text-[12px] text-[#4a6743]">
      <span class="mr-[5px] inline-block size-[7px] rounded-full bg-[#8eae7a]"></span>
      <strong aria-live="polite">{{ status }}</strong>
    </div>
    <p class="mt-[9px] text-[11px] leading-[1.5] text-[#8a9b80]">Boas ideias precisam de tempo para criar raízes.</p>
    <div class="mt-[21px] flex gap-2">
      <button class="flex-1 cursor-pointer rounded-[5px] border border-[#496744] bg-[#496744] px-[10px] py-3 text-[11px] font-bold text-white hover:bg-[#395638]" type="button" @click="$emit('reset')"><span class="mr-[5px] text-[15px]">↻</span> Nova partida</button>
      <button class="flex-1 cursor-pointer rounded-[5px] border border-[#cad7c1] bg-transparent px-[10px] py-3 text-[11px] font-bold text-[#708268] disabled:cursor-not-allowed disabled:opacity-50" type="button" :disabled="!moveCount" @click="$emit('undo')"><span class="mr-[5px] text-[15px]">↶</span> Desfazer</button>
    </div>
    <p v-if="soundError" class="mt-[9px] text-[11px] leading-[1.5] text-[#9a4c36]" role="status">{{ soundError }}</p>
  </div>
</template>
