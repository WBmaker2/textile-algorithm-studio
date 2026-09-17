import type { Inspection } from '../engine/floatInspector'
import type { Matrix } from '../engine/weaveModel'
import { SurfacePreview } from './SurfacePreview'

type Props = {
  matrix: Matrix
  warpColor: string
  weftColor: string
  inspection: Inspection
  geometryOk: boolean
  wovenUntil: number | null
  onWeaveStart: () => void
  onWeaveNext: () => void
  onWeaveReset: () => void
}

export function SurfacePanel({
  matrix,
  warpColor,
  weftColor,
  inspection,
  geometryOk,
  wovenUntil,
  onWeaveStart,
  onWeaveNext,
  onWeaveReset,
}: Props) {
  const rows = matrix.length
  const longFloats = inspection.floats.filter((run) => run.length > 1).length
  const unbound = inspection.unboundRows.length + inspection.unboundCols.length

  return (
    <section className="panel" aria-labelledby="surface-title">
      <div className="panel__head">
        <h2 className="panel__title" id="surface-title">
          직조 · 표면
        </h2>
        <span className="panel__note">24×24 교차점</span>
      </div>
      <div className="panel__body surface">
        <SurfacePreview
          matrix={matrix}
          warpColor={warpColor}
          weftColor={weftColor}
          wovenUntil={wovenUntil}
        />
        <div className="row">
          {wovenUntil === null ? (
            <button
              type="button"
              className="ghost-button ghost-button--sm"
              onClick={onWeaveStart}
            >
              한 줄씩 짜기
            </button>
          ) : (
            <>
              <span className="rule-text">
                씨실 {Math.min(wovenUntil, rows)}번째 줄까지 짰다
              </span>
              <button
                type="button"
                className="ghost-button ghost-button--sm"
                onClick={onWeaveNext}
              >
                {wovenUntil >= rows ? '전부 보기' : '다음 줄'}
              </button>
              <button
                type="button"
                className="ghost-button ghost-button--sm"
                onClick={onWeaveReset}
              >
                그만두기
              </button>
            </>
          )}
        </div>
        <div className="surface__meta">
          <span className="metric">
            <span className="metric__label">최대 뜀실</span>
            <span
              className="metric__value"
              data-warn={inspection.maxFloat > 1}
            >
              {inspection.maxFloat}
            </span>
          </span>
          <span className="metric">
            <span className="metric__label">긴 뜀실</span>
            <span className="metric__value">{longFloats}</span>
          </span>
          <span className="metric">
            <span className="metric__label">결속 부족</span>
            <span className="metric__value" data-warn={unbound > 0}>
              {unbound}
            </span>
          </span>
          <span className="metric">
            <span className="metric__label">교차 기하</span>
            <span className="metric__value" data-warn={!geometryOk}>
              {geometryOk ? '정상' : '관통'}
            </span>
          </span>
        </div>
      </div>
    </section>
  )
}
