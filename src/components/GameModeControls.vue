<script setup>
import { engineDifficulties } from '../services/chessEngine.js'
import stockfishLicenseUrl from 'stockfish/Copying.txt?url'

defineProps({
  mode: { type: String, required: true },
  difficulty: { type: String, required: true },
  thinking: Boolean,
  error: { type: String, default: '' },
})
defineEmits(['select-mode', 'select-difficulty', 'retry'])
</script>

<template>
  <section class="rounded-lg border border-[#e5e9dd] bg-[#fffef9] p-[22px]" aria-labelledby="game-mode-title">
    <span class="text-[9px] font-bold tracking-[1.5px] text-[#96a68d]">ESCOLHA COMO JOGAR</span>
    <h3 id="game-mode-title" class="mt-[5px] font-serif text-[23px]">Modo de jogo<span class="text-[#d29a5b">.</span></h3>
    <div class="mt-4 grid grid-cols-2 gap-2" role="group" aria-label="Modo de jogo">
      <button
        class="cursor-pointer rounded-[5px] border px-3 py-2.5 text-[11px] font-semibold"
        :class="mode === 'local' ? 'border-[#526a4c] bg-[#526a4c] text-white' : 'border-[#dce5d6] bg-[#f8faf2] text-[#526a4c] hover:border-[#9cac91]'"
        type="button"
        :aria-pressed="mode === 'local'"
        @click="$emit('select-mode', 'local')"
      >
        Local
      </button>
      <button
        class="cursor-pointer rounded-[5px] border px-3 py-2.5 text-[11px] font-semibold"
        :class="mode === 'computer' ? 'border-[#526a4c] bg-[#526a4c] text-white' : 'border-[#dce5d6] bg-[#f8faf2] text-[#526a4c] hover:border-[#9cac91]'"
        type="button"
        :aria-pressed="mode === 'computer'"
        @click="$emit('select-mode', 'computer')"
      >
        Contra Stockfish
      </button>
      <button
        class="col-span-2 cursor-pointer rounded-[5px] border px-3 py-2.5 text-[11px] font-semibold"
        :class="mode === 'online' ? 'border-[#526a4c] bg-[#526a4c] text-white' : 'border-[#dce5d6] bg-[#f8faf2] text-[#526a4c] hover:border-[#9cac91]'"
        type="button"
        :aria-pressed="mode === 'online'"
        @click="$emit('select-mode', 'online')"
      >
        Jogar online
      </button>
    </div>

    <template v-if="mode === 'computer'">
      <p class="mt-3 text-[10px] leading-[1.5] text-[#899082]">Você joga com os vasos cinzas; Stockfish joga com os marrons.</p>
      <span class="mt-4 block text-[9px] font-bold tracking-[1.5px] text-[#96a68d]">NÍVEL DO STOCKFISH</span>
      <div class="mt-2 grid grid-cols-3 gap-2" role="group" aria-label="Dificuldade da máquina">
        <button
          v-for="([level, settings]) in Object.entries(engineDifficulties)"
          :key="level"
          class="cursor-pointer rounded-[5px] border px-2 py-2 text-[10px] font-semibold"
          :class="difficulty === level ? 'border-[#d4a65f] bg-[#fbf2df] text-[#795a32]' : 'border-[#e5e9dd] bg-white text-[#7d8776] hover:border-[#d4a65f]'"
          type="button"
          :aria-pressed="difficulty === level"
          @click="$emit('select-difficulty', level)"
        >
          {{ settings.label }}
        </button>
      </div>
      <p v-if="difficulty === 'easy'" class="mt-2 text-[9px] leading-[1.5] text-[#a3ac9b]">No fácil, a máquina às vezes escolhe lances aleatórios para dar mais chances a você.</p>
      <p v-if="thinking" class="mt-3 text-[11px] font-semibold text-[#708268]" role="status" aria-live="polite">
        <span class="mr-1 inline-block animate-pulse">●</span> Stockfish está pensando...
      </p>
      <div v-else-if="error" class="mt-3 rounded-[5px] bg-[#fbefea] p-3 text-[11px] leading-[1.5] text-[#9a4c36]" role="alert">
        <p>{{ error }}</p>
        <button class="mt-2 cursor-pointer font-bold underline" type="button" @click="$emit('retry')">Tentar novamente</button>
      </div>
      <p v-else class="mt-3 text-[9px] leading-[1.5] text-[#a3ac9b]">Trocar o nível durante a partida não reinicia o tabuleiro.</p>
      <p class="mt-3 text-[9px] leading-[1.5] text-[#7d8776]">
        Stockfish 19:
        <a class="underline" :href="stockfishLicenseUrl" target="_blank" rel="noopener noreferrer">licença GPL-3.0</a>
        · <a class="underline" href="https://github.com/nmrugg/stockfish.js/tree/v19.0.1" target="_blank" rel="noopener noreferrer">código-fonte</a>
      </p>
    </template>
    <p v-else class="mt-3 text-[9px] leading-[1.5] text-[#a3ac9b]">Trocar de modo inicia uma nova partida.</p>
  </section>
</template>
