import { describe, expect, test } from 'vitest'
import { checkPlain, checkStripe, checkTwill } from './missions'
import { plainWeave, twill22, twill22Mirror } from './weaveModel'

describe('미션 판정', () => {
  test('평직 미션은 평직 격자에서만 통과한다', () => {
    expect(checkPlain(plainWeave(2)).pass).toBe(true)
    expect(checkPlain(plainWeave(8)).pass).toBe(true)
    expect(checkPlain(twill22(4)).pass).toBe(false)
    expect(checkPlain([[true]]).pass).toBe(false)
  })

  test('능직 미션은 양쪽 대각을 모두 인정한다', () => {
    expect(checkTwill(twill22(4)).pass).toBe(true)
    expect(checkTwill(twill22Mirror(4)).pass).toBe(true)
    expect(checkTwill(plainWeave(4)).pass).toBe(false)
  })

  test('6 크기에서는 대각이 경계에서 이어져 표준 뜀실 2가 되지 않는다', () => {
    expect(checkTwill(twill22Mirror(6)).pass).toBe(false)
    expect(checkTwill(twill22Mirror(6)).detail).toContain('뜀실 길이는 2')
  })

  test('줄무늬 미션은 통째로 같은 줄이 있어야 한다', () => {
    const vertical = [
      [true, true, false, false],
      [true, true, false, false],
      [true, true, false, false],
      [true, true, false, false],
    ]
    const horizontal = [
      [true, true, true, true],
      [true, true, true, true],
      [false, false, false, false],
      [false, false, false, false],
    ]

    expect(checkStripe(vertical).pass).toBe(true)
    expect(checkStripe(vertical).detail).toContain('세로')
    expect(checkStripe(horizontal).pass).toBe(true)
    expect(checkStripe(horizontal).detail).toContain('가로')
    expect(checkStripe(plainWeave(4)).pass).toBe(false)
    expect(
      checkStripe([
        [true, true],
        [true, true],
      ]).pass,
    ).toBe(false)
  })

  test('실패하면 이유를 알려준다', () => {
    expect(checkPlain(twill22(4)).detail).toContain('평직 규칙')
    expect(checkTwill(plainWeave(4)).detail).toContain('능직')
  })
})
