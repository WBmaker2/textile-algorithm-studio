import { THREAD_HEIGHT } from '../engine/threadGeometry'
import { repeatTo, type Matrix } from '../engine/weaveModel'

type Props = {
  matrix: Matrix
  warpColor: string
  weftColor: string
  row: number
  span?: number
}

const PADDING = 0.6
const FLAT = 0.3
const THREAD = 0.34

export function CrossSection({
  matrix,
  warpColor,
  weftColor,
  row,
  span = 8,
}: Props) {
  const surface = repeatTo(matrix, span)
  const rowIndex = Math.min(Math.max(row, 0), surface.length - 1)
  const warpAbove = (col: number) => surface[rowIndex][col]
  const warpZ = (col: number) => (warpAbove(col) ? THREAD_HEIGHT : -THREAD_HEIGHT)
  const weftZ = (col: number) => -warpZ(col)

  const yOf = (z: number) => -z
  const xOf = (col: number) => col + 0.5
  const extent = span + PADDING * 2

  const weftPath: string[] = []
  for (let col = 0; col < span; col += 1) {
    const z = weftZ(col)
    if (col === 0) weftPath.push(`M ${xOf(col) - FLAT} ${yOf(z)}`)
    weftPath.push(`L ${xOf(col) + FLAT} ${yOf(z)}`)
    if (col < span - 1) {
      weftPath.push(`L ${xOf(col + 1) - FLAT} ${yOf(weftZ(col + 1))}`)
    }
  }

  return (
    <svg
      className="viewport__canvas"
      viewBox={`${-PADDING} ${-PADDING} ${extent} ${extent}`}
      role="img"
      aria-label={`씨실 ${rowIndex + 1}번 줄의 옆 단면`}
    >
      <defs>
        <linearGradient id="section-thread" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.38)" />
          <stop offset="52%" stopColor="rgba(0,0,0,0.05)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.34)" />
        </linearGradient>
        <linearGradient id="section-warp-thread" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(0,0,0,0.3)" />
          <stop offset="35%" stopColor="rgba(255,255,255,0.32)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.24)" />
        </linearGradient>
      </defs>

      <line
        x1={-PADDING}
        y1={0}
        x2={span + PADDING}
        y2={0}
        stroke="var(--rule)"
        strokeWidth={0.03}
        strokeDasharray="0.12 0.12"
      />

      {Array.from({ length: span }, (_, col) => (
        <g key={`warp-${col}`}>
          <circle
            cx={xOf(col)}
            cy={yOf(warpZ(col))}
            r={THREAD / 2}
            fill={warpColor}
          />
          <circle
            cx={xOf(col)}
            cy={yOf(warpZ(col))}
            r={THREAD / 2}
            fill="url(#section-warp-thread)"
          />
        </g>
      ))}

      <path
        d={weftPath.join(' ')}
        fill="none"
        stroke={weftColor}
        strokeWidth={THREAD}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={weftPath.join(' ')}
        fill="none"
        stroke="url(#section-thread)"
        strokeWidth={THREAD}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {Array.from({ length: span }, (_, col) => (
        <text
          key={`label-${col}`}
          x={xOf(col)}
          y={-PADDING * 0.3}
          textAnchor="middle"
          fontSize={0.24}
          fill="var(--ink-faint)"
        >
          {col + 1}
        </text>
      ))}
    </svg>
  )
}
