import { DYES } from './palette'
import { RepeatGrid } from './RepeatGrid'
import { MAX_REPEAT, MIN_REPEAT, type Matrix } from '../engine/weaveModel'

type Props = {
  matrix: Matrix
  onToggle: (row: number, col: number) => void
  highlight: { row: number; col: number } | null
  onPreset: (preset: 'plain' | 'twill' | 'twillMirror') => void
  onSizeChange: (size: number) => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
  onCopyRow: () => void
  warpDye: string
  weftDye: string
  onWarpDye: (id: string) => void
  onWeftDye: (id: string) => void
}

export function DesignPanel({
  matrix,
  onToggle,
  highlight,
  onPreset,
  onSizeChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onCopyRow,
  warpDye,
  weftDye,
  onWarpDye,
  onWeftDye,
}: Props) {
  const rows = matrix.length
  const cols = matrix[0]?.length ?? 0

  return (
    <>
      <section className="panel" aria-labelledby="design-title">
        <div className="panel__head">
          <h2 className="panel__title" id="design-title">
            설계 · 반복 격자
          </h2>
          <span className="panel__note">
            {rows}×{cols}
          </span>
        </div>
        <div className="panel__body stack">
          <RepeatGrid matrix={matrix} onToggle={onToggle} highlight={highlight} />
          <div className="pegplan__legend">
            <span className="key">
              <span className="key__box" aria-hidden="true" />1 · 날실이 위
            </span>
            <span className="key">
              <span className="key__box" data-state="off" aria-hidden="true" />
              0 · 씨실이 위
            </span>
          </div>
          <div className="rule-text">
            행은 씨실, 열은 날실입니다. 방향키로 옮기고 Space로 바꿉니다.
          </div>
        </div>
      </section>

      <section className="panel" aria-labelledby="rule-title">
        <div className="panel__head">
          <h2 className="panel__title" id="rule-title">
            규칙
          </h2>
        </div>
        <div className="panel__body stack">
          <div className="controls">
            <button
              type="button"
              className="button"
              onClick={() => onPreset('plain')}
            >
              평직
            </button>
            <button
              type="button"
              className="button"
              onClick={() => onPreset('twill')}
            >
              2:2 능직
            </button>
            <button
              type="button"
              className="button"
              onClick={() => onPreset('twillMirror')}
            >
              능직 반대
            </button>
          </div>
          <label className="swatch-group">
            <span className="swatch-group__label">
              반복 크기 {rows}×{cols}
            </span>
            <input
              type="range"
              min={MIN_REPEAT}
              max={MAX_REPEAT}
              value={rows}
              onChange={(event) => onSizeChange(Number(event.target.value))}
              aria-label="반복 단위 크기"
            />
          </label>
          <div className="controls">
            <button
              type="button"
              className="button"
              onClick={onUndo}
              disabled={!canUndo}
            >
              되돌리기
            </button>
            <button
              type="button"
              className="button"
              onClick={onRedo}
              disabled={!canRedo}
            >
              다시 실행
            </button>
            <button type="button" className="button" onClick={onCopyRow}>
              1행을 2행에 복사
            </button>
          </div>
          <p className="rule-text">
            평직은 <code>R[i,j]=(i+j) mod 2</code>, 능직은{' '}
            <code>(j−i) mod 4 &lt; 2</code>입니다.
          </p>
        </div>
      </section>

      <section className="panel" aria-labelledby="dye-title">
        <div className="panel__head">
          <h2 className="panel__title" id="dye-title">
            실 색
          </h2>
        </div>
        <div className="panel__body stack">
          <div className="swatch-group">
            <span className="swatch-group__label">날실 색</span>
            <div className="swatches">
              {DYES.map((dye) => (
                <button
                  key={`warp-${dye.id}`}
                  type="button"
                  className="swatch"
                  style={{ background: dye.hex }}
                  aria-pressed={warpDye === dye.id}
                  aria-label={`날실 ${dye.name}`}
                  onClick={() => onWarpDye(dye.id)}
                >
                  {warpDye === dye.id && (
                    <span className="swatch__check" aria-hidden="true" />
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="swatch-group">
            <span className="swatch-group__label">씨실 색</span>
            <div className="swatches">
              {DYES.map((dye) => (
                <button
                  key={`weft-${dye.id}`}
                  type="button"
                  className="swatch"
                  style={{ background: dye.hex }}
                  aria-pressed={weftDye === dye.id}
                  aria-label={`씨실 ${dye.name}`}
                  onClick={() => onWeftDye(dye.id)}
                >
                  {weftDye === dye.id && (
                    <span className="swatch__check" aria-hidden="true" />
                  )}
                </button>
              ))}
            </div>
          </div>
          <p className="rule-text">
            색을 바꾸면 표면은 달라지지만 조직과 뜀실 검사 결과는 그대로입니다.
          </p>
        </div>
      </section>
    </>
  )
}
