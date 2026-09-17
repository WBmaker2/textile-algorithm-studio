import { describe, expect, test } from 'vitest'
import {
  cyclicRuns,
  plainWeave,
  repeatTo,
  toggleCell,
  twill22,
  twill22Mirror,
} from './weaveModel'

describe('평직', () => {
  test('R[i,j]는 (i+j) mod 2이며 1이면 날실이 위다', () => {
    const r = plainWeave(4)

    expect(r[0][0]).toBe(false)
    expect(r[0][1]).toBe(true)
    expect(r[1][0]).toBe(true)
    expect(r[1][1]).toBe(false)
    expect(r[3][3]).toBe(false)
  })

  test('8×8까지 만들 수 있고 크기에 따라 값이 대칭이다', () => {
    const r = plainWeave(8)

    expect(r).toHaveLength(8)
    expect(r.every((row) => row.length === 8)).toBe(true)
    expect(r[2][5]).toBe(r[5][2])
    expect(r[4][4]).toBe(false)
  })
})

describe('2:2 능직', () => {
  test('R[i,j]는 (j-i) mod 4가 2 미만이면 날실이 위다', () => {
    const r = twill22(4)

    expect(r[0].map(Number)).toEqual([1, 1, 0, 0])
    expect(r[1].map(Number)).toEqual([0, 1, 1, 0])
    expect(r[2].map(Number)).toEqual([0, 0, 1, 1])
    expect(r[3].map(Number)).toEqual([1, 0, 0, 1])
  })

  test('평직과 능직은 서로 다른 구조다', () => {
    expect(twill22(4)).not.toEqual(plainWeave(4))
  })

  test('반대 대각 능직은 행마다 2교차씩 엮인다', () => {
    const r = twill22Mirror(4)

    expect(r[0].map(Number)).toEqual([1, 1, 0, 0])
    expect(r[1].map(Number)).toEqual([1, 0, 0, 1])
    expect(r[2].map(Number)).toEqual([0, 0, 1, 1])
    expect(r[3].map(Number)).toEqual([0, 1, 1, 0])
    expect(r).not.toEqual(twill22(4))
  })
})

describe('셀 토글', () => {
  test('지정한 셀만 뒤집고 원본은 바꾸지 않는다', () => {
    const before = plainWeave(2)
    const after = toggleCell(before, 0, 0)

    expect(after[0][0]).toBe(true)
    expect(after[0][1]).toBe(before[0][1])
    expect(after[1]).toEqual(before[1])
    expect(before[0][0]).toBe(false)
  })
})

describe('반복 전개', () => {
  test('2×2 단위를 24×24 교차점으로 타일링한다', () => {
    const surface = repeatTo(plainWeave(2), 24)

    expect(surface).toHaveLength(24)
    expect(surface[0]).toHaveLength(24)
    expect(surface[0][2]).toBe(surface[0][0])
    expect(surface[2][0]).toBe(surface[0][0])
    expect(surface[2][2]).toBe(surface[0][0])
  })

  test('8×8 단위도 경계에서 정확히 이어진다', () => {
    const surface = repeatTo(twill22(8), 24)

    expect(surface[8][8]).toBe(surface[0][0])
    expect(surface[23][23]).toBe(surface[7][7])
  })
})

describe('주기 수열의 연속 구간', () => {
  test('평직 행은 모두 길이 1이다', () => {
    const runs = cyclicRuns([false, true, false, true])

    expect(runs.map((run) => run.length)).toEqual([1, 1])
    expect(runs.every((run) => run.wraps === false)).toBe(true)
  })

  test('반복 경계 양끝의 연속 구간을 하나로 합친다', () => {
    const runs = cyclicRuns([true, false, true, true])

    expect(runs).toHaveLength(1)
    expect(runs[0]).toMatchObject({ start: 2, length: 3, wraps: true })
  })

  test('경계를 감싸는 구간과 아닌 구간을 구분한다', () => {
    const runs = cyclicRuns([true, false, true, false, true])

    expect(runs).toHaveLength(2)
    expect(runs[0]).toMatchObject({ start: 2, length: 1, wraps: false })
    expect(runs[1]).toMatchObject({ start: 4, length: 2, wraps: true })
  })

  test('전부 참이면 전체를 덮는 한 구간으로 표시한다', () => {
    const runs = cyclicRuns([true, true, true, true])

    expect(runs).toHaveLength(1)
    expect(runs[0]).toMatchObject({ start: 0, length: 4, wraps: true })
  })

  test('전부 거짓이면 구간이 없다', () => {
    expect(cyclicRuns([false, false, false])).toEqual([])
  })
})
