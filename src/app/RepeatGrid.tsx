import { useRef, type KeyboardEvent } from 'react'
import type { Matrix } from '../engine/weaveModel'

type Props = {
  matrix: Matrix
  onToggle: (row: number, col: number) => void
  highlight?: { row: number; col: number } | null
}

export function RepeatGrid({ matrix, onToggle, highlight }: Props) {
  const refs = useRef<Map<string, HTMLButtonElement>>(new Map())
  const rows = matrix.length
  const cols = matrix[0]?.length ?? 0

  const focusCell = (row: number, col: number) => {
    const wrappedRow = (row + rows) % rows
    const wrappedCol = (col + cols) % cols
    refs.current.get(`${wrappedRow}-${wrappedCol}`)?.focus()
  }

  const onKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    row: number,
    col: number,
  ) => {
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault()
        focusCell(row - 1, col)
        break
      case 'ArrowDown':
        event.preventDefault()
        focusCell(row + 1, col)
        break
      case 'ArrowLeft':
        event.preventDefault()
        focusCell(row, col - 1)
        break
      case 'ArrowRight':
        event.preventDefault()
        focusCell(row, col + 1)
        break
      case ' ':
      case 'Enter':
        event.preventDefault()
        onToggle(row, col)
        break
      default:
        break
    }
  }

  return (
    <div
      className="pegplan__frame"
      role="group"
      aria-label={`반복 격자 ${rows}행 ${cols}열`}
      style={{ width: `min(100%, ${cols * 46 + (cols - 1) * 4 + 24}px)` }}
    >
      {matrix.map((cells, row) => (
        <div
          className="pegplan__row"
          key={row}
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {cells.map((warpAbove, col) => (
            <button
              key={col}
              ref={(node) => {
                if (node) refs.current.set(`${row}-${col}`, node)
                else refs.current.delete(`${row}-${col}`)
              }}
              type="button"
              className="pegplan__cell"
              aria-pressed={warpAbove}
              aria-label={`씨실 ${row}, 날실 ${col}, ${
                warpAbove ? '날실이 위' : '씨실이 위'
              }`}
              data-row={row}
              data-col={col}
              data-highlight={
                highlight?.row === row && highlight?.col === col
                  ? 'true'
                  : undefined
              }
              onClick={() => onToggle(row, col)}
              onKeyDown={(event) => onKeyDown(event, row, col)}
            >
              <span className="sr-only">{warpAbove ? '1' : '0'}</span>
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}
