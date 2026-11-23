<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  room: { type: Object, default: null },
  roomId: { type: String, default: '' },
  color: { type: String, default: '' },
  connected: Boolean,
  busy: Boolean,
  error: { type: String, default: '' },
})
const emit = defineEmits(['create'])
const copyMessage = ref('')
const inviteUrl = computed(() => {
  if (!props.roomId) return ''
  const url = new URL(window.location.href)
  url.searchParams.set('sala', props.roomId)
  return url.href
})

async function copyInvite() {
  try {
    await navigator.clipboard.writeText(inviteUrl.value)
    copyMessage.value = 'Link copiado.'
  } catch {
    copyMessage.value = 'Não foi possível copiar. Selecione o link abaixo e copie manualmente.'
  }
}
</script>

<template>
  <section class="rounded-lg border border-[#e5e9dd] bg-[#fffef9] p-[22px]" aria-labelledby="online-title">
    <h3 id="online-title" class="font-serif text-[23px]">Partida online<span class="text-[#d29a5b]">.</span></h3>
    <p v-if="busy" class="mt-3 text-[11px] text-[#708268]" role="status">Conectando ou sincronizando...</p>
    <template v-if="room">
      <p class="mt-3 text-[11px] leading-[1.5] text-[#65705d]">
        Você joga com os vasos {{ color === 'w' ? 'cinzas' : 'marrons' }}.
        {{ !connected ? 'Sem conexão. Aguarde a reconexão.' : room.guest ? 'A sala tem dois jogadores.' : 'Aguardando outro jogador.' }}
      </p>
      <label for="invite-link" class="mt-3 block text-[10px] font-semibold text-[#526a4c]">Link de convite</label>
      <input id="invite-link" :value="inviteUrl" readonly class="mt-1 w-full rounded border border-[#dce5d6] bg-[#f8faf2] p-2 text-[10px] text-[#526a4c]" @focus="$event.target.select()" />
      <button type="button" class="mt-2 cursor-pointer text-[11px] font-bold text-[#526a4c] underline" @click="copyInvite">Copiar link</button>
      <p v-if="copyMessage" class="mt-1 text-[10px] text-[#65705d]" role="status">{{ copyMessage }}</p>
      <p class="mt-3 text-[10px] leading-[1.5] text-[#899082]">Compartilhe o link apenas com quem vai jogar. Não é possível desfazer lances online.</p>
    </template>
    <button v-else-if="!busy" type="button" class="mt-3 cursor-pointer rounded-[5px] bg-[#526a4c] px-4 py-3 text-[11px] font-semibold text-white" @click="emit('create')">
      Criar sala
    </button>
    <p v-if="error" class="mt-3 rounded-[5px] bg-[#fbefea] p-3 text-[11px] leading-[1.5] text-[#9a4c36]" role="alert">{{ error }}</p>
  </section>
</template>
