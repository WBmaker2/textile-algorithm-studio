import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { plainWeave, twill22 } from '../engine/weaveModel'
import { CrossingDiagram } from './CrossingDiagram'
import { RepeatGrid } from './RepeatGrid'

afterEach(cleanup)

describe('반복 격자 편집기', () => {
  test('각 셀은 씨실 행과 날실 열을 이름으로 알린다', () => {
    render(<RepeatGrid matrix={plainWeave(3)} onToggle={() => {}} />)

    expect(screen.getAllByRole('button')).toHaveLength(9)
    expect(screen.getByRole('button', { name: '씨실 2, 날실 1, 날실이 위' })).toBeTruthy()
  })

  test('누른 셀의 행과 열을 그대로 알려준다', () => {
    const onToggle = vi.fn()
    render(<RepeatGrid matrix={twill22(4)} onToggle={onToggle} />)

    fireEvent.click(screen.getByRole('button', { name: /씨실 2, 날실 3/ }))

    expect(onToggle).toHaveBeenCalledWith(2, 3)
  })

  test('Space와 Enter로도 셀을 바꾼다', () => {
    const onToggle = vi.fn()
    render(<RepeatGrid matrix={plainWeave(2)} onToggle={onToggle} />)
    const cell = screen.getByRole('button', { name: /씨실 0, 날실 0/ })

    fireEvent.keyDown(cell, { key: ' ' })
    fireEvent.keyDown(cell, { key: 'Enter' })

    expect(onToggle).toHaveBeenNthCalledWith(1, 0, 0)
    expect(onToggle).toHaveBeenNthCalledWith(2, 0, 0)
  })

  test('방향키는 격자를 벗어나지 않고 순환한다', () => {
    render(<RepeatGrid matrix={plainWeave(3)} onToggle={() => {}} />)
    const cell = screen.getByRole('button', { name: /씨실 0, 날실 0/ })

    cell.focus()
    fireEvent.keyDown(cell, { key: 'ArrowLeft' })

    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: /씨실 0, 날실 2/ }),
    )
  })
})

describe('교차 확대', () => {
  test('씨실이 위인 교차에만 씨실이 날실 위로 올라온다', () => {
    const { container } = render(
      <CrossingDiagram
        matrix={plainWeave(2)}
        warpColor="#27407b"
        weftColor="#c2422b"
        span={2}
      />,
    )

    const over = [...container.querySelectorAll('[data-layer="over"] rect')]

    expect(container.querySelectorAll('[data-layer="warp"]')).toHaveLength(2)
    expect(container.querySelectorAll('[data-layer="base"]')).toHaveLength(2)
    expect(over).toHaveLength(4)

    const segments = [0, 1].map((index) => ({
      x: Number(over[index * 2].getAttribute('x')),
      y: Number(over[index * 2].getAttribute('y')),
    }))

    expect(segments[0].x).toBeCloseTo(0, 3)
    expect(segments[0].y).toBeCloseTo(0.16, 2)
    expect(segments[1].x).toBeCloseTo(1, 3)
    expect(segments[1].y).toBeCloseTo(1.16, 2)
  })

  test('선택한 교차를 표시한다', () => {
    const { container } = render(
      <CrossingDiagram
        matrix={plainWeave(4)}
        warpColor="#27407b"
        weftColor="#c2422b"
        span={4}
        highlight={{ row: 1, col: 2 }}
      />,
    )

    const marker = container.querySelector('rect[stroke="#a2620c"]')

    expect(marker?.getAttribute('x')).toBe('2')
    expect(marker?.getAttribute('y')).toBe('1')
  })
})
