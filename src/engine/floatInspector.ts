import { cyclicRuns, type Matrix } from './weaveModel'

export const TUTORIAL_FLOAT_LIMIT = 4

export type FloatRun = {
  thread: 'weft' | 'warp'
  index: number
  start: number
  length: number
  wraps: boolean
  above: boolean
}

export type Inspection = {
  floats: FloatRun[]
  unboundRows: number[]
  unboundCols: number[]
  maxFloat: number
  overLimit: boolean
}

export function inspectWeave(matrix: Matrix): Inspection {
  const rows = matrix.length

  const unboundRows = rowIndices(matrix).filter((i) => isUniform(matrix[i]))
  const unboundCols = colIndices(matrix).filter((j) =>
    isUniform(Array.from({ length: rows }, (_, i) => matrix[i][j])),
  )

  const floats = [...weftFloats(matrix), ...warpFloats(matrix)]

  const maxFloat = floats.reduce((max, run) => Math.max(max, run.length), 0)

  return {
    floats,
    unboundRows,
    unboundCols,
    maxFloat,
    overLimit: maxFloat > TUTORIAL_FLOAT_LIMIT,
  }
}

function weftFloats(matrix: Matrix): FloatRun[] {
  return rowIndices(matrix).flatMap((i) => {
    const weftAbove = matrix[i].map((warpAbove) => !warpAbove)
    return runsOf(weftAbove).map((run) => ({
      thread: 'weft' as const,
      index: i,
      ...run,
    }))
  })
}

function warpFloats(matrix: Matrix): FloatRun[] {
  return colIndices(matrix).flatMap((j) => {
    const warpAbove = rowIndices(matrix).map((i) => matrix[i][j])
    return runsOf(warpAbove).map((run) => ({
      thread: 'warp' as const,
      index: j,
      ...run,
    }))
  })
}

function runsOf(sequence: boolean[]): Omit<FloatRun, 'thread' | 'index'>[] {
  const above = cyclicRuns(sequence).map((run) => ({ ...run, above: true }))
  const below = cyclicRuns(sequence.map((value) => !value)).map((run) => ({
    ...run,
    above: false,
  }))

  return [...above, ...below].sort((a, b) => a.start - b.start)
}

function rowIndices(matrix: Matrix) {
  return matrix.map((_, i) => i)
}

function colIndices(matrix: Matrix) {
  const cols = matrix[0]?.length ?? 0
  return Array.from({ length: cols }, (_, j) => j)
}

function isUniform(values: boolean[]) {
  return values.every((value) => value === values[0])
}
