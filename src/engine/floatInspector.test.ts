import { describe, expect, test } from 'vitest'
import { inspectWeave } from './floatInspector'
import { plainWeave, twill22 } from './weaveModel'

describe('뜀실 검사', () => {
  test('평직의 모든 뜀실 길이는 1이다', () => {
    const inspection = inspectWeave(plainWeave(4))

    expect(inspection.floats.length).toBeGreaterThan(0)
    expect(inspection.floats.every((run) => run.length === 1)).toBe(true)
    expect(inspection.maxFloat).toBe(1)
    expect(inspection.overLimit).toBe(false)
    expect(inspection.unboundRows).toEqual([])
    expect(inspection.unboundCols).toEqual([])
  })

  test('2:2 능직의 뜀실 길이는 2다', () => {
    const inspection = inspectWeave(twill22(4))

    expect(inspection.floats.every((run) => run.length === 2)).toBe(true)
    expect(inspection.maxFloat).toBe(2)
    expect(inspection.overLimit).toBe(false)
  })

  test('모든 교차를 씨실과 날실 양쪽에서 검사한다', () => {
    const inspection = inspectWeave(plainWeave(4))

    expect(inspection.floats.filter((run) => run.thread === 'weft')).toHaveLength(16)
    expect(inspection.floats.filter((run) => run.thread === 'warp')).toHaveLength(16)
  })

  test('반복 경계를 넘는 뜀실을 하나의 구간으로 합친다', () => {
    const matrix = [
      [false, true, true, false],
      [true, false, true, true],
      [true, true, false, true],
      [true, true, true, false],
    ]

    const inspection = inspectWeave(matrix)
    const wrapping = inspection.floats.find(
      (run) => run.thread === 'weft' && run.index === 0 && run.wraps,
    )

    expect(wrapping).toMatchObject({ start: 3, length: 2, above: true })
  })

  test('길이 4를 넘는 뜀실은 교육용 한계로 표시한다', () => {
    const matrix = [
      [false, false, false, false, false],
      [true, false, true, true, true],
      [true, true, false, true, true],
      [true, true, true, false, true],
      [true, true, true, true, false],
    ]

    const inspection = inspectWeave(matrix)

    expect(inspection.maxFloat).toBe(5)
    expect(inspection.overLimit).toBe(true)
  })

  test('단위 전체가 한 상태인 행과 열은 결속 부족으로 경고한다', () => {
    const allWarpAbove = [
      [true, true, true],
      [true, true, true],
      [true, true, true],
    ]

    const inspection = inspectWeave(allWarpAbove)

    expect(inspection.unboundRows).toEqual([0, 1, 2])
    expect(inspection.unboundCols).toEqual([0, 1, 2])
  })

  test('크기 2와 8 경계에서도 검사가 동작한다', () => {
    expect(inspectWeave(plainWeave(2)).maxFloat).toBe(1)
    expect(inspectWeave(plainWeave(8)).maxFloat).toBe(1)
    expect(inspectWeave(twill22(8)).maxFloat).toBe(2)
  })

  test('결속 부족 행은 무한 뜀실이 아니라 단위 전체 길이로 보고한다', () => {
    const inspection = inspectWeave([
      [true, true, true],
      [false, true, false],
      [true, true, true],
    ])

    expect(inspection.unboundRows).toEqual([0, 2])
    expect(inspection.maxFloat).toBe(3)
  })
})
