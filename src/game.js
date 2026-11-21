import { Chess } from 'chess.js'

export const plants = {
  k: { name: 'Bromélia-imperador', role: 'Rei', file: 'rei' },
  q: { name: 'Samambaia', role: 'Rainha', file: 'rainha' },
  b: { name: 'Espada-de-São-Jorge', role: 'Bispo', file: 'bispo' },
  n: { name: 'Nolina pata de cavalo', role: 'Cavalo', file: 'cavalo' },
  r: { name: 'Cacto', role: 'Torre', file: 'torre' },
  p: { name: 'Suculenta', role: 'Peão', file: 'peao' },
}

// Image ratios and alpha-bound offsets normalize pot sizes and center each plant.
const pieceLayouts = {
  k: { w: { potWidth: 0.3225, aspectRatio: 1.0122, offset: [-0.013, 0.0193] }, b: { potWidth: 0.3306, aspectRatio: 1.0243, offset: [-0.0139, 0.0101] } },
  q: { w: { potWidth: 0.3358, aspectRatio: 0.8743, offset: [-0.0172, 0.0019] }, b: { potWidth: 0.3462, aspectRatio: 0.9365, offset: [-0.0154, 0.0048] } },
  b: { w: { potWidth: 0.3538, aspectRatio: 0.6028, offset: [-0.0016, -0.0049] }, b: { potWidth: 0.3531, aspectRatio: 0.6331, offset: [0.0031, -0.0128] } },
  n: { w: { potWidth: 0.3327, aspectRatio: 0.6022, offset: [0.0108, -0.0065] }, b: { potWidth: 0.3285, aspectRatio: 0.573, offset: [-0.0111, -0.0082] } },
  r: { w: { potWidth: 0.3423, aspectRatio: 0.8375, offset: [-0.0205, 0.001] }, b: { potWidth: 0.3352, aspectRatio: 0.8558, offset: [-0.0175, -0.0047] } },
  p: { w: { potWidth: 0.4096, aspectRatio: 0.609, offset: [-0.0044, 0.008] }, b: { potWidth: 0.3974, aspectRatio: 0.6753, offset: [-0.0135, -0.0013] } },
}

export const sideName = (color) => color === 'w' ? 'Marrom' : 'Amarelo'

export function pieceImage(piece) {
  const suffix = piece.color === 'b' ? (piece.type === 'r' ? '-amarela' : '-amarelo') : ''
  const file = `${plants[piece.type].file}${suffix}`
  return `${import.meta.env.BASE_URL}assets/pieces/v2/${file}.png`
}

export function pieceImageStyle(piece, potWidthPercent = 26) {
  const { potWidth, aspectRatio, offset: [x, y] } = pieceLayouts[piece.type][piece.color]
  const height = potWidthPercent / potWidth
  return {
    height: `${height}%`,
    width: `${height * aspectRatio}%`,
    transform: `translate(${-x * 100}%, ${-y * 100}%)`,
  }
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
