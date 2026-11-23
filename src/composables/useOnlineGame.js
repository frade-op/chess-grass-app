import { computed, ref } from 'vue'
import { gameFromRoom, onlineGameService } from '../services/onlineGame.js'

export function useOnlineGame(service = onlineGameService) {
  const room = ref(null)
  const roomId = ref('')
  const uid = ref('')
  const connected = ref(false)
  const busy = ref(false)
  const error = ref('')
  const invalid = ref(false)
  let session = null
  let generation = 0
  let stopRoom
  let stopConnection

  const color = computed(() => room.value?.host === uid.value ? 'w' : room.value?.guest === uid.value ? 'b' : '')
  const canMove = computed(() => Boolean(room.value && room.value.guest && color.value
    && connected.value && !busy.value && !invalid.value && room.value.turn === color.value))
  const moves = computed(() => room.value?.moves ?? '')

  function leave() {
    generation++
    stopRoom?.()
    stopConnection?.()
    stopRoom = undefined
    stopConnection = undefined
    session = null
    room.value = null
    roomId.value = ''
    uid.value = ''
    connected.value = false
    busy.value = false
    error.value = ''
    invalid.value = false
  }

  async function start(inviteId = '') {
    leave()
    const request = generation
    busy.value = true
    try {
      const nextSession = await service.connect()
      if (request !== generation) return
      session = nextSession
      uid.value = session.uid
      stopConnection = service.watchConnection(session, (value) => { connected.value = value })
      const id = inviteId || await service.create(session)
      if (request !== generation) return
      if (inviteId) await service.join(session, id)
      if (request !== generation) return
      roomId.value = id
      stopRoom = service.watchRoom(session, id, (value) => {
        try {
          gameFromRoom(value)
          if (value.host !== uid.value && value.guest !== uid.value) throw new Error('Você não participa desta sala.')
          room.value = value
          if (invalid.value) error.value = ''
          invalid.value = false
        } catch (problem) {
          invalid.value = true
          error.value = problem.message
        }
      }, () => {
        invalid.value = true
        error.value = 'Não foi possível acompanhar a sala. Verifique a conexão e as regras do Firebase.'
      })
    } catch (problem) {
      if (request === generation) {
        error.value = problem instanceof Error && !problem.code
          ? problem.message
          : 'Não foi possível acessar a sala. Verifique o convite, a conexão e as regras do Firebase.'
      }
    } finally {
      if (request === generation) busy.value = false
    }
  }

  async function submitMove(move) {
    if (!canMove.value) return
    const request = generation
    busy.value = true
    error.value = ''
    try {
      await service.move(session, roomId.value, room.value, move)
    } catch (problem) {
      if (request === generation) {
        error.value = problem instanceof Error && !problem.code
          ? problem.message
          : 'Não foi possível enviar o lance. Verifique a conexão e tente novamente.'
      }
    } finally {
      if (request === generation) busy.value = false
    }
  }

  return { room, roomId, connected, busy, error, color, canMove, moves, start, leave, submitMove }
}
