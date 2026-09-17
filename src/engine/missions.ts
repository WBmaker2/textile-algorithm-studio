import { inspectWeave } from './floatInspector'
import {
  plainWeave,
  twill22,
  twill22Mirror,
  type Matrix,
} from './weaveModel'

export type MissionId = 'plain' | 'twill' | 'stripe'

export type MissionCheck = {
  pass: boolean
  detail: string
}

export function checkPlain(matrix: Matrix): MissionCheck {
  const size = squareSize(matrix)
  if (size === null) return fail('격자가 2~8 크기의 정사각형이 아닙니다.')
  if (!equals(matrix, plainWeave(size))) {
    return fail('평직 규칙 R[i,j]=(i+j) mod 2와 다릅니다.')
  }
  if (inspectWeave(matrix).maxFloat !== 1) {
    return fail('평직의 모든 뜀실 길이는 1이어야 합니다.')
  }
  return {
    pass: true,
    detail: `${size}×${size} 평직입니다. 모든 실이 1교차마다 엮였습니다.`,
  }
}

export function checkTwill(matrix: Matrix): MissionCheck {
  const size = squareSize(matrix)
  if (size === null) return fail('격자가 2~8 크기의 정사각형이 아닙니다.')
  const mirror = equals(matrix, twill22Mirror(size))
  if (!equals(matrix, twill22(size)) && !mirror) {
    return fail('2:2 능직의 대각 규칙과 다릅니다.')
  }
  if (inspectWeave(matrix).maxFloat !== 2) {
    return fail('표준 2:2 능직의 뜀실 길이는 2입니다.')
  }
  return {
    pass: true,
    detail: `${size}×${size} 2:2 능직입니다 (${
      mirror ? '반대 대각' : '오른쪽 대각'
    }). 대각 무늬가 생겼고 결속이 유지됩니다.`,
  }
}

export function checkStripe(matrix: Matrix): MissionCheck {
  const size = squareSize(matrix)
  if (size === null) return fail('격자가 2~8 크기의 정사각형이 아닙니다.')
  const columnStripes = everyIndex(size, (j) => uniformColumn(matrix, j))
  const rowStripes = everyIndex(size, (i) => uniformRow(matrix, i))
  if (!columnStripes && !rowStripes) {
    return fail('한 줄 전체가 같은 상태인 열이나 행이 없습니다.')
  }
  if (matrix.every((row) => row.every((cell) => cell === matrix[0][0]))) {
    return fail('격자 전체가 한 상태이면 줄무늬가 아니라 한 장입니다.')
  }
  return {
    pass: true,
    detail: `${
      columnStripes ? '세로' : '가로'
    } 줄무늬입니다. 통째로 한 상태인 줄은 결속 부족 경고를 함께 확인하세요.`,
  }
}

export const MISSION_CHECKS: Record<MissionId, (matrix: Matrix) => MissionCheck> = {
  plain: checkPlain,
  twill: checkTwill,
  stripe: checkStripe,
}

function fail(detail: string): MissionCheck {
  return { pass: false, detail }
}

function squareSize(matrix: Matrix): number | null {
  const size = matrix.length
  if (size < 2 || size > 8) return null
  const valid = matrix.every(
    (row) =>
      row.length === size && row.every((cell) => typeof cell === 'boolean'),
  )
  return valid ? size : null
}

function equals(a: Matrix, b: Matrix): boolean {
  return (
    a.length === b.length &&
    a.every((row, i) => row.every((cell, j) => cell === b[i][j]))
  )
}

function uniformColumn(matrix: Matrix, col: number): boolean {
  return matrix.every((row) => row[col] === matrix[0][col])
}

function uniformRow(matrix: Matrix, row: number): boolean {
  return matrix[row].every((cell) => cell === matrix[row][0])
}

function everyIndex(size: number, predicate: (index: number) => boolean) {
  return Array.from({ length: size }, (_, index) => index).every(predicate)
}
