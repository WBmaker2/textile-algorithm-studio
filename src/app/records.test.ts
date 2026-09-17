import { afterEach, describe, expect, test } from 'vitest'
import {
  deleteRecord,
  isValidMatrix,
  loadRecords,
  makeRecord,
  saveRecord,
} from './records'

afterEach(() => {
  window.localStorage.clear()
})

const matrix = [
  [false, true],
  [true, false],
]

function sample(createdAt = '2026-09-17T00:00:00.000Z') {
  return makeRecord({
    matrix,
    warpDye: 'indigo',
    weftDye: 'rust',
    view: 'crossing',
    prediction: 'alternate',
    explanation: '평직',
    observations: ['최대 뜀실 1교차'],
    createdAt,
  })
}

describe('설계 기록 보관', () => {
  test('저장한 설계를 불러올 수 있다', () => {
    saveRecord(sample())

    const loaded = loadRecords()

    expect(loaded.ok).toBe(true)
    expect(loaded.records).toHaveLength(1)
    expect(loaded.records[0].parameters.matrix).toEqual(matrix)
    expect(loaded.records[0].schemaVersion).toBe(1)
  })

  test('지정한 기록만 지운다', () => {
    const first = saveRecord(sample('2026-09-17T00:00:00.000Z')).records[0]
    saveRecord({
      ...sample('2026-09-17T00:00:01.000Z'),
      explanation: '능직',
    })

    const after = deleteRecord(first.createdAt)

    expect(after.ok).toBe(true)
    expect(after.records).toHaveLength(1)
    expect(after.records[0].explanation).toBe('능직')
  })

  test('없는 기록을 지워도 목록이 유지된다', () => {
    saveRecord(sample())

    const after = deleteRecord('2099-01-01T00:00:00.000Z')

    expect(after.records).toHaveLength(1)
  })
})

describe('격자 검증', () => {
  test('2~8 크기의 정사각 불리언 격자만 유효하다', () => {
    expect(isValidMatrix(matrix)).toBe(true)
    expect(isValidMatrix([[true]])).toBe(false)
    expect(isValidMatrix([[]])).toBe(false)
    expect(isValidMatrix([[true, false]])).toBe(false)
    expect(isValidMatrix([[1, 0]])).toBe(false)
    expect(isValidMatrix('plain')).toBe(false)
    expect(isValidMatrix(null)).toBe(false)
  })
})
