<script setup>
import { onMounted, ref } from 'vue'

defineProps({ winner: { type: String, required: true }, online: Boolean })
defineEmits(['dismiss', 'reset'])

const dialog = ref(null)
onMounted(() => dialog.value.showModal())
</script>

<template>
  <dialog
    ref="dialog"
    class="m-auto w-[min(500px,calc(100%-40px))] rounded-lg border-0 bg-[#fffef9] p-8 shadow-[0_12px_40px_#17231b55] backdrop:bg-[#1d2b20a8] max-[480px]:p-6"
    aria-labelledby="checkmate-title"
    aria-describedby="checkmate-description"
    @cancel.prevent="$emit('dismiss')"
    @keydown.esc.stop.prevent="$emit('dismiss')"
  >
    <span class="text-[9px] font-bold tracking-[1.5px] text-[#849976]">FIM DA PARTIDA</span>
    <h2 id="checkmate-title" class="mt-3 font-serif text-[clamp(32px,6vw,46px)] leading-[1.08] tracking-[-1px]">
      Xeque-mate<span class="text-[#819b72]">!</span>
    </h2>
    <p id="checkmate-description" class="mt-4 text-[13px] leading-[1.7] text-[#899082]">
      {{ winner }} venceu a partida.
    </p>
    <div class="mt-7 grid grid-cols-2 gap-3 max-[480px]:grid-cols-1">
      <button
        v-if="!online"
        class="cursor-pointer rounded-[5px] border border-[#526a4c] bg-[#526a4c] px-4 py-3 text-[12px] font-semibold text-white hover:bg-[#40553c]"
        type="button"
        @click="$emit('reset')"
      >
        Nova partida
      </button>
      <button
        class="cursor-pointer rounded-[5px] border border-[#dce5d6] bg-[#f8faf2] px-4 py-3 text-[12px] font-semibold text-[#526a4c] hover:border-[#9cac91]"
        type="button"
        autofocus
        @click="$emit('dismiss')"
      >
        Ver tabuleiro
      </button>
    </div>
  </dialog>
</template>
