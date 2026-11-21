<script setup>
import { ref } from 'vue'
import PieceTutorial from './PieceTutorial.vue'

defineEmits(['dismiss'])

const tutorialVisible = ref(false)
</script>

<template>
  <PieceTutorial
    v-if="tutorialVisible"
    @back="tutorialVisible = false"
    @dismiss="$emit('dismiss')"
  />
  <div v-else class="fixed inset-0 z-30 grid place-items-center bg-[#1d2b20a8] p-5">
    <section
      class="w-[min(500px,100%)] rounded-lg bg-[#fffef9] p-8 shadow-[0_12px_40px_#17231b55] max-[480px]:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
      aria-describedby="welcome-description"
    >
      <span class="text-[9px] font-bold tracking-[1.5px] text-[#849976]">UM JOGO DA NATUREZA</span>
      <h1 id="welcome-title" class="mt-3 font-serif text-[clamp(32px,6vw,46px)] leading-[1.08] tracking-[-1px]">
        Onde a estratégia <em class="text-[#819b72]">floresce.</em>
      </h1>
      <p id="welcome-description" class="mt-4 text-[13px] leading-[1.7] text-[#899082]">
        Um clássico em uma nova estação. Cultive suas ideias, planeje seus movimentos e deixe o jogo crescer.
      </p>
      <div class="mt-7 grid grid-cols-2 gap-3 max-[480px]:grid-cols-1">
        <button
          class="cursor-pointer rounded-[5px] border border-[#526a4c] bg-[#526a4c] px-4 py-3 text-[12px] font-semibold text-white hover:bg-[#40553c]"
          type="button"
          @click="tutorialVisible = true"
        >
          Ver tutorial
        </button>
        <button
          class="cursor-pointer rounded-[5px] border border-[#dce5d6] bg-[#f8faf2] px-4 py-3 text-[12px] font-semibold text-[#526a4c] hover:border-[#9cac91]"
          type="button"
          autofocus
          @click="$emit('dismiss')"
        >
          Sei o que estou fazendo
        </button>
      </div>
    </section>
  </div>
</template>
