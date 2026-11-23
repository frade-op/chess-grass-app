<script setup>
import { onMounted, ref } from 'vue'

defineEmits(['dismiss'])

const dialog = ref(null)
onMounted(() => dialog.value.showModal())
</script>

<template>
  <dialog
    ref="dialog"
    class="m-auto w-[min(500px,calc(100%-40px))] rounded-lg border-0 bg-[#fffef9] p-8 shadow-[0_12px_40px_#17231b55] backdrop:bg-[#1d2b20a8] max-[480px]:p-6"
    aria-labelledby="roadmap-title"
    aria-describedby="roadmap-description"
    @cancel.prevent="$emit('dismiss')"
    @keydown.esc.stop.prevent="$emit('dismiss')"
  >
    <span class="text-[9px] font-bold tracking-[1.5px] text-[#849976]">O JARDIM CONTINUA CRESCENDO</span>
    <h2 id="roadmap-title" class="mt-3 font-serif text-[clamp(32px,6vw,46px)] leading-[1.08] tracking-[-1px]">
      Próximos passos<span class="text-[#d29a5b]">.</span>
    </h2>
    <p id="roadmap-description" class="mt-4 text-[13px] leading-[1.7] text-[#65705d]">
      Ideias para o futuro do Jardim Xadrez:
    </p>
    <ul class="mt-3 list-disc space-y-2 pl-5 text-[13px] leading-[1.7] text-[#65705d]">
      <li>Aprimorar as partidas online entre jogadores.</li>
      <li>Criar uma nova variante de xadrez envolvendo plantas.</li>
      <li>Quem sabe, desenvolver um aplicativo para celular.</li>
    </ul>
    <button
      class="mt-7 cursor-pointer rounded-[5px] border border-[#526a4c] bg-[#526a4c] px-4 py-3 text-[12px] font-semibold text-white hover:bg-[#40553c]"
      type="button"
      autofocus
      @click="$emit('dismiss')"
    >
      Fechar
    </button>
  </dialog>
</template>
