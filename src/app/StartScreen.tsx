import { useState } from 'react'

export const PREDICTION_OPTIONS = [
  {
    id: 'warp-over',
    label: '날실이 씨실 위로 지나간다',
    note: '세로 실이 가로 실을 덮고 있다고 본 경우',
  },
  {
    id: 'weft-over',
    label: '씨실이 날실 위로 지나간다',
    note: '가로 실이 세로 실을 덮고 있다고 본 경우',
  },
  {
    id: 'alternate',
    label: '두 실이 교차마다 번갈아 위로 올라온다',
    note: '규칙적으로 자리를 바꾼다고 본 경우',
  },
]

export function predictionLabel(id: string): string {
  return PREDICTION_OPTIONS.find((option) => option.id === id)?.label ?? '선택 없음'
}

type Props = {
  onStart: (prediction: string) => void
}

export function StartScreen({ onStart }: Props) {
  const [prediction, setPrediction] = useState<string | null>(null)

  return (
    <div className="start">
      <div className="stack">
        <h1 className="start__question">
          무늬를 반복하면 실제 천도 짤 수 있을까?
        </h1>
        <p className="start__lead">
          0과 1로 적은 규칙을 실의 위아래 관계로 바꿔 봅니다. 규칙을 고치면 천의
          구조가 어떻게 달라지는지, 어디에서 실이 붙잡히지 않는지 확인합니다.
        </p>
      </div>

      <div className="start__predict">
        <p className="start__predict-title">
          시작하기 전에 하나만 골라 두세요. 나중에 비교합니다.
        </p>
        <div className="choices">
          {PREDICTION_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className="choice"
              aria-pressed={prediction === option.id}
              onClick={() => setPrediction(option.id)}
            >
              <span className="choice__mark" aria-hidden="true" />
              <span>
                <strong>{option.label}</strong>
                <br />
                <span className="rule-text">{option.note}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="start__actions">
        <button
          type="button"
          className="button button--primary"
          disabled={!prediction}
          onClick={() => prediction && onStart(prediction)}
        >
          직조 공방 시작
        </button>
        <span className="start__hint">
          약 25분 · 수학 · 미술 · 정보 · 예측을 고르면 시작할 수 있습니다.
        </span>
      </div>
    </div>
  )
}
