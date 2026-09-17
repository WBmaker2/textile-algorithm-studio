import { repeatTo, type Matrix } from '../engine/weaveModel'

type Props = {
  matrix: Matrix
  warpColor: string
  weftColor: string
  span?: number
  highlight?: { row: number; col: number } | null
}

const PADDING = 0.5
const WIDTH = 0.68

export function CrossingDiagram({
  matrix,
  warpColor,
  weftColor,
  span = 6,
  highlight,
}: Props) {
  const surface = repeatTo(matrix, span)
  const extent = span + PADDING * 2
  const columns = Array.from({ length: span }, (_, col) => col)
  const rows = Array.from({ length: span }, (_, row) => row)

  return (
    <svg
      className="viewport__canvas"
      viewBox={`${-PADDING} ${-PADDING} ${extent} ${extent}`}
      role="img"
      aria-label={`위에서 본 교차 확대 ${span}×${span}`}
    >
      <defs>
        <linearGradient id="crossing-warp" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(0,0,0,0.3)" />
          <stop offset="26%" stopColor="rgba(255,255,255,0.26)" />
          <stop offset="60%" stopColor="rgba(255,255,255,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.26)" />
        </linearGradient>
        <linearGradient id="crossing-weft" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(0,0,0,0.3)" />
          <stop offset="26%" stopColor="rgba(255,255,255,0.26)" />
          <stop offset="60%" stopColor="rgba(255,255,255,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.26)" />
        </linearGradient>
        <filter
          id="crossing-lift"
          x="-25%"
          y="-25%"
          width="150%"
          height="150%"
        >
          <feDropShadow
            dx="0.04"
            dy="0.09"
            stdDeviation="0.07"
            floodColor="#16202e"
            floodOpacity="0.5"
          />
        </filter>
      </defs>

      {rows.map((row) => (
        <g key={`weft-base-${row}`} data-layer="base">
          <rect
            x={-PADDING}
            y={row + 0.5 - WIDTH / 2}
            width={extent}
            height={WIDTH}
            rx={WIDTH / 2}
            fill={weftColor}
          />
          <rect
            x={-PADDING}
            y={row + 0.5 - WIDTH / 2}
            width={extent}
            height={WIDTH}
            rx={WIDTH / 2}
            fill="url(#crossing-weft)"
          />
        </g>
      ))}

      {columns.map((col) => (
        <g key={`warp-band-${col}`} data-layer="warp" filter="url(#crossing-lift)">
          <rect
            x={col + 0.5 - WIDTH / 2}
            y={-PADDING}
            width={WIDTH}
            height={extent}
            rx={WIDTH / 2}
            fill={warpColor}
          />
          <rect
            x={col + 0.5 - WIDTH / 2}
            y={-PADDING}
            width={WIDTH}
            height={extent}
            rx={WIDTH / 2}
            fill="url(#crossing-warp)"
          />
        </g>
      ))}

      {surface.map((cells, row) =>
        cells.map((warpAbove, col) =>
          warpAbove ? null : (
            <g key={`weft-over-${row}-${col}`} data-layer="over" filter="url(#crossing-lift)">
              <rect
                x={col}
                y={row + 0.5 - WIDTH / 2}
                width={1}
                height={WIDTH}
                rx={WIDTH / 2}
                fill={weftColor}
              />
              <rect
                x={col}
                y={row + 0.5 - WIDTH / 2}
                width={1}
                height={WIDTH}
                rx={WIDTH / 2}
                fill="url(#crossing-weft)"
              />
            </g>
          ),
        ),
      )}

      {highlight && (
        <rect
          x={highlight.col + 0.5 - 0.5}
          y={highlight.row + 0.5 - 0.5}
          width={1}
          height={1}
          fill="none"
          stroke="#a2620c"
          strokeWidth={0.09}
          strokeDasharray="0.16 0.1"
        />
      )}
    </svg>
  )
}
