import { describe, expect, test } from 'vitest'
import {
  THREAD_HEIGHT,
  buildThreads,
  geometryStatus,
  minCrossingGap,
  zAt,
} from './threadGeometry'
import { plainWeave, twill22 } from './weaveModel'

describe('실 교차 기하', () => {
  test('평직은 교차마다 날실과 씨실이 위아래로 뒤바뀐다', () => {
    const matrix = plainWeave(2)
    const threads = buildThreads(matrix, 1)
    const warp0 = threads.find((t) => t.kind === 'warp' && t.index === 0)!
    const weft0 = threads.find((t) => t.kind === 'weft' && t.index === 0)!

    expect(zAt(warp0, 0)).toBeCloseTo(-THREAD_HEIGHT)
    expect(zAt(weft0, 0)).toBeCloseTo(THREAD_HEIGHT)
    expect(zAt(warp0, 1)).toBeCloseTo(THREAD_HEIGHT)
    expect(zAt(weft0, 1)).toBeCloseTo(-THREAD_HEIGHT)
  })

  test('모든 교차점에서 기하가 격자 규칙과 일치한다', () => {
    for (const matrix of [plainWeave(4), twill22(8)]) {
      const size = matrix.length
      const threads = buildThreads(matrix, 1)
      const warps = threads.filter((t) => t.kind === 'warp')
      const wefts = threads.filter((t) => t.kind === 'weft')

      for (let i = 0; i < size; i += 1) {
        for (let j = 0; j < size; j += 1) {
          const warpAbove = matrix[i][j]
          const warpZ = zAt(warps[j], i)
          const weftZ = zAt(wefts[i], j)

          expect(warpZ).toBeCloseTo(warpAbove ? THREAD_HEIGHT : -THREAD_HEIGHT)
          expect(weftZ).toBeCloseTo(warpAbove ? -THREAD_HEIGHT : THREAD_HEIGHT)
        }
      }
    }
  })

  test('반복 타일 수만큼 실이 이어진다', () => {
    const threads = buildThreads(plainWeave(2), 3)

    expect(threads.filter((t) => t.kind === 'warp')).toHaveLength(6)
    expect(threads.filter((t) => t.kind === 'weft')).toHaveLength(6)
  })

  test('시각 반경보다 높이 차이가 커서 관통하지 않는다', () => {
    expect(minCrossingGap(plainWeave(4))).toBeCloseTo(THREAD_HEIGHT * 2)
    expect(geometryStatus(plainWeave(4))).toBe('ok')
    expect(geometryStatus(twill22(8))).toBe('ok')
  })

  test('반경이 높이보다 크면 관통으로 판정한다', () => {
    expect(geometryStatus(plainWeave(4), { radius: THREAD_HEIGHT })).toBe(
      'penetration',
    )
  })
})
