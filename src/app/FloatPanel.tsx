import { TUTORIAL_FLOAT_LIMIT, type Inspection } from '../engine/floatInspector'

type Props = {
  inspection: Inspection
  active: string | null
  onJump: (run: {
    thread: 'warp' | 'weft'
    index: number
    start: number
  }) => void
}

const MAX_LISTED = 6

export function FloatPanel({ inspection, active, onJump }: Props) {
  const unbound = [
    ...inspection.unboundRows.map((index) => ({
      thread: 'weft' as const,
      index,
    })),
    ...inspection.unboundCols.map((index) => ({
      thread: 'warp' as const,
      index,
    })),
  ]

  const overLimit = inspection.floats.filter(
    (run) => run.length > TUTORIAL_FLOAT_LIMIT,
  )
  const longFloats = inspection.floats.filter((run) => run.length > 1)
  const worst = longFloats
    .filter((run) => run.length === inspection.maxFloat)
    .slice(0, MAX_LISTED)
  const others = longFloats.length - worst.length

  const needsWork = unbound.length > 0 || overLimit.length > 0

  return (
    <div className="stack">
      <div className="status" data-tone={needsWork ? 'warn' : 'ok'}>
        <strong>
          {needsWork
            ? overLimit.length > 0
              ? '교육용 한계를 넘었습니다'
              : '결속이 부족합니다'
            : '결속 양호'}
        </strong>
        <span>
          <span style={{ whiteSpace: 'nowrap' }}>
            최대 뜀실 {inspection.maxFloat}교차
          </span>{' '}
          ·{' '}
          <span style={{ whiteSpace: 'nowrap' }}>긴 뜀실 {longFloats.length}곳</span>{' '}
          ·{' '}
          <span style={{ whiteSpace: 'nowrap' }}>결속 부족 {unbound.length}곳</span>
        </span>
      </div>

      {unbound.length > 0 && (
        <ul className="warnings">
          {unbound.map((item) => {
            const key = `unbound-${item.thread}-${item.index}`
            return (
              <li key={key}>
                <button
                  type="button"
                  className="warning"
                  data-severity="warn"
                  data-active={active === key ? 'true' : undefined}
                  onClick={() =>
                    onJump({ thread: item.thread, index: item.index, start: 0 })
                  }
                >
                  <span className="warning__badge">결속 부족</span>
                  <span className="warning__text">
                    {item.thread === 'weft' ? '씨실' : '날실'} {item.index + 1}번째
                    줄이 반복 단위 전체에서 한쪽에만 있습니다. 그대로 반복하면 이
                    실은 붙잡히지 않습니다.
                  </span>
                  <span className="warning__len">∞</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {worst.length > 0 ? (
        <ul className="warnings">
          {worst.map((run) => {
            const key = `${run.thread}-${run.index}-${run.start}`
            const over = run.length > TUTORIAL_FLOAT_LIMIT
            return (
              <li key={key}>
                <button
                  type="button"
                  className="warning"
                  data-severity={over ? 'warn' : 'info'}
                  data-active={active === key ? 'true' : undefined}
                  onClick={() =>
                    onJump({
                      thread: run.thread,
                      index: run.index,
                      start: run.start,
                    })
                  }
                >
                  <span className="warning__badge">
                    {over ? '한계 초과' : '가장 긴 뜀실'}
                  </span>
                  <span className="warning__text">
                    {run.thread === 'weft' ? '씨실' : '날실'} {run.index + 1}번째
                    줄이 {run.above ? '위' : '아래'}로 {run.length}교차
                    이어집니다
                    {run.wraps ? ' · 반복 경계를 넘습니다' : ''}.
                  </span>
                  <span className="warning__len">{run.length}</span>
                </button>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="empty">
          긴 뜀실이 없습니다. 모든 실이 교차마다 엮여 있습니다.
        </p>
      )}

      {others > 0 && (
        <p className="rule-text">
          같은 길이 {inspection.maxFloat}교차 구간이 {others}곳 더 있습니다.
        </p>
      )}

      {overLimit.length > 0 && (
        <p className="rule-text">
          최대 뜀실 {TUTORIAL_FLOAT_LIMIT}교차는 이 활동의 과제 제약입니다. 실제
          직물에서 쓸 수 있는 보편적인 한계가 아닙니다.
        </p>
      )}
    </div>
  )
}
