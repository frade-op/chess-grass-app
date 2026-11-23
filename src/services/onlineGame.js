import { initializeApp, getApps } from 'firebase/app'
import { connectAuthEmulator, getAuth, signInAnonymously } from 'firebase/auth'
import { connectDatabaseEmulator, getDatabase, onValue, ref, runTransaction, set } from 'firebase/database'
import { Chess } from 'chess.js'

const roomIdPattern = /^[a-f0-9]{32}$/
let emulatorsConnected = false

async function withSyncedRoom(roomRef, action) {
  let resolveInitial
  let rejectInitial
  const initial = new Promise((resolve, reject) => {
    resolveInitial = resolve
    rejectInitial = reject
  })
  const stop = onValue(roomRef, (snapshot) => resolveInitial(snapshot.val()), rejectInitial)
  try {
    return await action(await initial)
  } finally {
    stop()
  }
}

export function gameFromRoom(room) {
  if (!room || typeof room.host !== 'string' || typeof room.guest !== 'string'
    || typeof room.moves !== 'string' || typeof room.lastMove !== 'string'
    || !Number.isInteger(room.version) || !['w', 'b'].includes(room.turn)) {
    throw new Error('Os dados da sala são inválidos.')
  }

  const game = new Chess()
  const moves = room.moves === '' ? [] : room.moves.slice(1).split(' ')
  if ((room.moves !== '' && !room.moves.startsWith(' ')) || moves.length !== room.version
    || (moves.at(-1) ?? '') !== room.lastMove) {
    throw new Error('O histórico da sala é inválido.')
  }
  try {
    for (const move of moves) game.move(move)
  } catch {
    throw new Error('A sala contém um lance inválido.')
  }
  if (game.turn() !== room.turn) throw new Error('A vez da sala é inválida.')
  return game
}

function firebaseApp() {
  const env = import.meta.env
  const config = {
    apiKey: env?.VITE_FIREBASE_API_KEY,
    authDomain: env?.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env?.VITE_FIREBASE_PROJECT_ID,
    appId: env?.VITE_FIREBASE_APP_ID,
    databaseURL: env?.VITE_FIREBASE_DATABASE_URL,
  }
  if (Object.values(config).some((value) => !value)) {
    throw new Error('Configure o Firebase para jogar online. Consulte a documentação do projeto.')
  }
  return getApps()[0] ?? initializeApp(config)
}

export const onlineGameService = {
  async connect() {
    const app = firebaseApp()
    const auth = getAuth(app)
    const database = getDatabase(app)
    if (import.meta.env.DEV && import.meta.env.VITE_FIREBASE_USE_EMULATORS === 'true' && !emulatorsConnected) {
      connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
      connectDatabaseEmulator(database, '127.0.0.1', 9000)
      emulatorsConnected = true
    }
    await auth.authStateReady()
    const user = auth.currentUser ?? (await signInAnonymously(auth)).user
    return { uid: user.uid, database }
  },

  watchConnection(session, callback) {
    return onValue(ref(session.database, '.info/connected'), (snapshot) => callback(snapshot.val() === true))
  },

  async create(session) {
    const id = crypto.randomUUID().replaceAll('-', '')
    const room = { host: session.uid, guest: '', moves: '', lastMove: '', turn: 'w', version: 0 }
    await set(ref(session.database, `rooms/${id}`), room)
    return id
  },

  async join(session, id) {
    if (!roomIdPattern.test(id)) throw new Error('O convite é inválido.')
    const roomRef = ref(session.database, `rooms/${id}`)
    await withSyncedRoom(roomRef, async (room) => {
      if (!room) throw new Error('Sala não encontrada.')
      gameFromRoom(room)
      if (room.host === session.uid || room.guest === session.uid) return
      if (room.guest) throw new Error('A sala já tem dois jogadores.')

      const result = await runTransaction(roomRef, (current) => {
        if (!current || current.guest || current.host === session.uid) return
        return { ...current, guest: session.uid }
      }, { applyLocally: false })
      if (!result.committed) throw new Error('Não foi possível entrar na sala. Tente novamente.')
    })
  },

  watchRoom(session, id, callback, onError) {
    return onValue(ref(session.database, `rooms/${id}`), (snapshot) => callback(snapshot.val()), onError)
  },

  async move(session, id, room, move) {
    const roomRef = ref(session.database, `rooms/${id}`)
    await withSyncedRoom(roomRef, async () => {
      const result = await runTransaction(roomRef, (current) => {
        if (!current || current.version !== room.version || current.moves !== room.moves
          || current.turn !== room.turn || !current.guest
          || (current.turn === 'w' ? current.host : current.guest) !== session.uid) return
        const game = gameFromRoom(current)
        if (game.isGameOver()) return
        const played = game.move(move)
        return {
          ...current,
          moves: `${current.moves} ${played.san}`,
          lastMove: played.san,
          turn: game.turn(),
          version: current.version + 1,
        }
      }, { applyLocally: false })
      if (!result.committed) throw new Error('A partida mudou. Aguarde a sincronização e tente novamente.')
    })
  },
}
