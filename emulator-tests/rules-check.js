import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing'
import { get, ref, set } from 'firebase/database'
import { onlineGameService } from '../src/services/onlineGame.js'

test('regras e serviço protegem sala, participantes, vez e histórico', async () => {
  const environment = await initializeTestEnvironment({
    projectId: 'demo-chess-grass',
    database: { rules: await readFile(new URL('../database.rules.json', import.meta.url), 'utf8') },
  })

  try {
    const host = { uid: 'host', database: environment.authenticatedContext('host').database() }
    const guest = { uid: 'guest', database: environment.authenticatedContext('guest').database() }
    const outsider = { uid: 'outsider', database: environment.authenticatedContext('outsider').database() }
    const anonymous = environment.unauthenticatedContext().database()
    const id = await onlineGameService.create(host)
    const path = `rooms/${id}`
    await assertFails(get(ref(anonymous, path)))
    await assertFails(get(ref(host.database, 'rooms')))

    await onlineGameService.join(guest, id)
    const joined = (await get(ref(host.database, path))).val()
    assert.equal(joined.guest, 'guest')
    await assertFails(get(ref(outsider.database, path)))
    await assert.rejects(onlineGameService.join(outsider, id))

    await assertFails(set(ref(guest.database, path), {
      ...joined, moves: ' e5', lastMove: 'e5', turn: 'b', version: 1,
    }))
    await assertFails(set(ref(host.database, path), { ...joined, guest: 'outsider' }))
    await assertFails(set(ref(host.database, path), null))
    await assertFails(set(ref(host.database, path), {
      ...joined, moves: ' e4', lastMove: 'e4', turn: 'b', version: 1, extra: true,
    }))

    await onlineGameService.move(host, id, joined, { from: 'e2', to: 'e4', promotion: 'q' })
    const afterWhite = (await get(ref(guest.database, path))).val()
    assert.equal(afterWhite.moves, ' e4')
    assert.equal(afterWhite.turn, 'b')
    await assertFails(set(ref(host.database, path), {
      ...afterWhite, moves: ' e4 e5', lastMove: 'e5', turn: 'w', version: 2,
    }))
    await assertFails(set(ref(guest.database, path), {
      ...afterWhite, moves: ' d4 e5', lastMove: 'e5', turn: 'w', version: 2,
    }))
    await onlineGameService.move(guest, id, afterWhite, { from: 'e7', to: 'e5', promotion: 'q' })
    const afterBlack = (await get(ref(host.database, path))).val()
    assert.equal(afterBlack.moves, ' e4 e5')
    assert.equal(afterBlack.turn, 'w')
    await assert.rejects(onlineGameService.move(host, id, joined, { from: 'd2', to: 'd4' }), /partida mudou/)
    await assertSucceeds(get(ref(guest.database, path)))
  } finally {
    await environment.cleanup()
  }
})

test('dois convidados concorrentes não ocupam a mesma sala', async () => {
  const environment = await initializeTestEnvironment({
    projectId: 'demo-chess-grass',
    database: { rules: await readFile(new URL('../database.rules.json', import.meta.url), 'utf8') },
  })
  try {
    const host = { uid: 'host2', database: environment.authenticatedContext('host2').database() }
    const first = { uid: 'first', database: environment.authenticatedContext('first').database() }
    const second = { uid: 'second', database: environment.authenticatedContext('second').database() }
    const id = await onlineGameService.create(host)
    const results = await Promise.allSettled([
      onlineGameService.join(first, id),
      onlineGameService.join(second, id),
    ])
    assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1)
    const room = (await get(ref(host.database, `rooms/${id}`))).val()
    assert.ok(['first', 'second'].includes(room.guest))
  } finally {
    await environment.cleanup()
  }
})
