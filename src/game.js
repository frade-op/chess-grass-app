import { Chess } from 'chess.js'

export const plants = {
  k: { name: 'Orquídea', role: 'Rei', file: 'orquidea' },
  q: { name: 'Jiboia', role: 'Rainha', file: 'jiboia' },
  b: { name: 'Samambaia', role: 'Bispo', file: 'samambaia' },
  n: { name: 'Cacto', role: 'Cavalo', file: 'cacto' },
  r: { name: 'Espada', role: 'Torre', file: 'espada' },
  p: { name: 'Suculenta', role: 'Peão', file: 'suculenta' },
}

export const sideName = (color) => color === 'w' ? 'Marrom' : 'Preto'

export function pieceImage(piece) {
  const suffix = piece.color === 'b' ? (piece.type === 'n' ? '-preto' : '-preta') : ''
  const file = `${plants[piece.type].file}${suffix}`
  return `${import.meta.env.BASE_URL}assets/pieces/${file}.png`
}

export function gameStatus(game) {
  if (game.isCheckmate()) return `Xeque-mate! ${sideName(game.turn() === 'w' ? 'b' : 'w')} venceu.`
  if (game.isStalemate()) return 'Empate por afogamento.'
  if (game.isThreefoldRepetition()) return 'Empate por repetição.'
  if (game.isInsufficientMaterial()) return 'Empate por material insuficiente.'
  if (game.isDraw()) return 'Partida empatada.'
  if (game.isCheck()) return `${sideName(game.turn())} está em xeque!`
  return `Vez de ${sideName(game.turn()).toLowerCase()}`
}

export function createGame() {
  return new Chess()
}
