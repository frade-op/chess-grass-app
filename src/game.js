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
  k: { w: { potWidth: 0.3225, aspectRatio: 1.0122, offset: [-0.013, 0.0193] }, b: { potWidth: 0.3818, aspectRatio: 0.9438, offset: [-0.0185, 0.0184] } },
  q: { w: { potWidth: 0.3358, aspectRatio: 0.8743, offset: [-0.0172, 0.0019] }, b: { potWidth: 0.3482, aspectRatio: 0.9246, offset: [-0.0126, -0.0039] } },
  b: { w: { potWidth: 0.3538, aspectRatio: 0.6028, offset: [-0.0016, -0.0049] }, b: { potWidth: 0.3477, aspectRatio: 0.6211, offset: [-0.0157, -0.002] } },
  n: { w: { potWidth: 0.3327, aspectRatio: 0.6022, offset: [0.0108, -0.0065] }, b: { potWidth: 0.3333, aspectRatio: 0.6315, offset: [-0.0059, -0.0157] } },
  r: { w: { potWidth: 0.3423, aspectRatio: 0.8375, offset: [-0.0205, 0.001] }, b: { potWidth: 0.3397, aspectRatio: 0.7324, offset: [0, -0.0066] } },
  p: { w: { potWidth: 0.4504, aspectRatio: 0.8524, offset: [-0.0209, 0.0038], scale: 1.045 }, b: { potWidth: 0.4504, aspectRatio: 0.8524, offset: [-0.0209, 0.0038] } },
}

export const sideName = (color) => color === 'w' ? 'Cinza' : 'Marrom'

export function pieceImage(piece) {
  const suffix = piece.color === 'w' ? '-cinza' : ''
  const file = `${plants[piece.type].file}${suffix}`
  return `${import.meta.env.BASE_URL}assets/pieces/v2/${file}.png`
}

export function pieceImageStyle(piece, potWidthPercent = 26) {
  const { potWidth, aspectRatio, offset: [x, y], scale = 1 } = pieceLayouts[piece.type][piece.color]
  const height = potWidthPercent / potWidth * scale
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
