import type { Matrix } from './weaveModel'

export type Vec3 = { x: number; y: number; z: number }

export type ThreadPolyline = {
  kind: 'warp' | 'weft'
  index: number
  points: Vec3[]
}

export const THREAD_HEIGHT = 0.15
export const THREAD_RADIUS = 0.11
export const FLAT_SPAN = 0.35

export function buildThreads(matrix: Matrix, tiles = 1): ThreadPolyline[] {
  const rows = matrix.length
  const cols = matrix[0]?.length ?? 0
  const above = (i: number, j: number) =>
    matrix[mod(i, rows)][mod(j, cols)]

  const weft: ThreadPolyline[] = Array.from(
    { length: rows * tiles },
    (_, i) => ({
      kind: 'weft',
      index: i,
      points: threadPoints('weft', i, cols * tiles, (position) =>
        above(i, position) ? -1 : 1,
      ),
    }),
  )

  const warp: ThreadPolyline[] = Array.from(
    { length: cols * tiles },
    (_, j) => ({
      kind: 'warp',
      index: j,
      points: threadPoints('warp', j, rows * tiles, (position) =>
        above(position, j) ? 1 : -1,
      ),
    }),
  )

  return [...weft, ...warp]
}

export function zAt(thread: ThreadPolyline, coordinate: number): number {
  const axis = thread.kind === 'weft' ? 'x' : 'y'
  const points = thread.points

  for (let index = 0; index < points.length - 1; index += 1) {
    const a = points[index]
    const b = points[index + 1]
    const from = a[axis]
    const to = b[axis]
    const low = Math.min(from, to)
    const high = Math.max(from, to)

    if (coordinate >= low && coordinate <= high) {
      if (to === from) return a.z
      const ratio = (coordinate - from) / (to - from)
      return a.z + (b.z - a.z) * ratio
    }
  }

  return points[points.length - 1].z
}

export function minCrossingGap(matrix: Matrix): number {
  const threads = buildThreads(matrix, 1)
  const wefts = threads.filter((thread) => thread.kind === 'weft')
  const warps = threads.filter((thread) => thread.kind === 'warp')

  let minGap = Infinity
  for (const weft of wefts) {
    for (const warp of warps) {
      const gap = Math.abs(
        zAt(weft, warp.points[0].x) - zAt(warp, weft.points[0].y),
      )
      minGap = Math.min(minGap, gap)
    }
  }

  return minGap
}

export function geometryStatus(
  matrix: Matrix,
  { radius = THREAD_RADIUS }: { radius?: number } = {},
): 'ok' | 'penetration' {
  if (matrix.length === 0 || (matrix[0]?.length ?? 0) === 0) {
    throw new Error('격자가 비어 있습니다')
  }

  return minCrossingGap(matrix) > 2 * radius ? 'ok' : 'penetration'
}

function threadPoints(
  kind: 'warp' | 'weft',
  index: number,
  crossings: number,
  directionAt: (position: number) => number,
): Vec3[] {
  const start = -0.5
  const end = crossings - 0.5
  const points: Vec3[] = []

  points.push(place(kind, index, start, directionAt(0)))

  for (let position = 0; position < crossings; position += 1) {
    const direction = directionAt(position)
    points.push(place(kind, index, position - FLAT_SPAN, direction))
    points.push(place(kind, index, position + FLAT_SPAN, direction))

    if (position < crossings - 1 && directionAt(position + 1) !== direction) {
      points.push(
        place(kind, index, position + 1 - FLAT_SPAN, directionAt(position + 1)),
      )
    }
  }

  points.push(place(kind, index, end, directionAt(crossings - 1)))

  return points
}

function place(
  kind: 'warp' | 'weft',
  index: number,
  position: number,
  direction: number,
): Vec3 {
  const z = direction * THREAD_HEIGHT
  return kind === 'weft'
    ? { x: position, y: index, z }
    : { x: index, y: position, z }
}

function mod(value: number, base: number) {
  return ((value % base) + base) % base
}
