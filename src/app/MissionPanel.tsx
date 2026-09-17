import { useState } from 'react'
import { MISSION_CHECKS, type MissionCheck, type MissionId } from '../engine/missions'
import type { Matrix } from '../engine/weaveModel'

const MISSIONS: { id: MissionId; title: string; task: string; hint: string }[] = [
  {
    id: 'plain',
    title: '평직 짜기',
    task: '격자를 평직 규칙으로 맞춥니다.',
    hint: 'R[i,j]=(i+j) mod 2. 모든 뜀실이 1교차가 되어야 합니다.',
  },
  {
    id: 'twill',
    title: '대각 능직 짜기',
    task: '2:2 능직의 대각 무늬를 만듭니다.',
    hint: '(j−i) mod 4 < 2, 또는 반대 대각도 됩니다.',
  },
  {
    id: 'stripe',
    title: '줄무늬 짜기',
    task: '반복 크기를 늘리지 않고 줄무늬를 만듭니다.',
    hint: '한 열이나 한 행 전체를 같은 상태로 채워 보세요.',
  },
]

type Props = {
  matrix: Matrix
}

export function MissionPanel({ matrix }: Props) {
  const [completed, setCompleted] = useState<Record<MissionId, boolean>>({
    plain: false,
    twill: false,
    stripe: false,
  })
  const [results, setResults] = useState<Record<MissionId, MissionCheck | null>>({
    plain: null,
    twill: null,
    stripe: null,
  })

  const check = (id: MissionId) => {
    const result = MISSION_CHECKS[id](matrix)
    setResults((prev) => ({ ...prev, [id]: result }))
    if (result.pass) {
      setCompleted((prev) => ({ ...prev, [id]: true }))
    }
  }

  const done = MISSIONS.filter((mission) => completed[mission.id]).length

  return (
    <section className="panel" aria-labelledby="mission-title">
      <div className="panel__head">
        <h2 className="panel__title" id="mission-title">
          미션
        </h2>
        <span className="panel__note">완료 {done}/3</span>
      </div>
      <div className="panel__body stack">
        {MISSIONS.map((mission) => {
          const result = results[mission.id]
          return (
            <div className="stack" key={mission.id}>
              <div className="row">
                <strong>{mission.title}</strong>
                {completed[mission.id] && (
                  <span className="warning__badge" data-tone="ok">
                    완료
                  </span>
                )}
                <button
                  type="button"
                  className="ghost-button ghost-button--sm"
                  style={{ marginLeft: 'auto' }}
                  onClick={() => check(mission.id)}
                >
                  확인
                </button>
              </div>
              <p className="rule-text">{mission.task}</p>
              <p className="rule-text">{mission.hint}</p>
              {result && (
                <div
                  className="status"
                  data-tone={result.pass ? 'ok' : 'info'}
                >
                  {result.detail}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
