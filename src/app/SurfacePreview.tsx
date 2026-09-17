import type { Matrix } from '../engine/weaveModel'

type Props = {
  matrix: Matrix
  warpColor: string
  weftColor: string
  size?: number
  wovenUntil?: number | null
}

export function SurfacePreview({
  matrix,
  warpColor,
  weftColor,
  size = 24,
  wovenUntil = null,
}: Props) {
  const unitRows = matrix.length
  const unitCols = matrix[0]?.length ?? 0
  const patternId = `surface-unit-${unitRows}x${unitCols}-${warpColor.slice(1)}-${weftColor.slice(1)}`

  return (
    <svg
      className="surface__canvas"
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`${size}×${size} 교차점으로 반복한 직물 표면`}
      shapeRendering="crispEdges"
    >
      <defs>
        <linearGradient id="surface-warp" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(0,0,0,0.28)" />
          <stop offset="30%" stopColor="rgba(255,255,255,0.26)" />
          <stop offset="64%" stopColor="rgba(255,255,255,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.26)" />
        </linearGradient>
        <linearGradient id="surface-weft" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(0,0,0,0.28)" />
          <stop offset="30%" stopColor="rgba(255,255,255,0.26)" />
          <stop offset="64%" stopColor="rgba(255,255,255,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.26)" />
        </linearGradient>

        <pattern
          id={patternId}
          width={unitCols}
          height={unitRows}
          patternUnits="userSpaceOnUse"
        >
          {matrix.map((cells, row) =>
            cells.map((warpAbove, col) => (
              <g key={`cell-${row}-${col}`}>
                <rect
                  x={col}
                  y={row}
                  width={1}
                  height={1}
                  fill={warpAbove ? warpColor : weftColor}
                />
                <rect
                  x={col}
                  y={row}
                  width={1}
                  height={1}
                  fill={
                    warpAbove ? 'url(#surface-warp)' : 'url(#surface-weft)'
                  }
                />
              </g>
            )),
          )}
        </pattern>
      </defs>

      <rect width={size} height={size} fill={`url(#${patternId})`} />

      {wovenUntil !== null && wovenUntil < size && (
        <g>
          <rect
            x={0}
            y={wovenUntil}
            width={size}
            height={size - wovenUntil}
            fill="var(--paper)"
            opacity={0.72}
          />
          <line
            x1={0}
            y1={wovenUntil}
            x2={size}
            y2={wovenUntil}
            stroke="#a2620c"
            strokeWidth={0.18}
            strokeDasharray="0.5 0.3"
          />
        </g>
      )}

      {Array.from({ length: size }, (_, row) => (
        <rect
          key={`edge-h-${row}`}
          x={0}
          y={row}
          width={size}
          height={1}
          fill="none"
          stroke="rgba(0,0,0,0.16)"
          strokeWidth={0.06}
        />
      ))}
      {Array.from({ length: size }, (_, col) => (
        <rect
          key={`edge-v-${col}`}
          x={col}
          y={0}
          width={1}
          height={size}
          fill="none"
          stroke="rgba(0,0,0,0.16)"
          strokeWidth={0.06}
        />
      ))}
    </svg>
  )
}
