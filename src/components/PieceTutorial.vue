<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { pieceImage, pieceImageStyle, plants } from '../game.js'

const props = defineProps({
  pieceType: { type: String, default: null },
})
const emit = defineEmits(['back', 'dismiss'])

const boardSize = 7
const startByType = {
  p: { row: 5, col: 3 },
  r: { row: 3, col: 3 },
  n: { row: 3, col: 3 },
  q: { row: 3, col: 3 },
  k: { row: 3, col: 3 },
  b: { row: 3, col: 3 },
}

function rayMoves(start, directions) {
  return directions.flatMap(([rowStep, colStep]) => {
    const destinations = []
    let row = start.row + rowStep
    let col = start.col + colStep

    while (row >= 0 && row < boardSize && col >= 0 && col < boardSize) {
      destinations.push({ row, col })
      row += rowStep
      col += colStep
    }

    return destinations
  })
}

const straightDirections = [[-1, 0], [1, 0], [0, -1], [0, 1]]
const diagonalDirections = [[-1, -1], [-1, 1], [1, -1], [1, 1]]
const kingMoves = [...straightDirections, ...diagonalDirections]
  .map(([row, col]) => ({ row: 3 + row, col: 3 + col }))
const knightMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]]
  .map(([row, col]) => ({ row: 3 + row, col: 3 + col }))

const pieces = [
  {
    type: 'p',
    reason: 'A suculenta é comum e pequena, como o peão, a peça mais simples e numerosa.',
    movement: 'Avança uma casa. No primeiro movimento, pode avançar duas; captura na diagonal.',
    destinations: [{ row: 4, col: 3 }, { row: 3, col: 3 }],
    example: { row: 4, col: 3 },
  },
  {
    type: 'r',
    reason: 'O cacto é forte e sabe se defender, como a torre, que avança em linhas retas.',
    movement: 'Desliza quantas casas quiser na horizontal ou vertical. Não salta outras peças.',
    destinations: rayMoves(startByType.r, straightDirections),
    example: { row: 3, col: 0 },
  },
  {
    type: 'n',
    reason: 'Nolina pata de cavalo: a relação está no próprio nome.',
    movement: 'Avança em “L”: duas casas numa direção e uma de lado. Pode saltar outras peças.',
    destinations: knightMoves,
    example: { row: 1, col: 2 },
  },
  {
    type: 'q',
    reason: 'A samambaia é expansiva, como a rainha, que alcança muitas direções.',
    movement: 'Desliza quantas casas quiser na horizontal, vertical ou diagonal. Não salta outras peças.',
    destinations: rayMoves(startByType.q, [...straightDirections, ...diagonalDirections]),
    example: { row: 0, col: 0 },
  },
  {
    type: 'k',
    reason: 'Bromélia-imperador: o nome imponente combina com a peça mais importante.',
    movement: 'Move-se uma casa em qualquer direção. O rei não pode se colocar em xeque.',
    destinations: kingMoves,
    example: { row: 2, col: 3 },
  },
  {
    type: 'b',
    reason: 'Espada-de-São-Jorge: escolhi pela referência a São Jorge e sua espada.',
    movement: 'Desliza quantas casas quiser na diagonal. Não salta outras peças.',
    destinations: rayMoves(startByType.b, diagonalDirections),
    example: { row: 0, col: 0 },
  },
]
const tutorialPieces = computed(() => props.pieceType
  ? pieces.filter((piece) => piece.type === props.pieceType)
  : pieces)

const cells = Array.from({ length: boardSize * boardSize }, (_, index) => ({
  row: Math.floor(index / boardSize),
  col: index % boardSize,
}))
const animationFrame = ref(0)
const movementSubject = {
  p: 'o peão',
  r: 'a torre',
  n: 'o cavalo',
  q: 'a rainha',
  k: 'o rei',
  b: 'o bispo',
}
const tutorialIndex = ref(0)
const isMovement = computed(() => tutorialIndex.value % 2 === 1)
const pieceIndex = computed(() => Math.floor(tutorialIndex.value / 2))
const currentPiece = computed(() => tutorialPieces.value[pieceIndex.value])
const currentPlant = computed(() => plants[currentPiece.value.type])
const movementPath = computed(() => currentPiece.value.type === 'n'
  ? [startByType.n, { row: 1, col: 3 }, currentPiece.value.example, { row: 1, col: 3 }, startByType.n]
  : [startByType[currentPiece.value.type], currentPiece.value.example])
const position = computed(() => movementPath.value[animationFrame.value])
const positionStyle = computed(() => ({
  left: `${(position.value.col / boardSize) * 100}%`,
  top: `${(position.value.row / boardSize) * 100}%`,
}))
const pieceProgress = computed(() => `Peça ${pieceIndex.value + 1} de ${tutorialPieces.value.length}`)
const slideTitle = computed(() => isMovement.value
  ? `Como se move ${movementSubject[currentPiece.value.type]}`
  : 'A peça e sua planta')
const nextLabel = computed(() => {
  if (tutorialIndex.value === tutorialPieces.value.length * 2 - 1) {
    return props.pieceType ? 'Concluir' : 'Concluir tutorial'
  }
  return isMovement.value ? 'Próxima peça' : 'Ver movimento'
})

function hasDestination(row, col) {
  return currentPiece.value.destinations.some((square) => square.row === row && square.col === col)
}

function goBack() {
  if (tutorialIndex.value === 0) emit('back')
  else tutorialIndex.value -= 1
}

function goNext() {
  if (tutorialIndex.value === tutorialPieces.value.length * 2 - 1) emit('dismiss')
  else tutorialIndex.value += 1
}

watch(tutorialIndex, () => {
  animationFrame.value = 0
})

let animationTimer

onMounted(() => {
  animationTimer = window.setInterval(() => {
    if (isMovement.value) animationFrame.value = (animationFrame.value + 1) % movementPath.value.length
  }, 700)
})

onUnmounted(() => {
  window.clearInterval(animationTimer)
})
</script>

<template>
  <div class="fixed inset-0 z-30 grid place-items-center bg-[#1d2b20a8] p-4">
    <section
      class="piece-tutorial-dialog max-h-[96vh] w-[min(560px,100%)] overflow-y-auto rounded-lg bg-[#fffef9] p-6 shadow-[0_12px_40px_#17231b55] max-[480px]:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="piece-tutorial-title"
      aria-describedby="piece-tutorial-description"
    >
      <header class="flex items-start justify-between gap-4">
        <div class="min-w-0 flex-1">
          <div class="flex items-center justify-between gap-3">
            <span class="text-[9px] font-bold tracking-[1.5px] text-[#849976]">{{ pieceProgress }}</span>
            <span class="text-[9px] font-bold tracking-[1.5px] text-[#a3ac9b]">{{ isMovement ? 'MOVIMENTO' : 'ASSOCIAÇÃO' }}</span>
          </div>
          <div class="mt-2 h-1 overflow-hidden rounded-full bg-[#edf0e7]">
            <div
              class="h-full rounded-full bg-[#819b72] transition-[width] duration-300"
              :style="{ width: `${((tutorialIndex + 1) / (tutorialPieces.length * 2)) * 100}%` }"
            ></div>
          </div>
          <h2 id="piece-tutorial-title" class="tutorial-title mt-4 font-serif text-[27px] leading-tight">{{ slideTitle }}<span class="text-[#d29a5b">.</span></h2>
        </div>
        <button
          class="grid size-8 shrink-0 cursor-pointer place-items-center rounded-full text-[20px] leading-none text-[#899082] hover:bg-[#f1f3e9]"
          type="button"
          aria-label="Sair do tutorial"
          @click="emit('dismiss')"
        >
          ×
        </button>
      </header>

      <template v-if="!isMovement">
        <div :key="tutorialIndex" class="tutorial-comparison mt-5 grid grid-cols-[1fr_76px_1fr] items-center gap-2">
          <div class="tutorial-comparison-piece tutorial-comparison-piece--traditional grid justify-items-center text-center">
            <div class="tutorial-comparison-tile grid size-[104px] place-items-center rounded-lg bg-[#f1f3e9] max-[380px]:size-[88px]">
              <span class="font-serif text-[76px] leading-none text-[#473b2d] max-[380px]:text-[66px]" aria-hidden="true">
                {{ { p: '♟', r: '♜', n: '♞', q: '♛', k: '♚', b: '♝' }[currentPiece.type] }}
              </span>
            </div>
            <span class="mt-2 text-[10px] font-semibold text-[#899082]">Peça tradicional</span>
          </div>
          <svg
            class="tutorial-comparison-arrow mx-auto w-full max-w-[76px] text-[#819b72]"
            viewBox="0 0 100 24"
            fill="none"
            aria-hidden="true"
          >
            <path d="M4 12h92M4 12l8-7M4 12l8 7M96 12l-8-7M96 12l-8 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <div class="tutorial-comparison-piece tutorial-comparison-piece--plant grid justify-items-center text-center">
            <div class="tutorial-comparison-tile grid size-[104px] place-items-center rounded-lg bg-[#f1f3e9] max-[380px]:size-[88px]">
              <img
                class="pointer-events-none min-h-0 min-w-0 max-h-[88%] max-w-[88%] object-contain"
                :style="pieceImageStyle({ type: currentPiece.type, color: 'w' }, 27)"
                :src="pieceImage({ type: currentPiece.type, color: 'w' })"
                :alt="currentPlant.name"
              />
            </div>
            <span class="mt-2 max-w-full text-[10px] font-semibold leading-tight text-[#899082]">{{ currentPlant.name }}</span>
          </div>
        </div>
        <p id="piece-tutorial-description" class="tutorial-description mt-5 rounded-md bg-[#f8faf2] px-4 py-3 text-center text-[13px] leading-[1.6] text-[#65705d]">
          {{ currentPiece.reason }}
        </p>
      </template>

      <template v-else>
        <div class="tutorial-movement-board mx-auto mt-5 w-full max-w-[300px]">
          <div class="relative grid aspect-square grid-cols-7 grid-rows-7 overflow-hidden rounded-[4px] border border-[#d9dfcf]">
            <div
              v-for="cell in cells"
              :key="`${cell.row}-${cell.col}`"
              class="relative grid place-items-center"
              :class="(cell.row + cell.col) % 2 ? 'bg-[#d6c09f]' : 'bg-[#f1eadb]'"
            >
              <span
                v-if="hasDestination(cell.row, cell.col)"
                class="size-[22%] rounded-full bg-[#819b72a6]"
                :class="cell.row === position.row && cell.col === position.col ? 'size-[72%] border-2 border-[#526a4c] bg-transparent' : ''"
              ></span>
            </div>
            <div class="tutorial-moving-piece absolute z-10 grid place-items-center" :style="positionStyle">
              <img
                class="pointer-events-none min-h-0 min-w-0 max-h-[88%] max-w-[88%] object-contain drop-shadow-[0_2px_2px_#30271635]"
                :style="pieceImageStyle({ type: currentPiece.type, color: 'w' }, 27)"
                :src="pieceImage({ type: currentPiece.type, color: 'w' })"
                alt=""
              />
            </div>
          </div>
        </div>
        <p id="piece-tutorial-description" class="tutorial-movement-description mx-auto mt-4 max-w-[400px] text-center text-[13px] leading-[1.6] text-[#65705d]">
          {{ currentPiece.movement }}
        </p>
      </template>

      <footer class="tutorial-footer mt-5 flex items-center justify-between gap-3 border-t border-[#edf0e7] pt-4">
        <button
          class="cursor-pointer rounded-[5px] border border-[#dce5d6] bg-[#f8faf2] px-4 py-2.5 text-[11px] font-semibold text-[#526a4c] hover:border-[#9cac91]"
          type="button"
          @click="goBack"
        >
          {{ tutorialIndex === 0 ? 'Voltar' : 'Anterior' }}
        </button>
        <span class="text-[10px] font-semibold tracking-[1px] text-[#a3ac9b]">{{ tutorialIndex + 1 }} / {{ tutorialPieces.length * 2 }}</span>
        <button
          class="cursor-pointer rounded-[5px] border border-[#526a4c] bg-[#526a4c] px-4 py-2.5 text-[11px] font-semibold text-white hover:bg-[#40553c]"
          type="button"
          @click="goNext"
        >
          {{ nextLabel }}
        </button>
      </footer>
    </section>
  </div>
</template>

<style scoped>
.tutorial-comparison-piece--traditional {
  animation: slide-traditional 550ms cubic-bezier(0.2, 0.7, 0.2, 1) both;
}

.tutorial-comparison-piece--plant {
  animation: slide-plant 550ms cubic-bezier(0.2, 0.7, 0.2, 1) both;
}

.tutorial-comparison-arrow {
  transform-origin: center;
  animation: draw-comparison 450ms 300ms ease-out both;
}

.tutorial-moving-piece {
  width: 14.285714%;
  height: 14.285714%;
  transition: left 500ms cubic-bezier(0.2, 0.7, 0.2, 1), top 500ms cubic-bezier(0.2, 0.7, 0.2, 1);
}

@media (max-height: 650px) {
  .piece-tutorial-dialog {
    padding: 16px;
  }

  .tutorial-title {
    margin-top: 6px;
    font-size: 24px;
  }

  .tutorial-comparison,
  .tutorial-movement-board {
    margin-top: 12px;
  }

  .tutorial-comparison-tile {
    width: 80px;
    height: 80px;
  }

  .tutorial-description {
    margin-top: 12px;
    padding: 8px 12px;
    font-size: 12px;
  }

  .tutorial-movement-board {
    max-width: 210px;
  }

  .tutorial-movement-description {
    margin-top: 8px;
    font-size: 12px;
  }

  .tutorial-footer {
    margin-top: 8px;
    padding-top: 8px;
  }
}

@keyframes slide-traditional {
  from { opacity: 0; transform: translateX(28px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes slide-plant {
  from { opacity: 0; transform: translateX(-28px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes draw-comparison {
  from { opacity: 0; transform: scaleX(0.15); }
  to { opacity: 1; transform: scaleX(1); }
}

@media (prefers-reduced-motion: reduce) {
  .tutorial-comparison-piece,
  .tutorial-comparison-arrow {
    animation: none;
  }

  .tutorial-moving-piece {
    transition: none;
  }
}
</style>
