<script setup>
defineProps({ color: { type: String, required: true }, active: Boolean })
</script>

<template>
  <div class="flex items-center gap-[11px] px-[3px] py-[15px]">
    <div class="grid size-[37px] place-items-center rounded-full text-[19px]" :class="color === 'b' ? 'bg-[#f5e4ae] text-[#9c6a19]' : 'bg-[#f0dfc9] text-[#a56d42]'">♟</div>
    <div>
      <strong class="block text-[12px]">Vasos {{ color === 'b' ? 'amarelos' : 'marrons' }}</strong>
      <small class="mt-1 block text-[8px] font-bold tracking-[1.5px] text-[#a4ac9a]">JOGADOR {{ color === 'b' ? '2' : '1' }}</small>
    </div>
    <span v-if="active" class="ml-auto rounded-[16px] bg-[#e9f0e2] px-[10px] py-[8px] text-[8px] font-bold tracking-[1.5px] text-[#749369]">● &nbsp; SUA VEZ</span>
  </div>
</template>
