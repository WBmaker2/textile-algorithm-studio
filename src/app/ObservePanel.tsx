import { useState } from 'react'
import { plainWeave } from '../engine/weaveModel'
import { predictionLabel } from './StartScreen'
import { SurfacePreview } from './SurfacePreview'

type Props = {
  prediction: string
  warpColor: string
  weftColor: string
}

const REFERENCE = plainWeave(4)
const CORRECT_ID = 'alternate'

export function ObservePanel({ prediction, warpColor, weftColor }: Props) {
  const [showRule, setShowRule] = useState(false)
  const correct = prediction === CORRECT_ID

  return (
    <section className="panel" aria-labelledby="observe-title">
      <div className="panel__head">
        <h2 className="panel__title" id="observe-title">
          관찰 · 평직 표본
        </h2>
        <span className="panel__note">엔진 가상 표본</span>
      </div>
      <div className="panel__body stack">
        <SurfacePreview
          matrix={REFERENCE}
          warpColor={warpColor}
          weftColor={weftColor}
          size={8}
        />
        <p className="rule-text">
          엔진으로 그린 가상 표본입니다. 실제 사진이 아니므로 결을 읽는
          연습용으로만 씁니다.
        </p>
        <div className="status" data-tone={correct ? 'ok' : 'info'}>
          <strong>{correct ? '예측 적중' : '예측과 다릅니다'}</strong>
          <span>
            고른 예측 “{predictionLabel(prediction)}”. 평직에서는 교차마다 위의
            실이 바뀝니다.
          </span>
        </div>
        <div className="row">
          <button
            type="button"
            className="ghost-button ghost-button--sm"
            aria-pressed={showRule}
            onClick={() => setShowRule((prev) => !prev)}
          >
            {showRule ? '1/0 규칙 숨기기' : '1/0 규칙 보기'}
          </button>
        </div>
        {showRule && (
          <table className="truth-table">
            <caption className="sr-only">
              평직 4×4의 1과 0. 1은 날실이 위, 0은 씨실이 위.
            </caption>
            <tbody>
              {REFERENCE.map((cells, row) => (
                <tr key={row}>
                  {cells.map((warpAbove, col) => (
                    <td
                      key={col}
                      data-state={warpAbove ? 'warp' : 'weft'}
                      aria-label={`씨실 ${row + 1}, 날실 ${col + 1}: ${
                        warpAbove ? '날실이 위' : '씨실이 위'
                      }`}
                    >
                      {warpAbove ? 1 : 0}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}
