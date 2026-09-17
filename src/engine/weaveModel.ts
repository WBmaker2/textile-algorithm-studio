export type Matrix = boolean[][]

export type ThreadRun = {
  start: number
  length: number
  wraps: boolean
}

export const MIN_REPEAT = 2
export const MAX_REPEAT = 8
export const MAX_SURFACE = 24

export function plainWeave(size: number): Matrix {
  assertSize(size)
  return build(size, (i, j) => (i + j) % 2 === 1)
}

export function twill22(size: number): Matrix {
  assertSize(size)
  return build(size, (i, j) => mod(j - i, 4) < 2)
}

export function twill22Mirror(size: number): Matrix {
  assertSize(size)
  return build(size, (i, j) => mod(i + j, 4) < 2)
}

export function toggleCell(matrix: Matrix, row: number, col: number): Matrix {
  return matrix.map((cells, i) =>
    i === row ? cells.map((on, j) => (j === col ? !on : on)) : cells,
  )
}

export function repeatTo(matrix: Matrix, size: number): Matrix {
  const rows = matrix.length
  const cols = matrix[0]?.length ?? 0
  if (rows === 0 || cols === 0) throw new Error('반복 단위가 비어 있습니다')

  return Array.from({ length: size }, (_, i) =>
    Array.from({ length: size }, (_, j) => matrix[i % rows][j % cols]),
  )
}

export function cyclicRuns(sequence: boolean[]): ThreadRun[] {
  const n = sequence.length
  if (n === 0) return []

  const trueCount = sequence.filter(Boolean).length
  if (trueCount === 0) return []
  if (trueCount === n) return [{ start: 0, length: n, wraps: true }]

  const runs: ThreadRun[] = []
  for (let i = 0; i < n; i += 1) {
    const previous = sequence[mod(i - 1, n)]
    if (!sequence[i] || previous) continue

    let length = 0
    while (length < n && sequence[mod(i + length, n)]) length += 1
    runs.push({ start: i, length, wraps: i + length > n })
  }

  return runs.sort((a, b) => a.start - b.start)
}

function build(size: number, rule: (i: number, j: number) => boolean): Matrix {
  return Array.from({ length: size }, (_, i) =>
    Array.from({ length: size }, (_, j) => rule(i, j)),
  )
}

function assertSize(size: number) {
  if (!Number.isInteger(size) || size < MIN_REPEAT || size > MAX_REPEAT) {
    throw new RangeError(
      `반복 크기는 ${MIN_REPEAT}~${MAX_REPEAT} 사이의 정수여야 합니다`,
    )
  }
}

function mod(value: number, base: number) {
  return ((value % base) + base) % base
}
