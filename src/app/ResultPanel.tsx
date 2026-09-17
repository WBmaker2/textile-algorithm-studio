import type { WeaveRecord } from './records'

type Props = {
  explanation: string
  onExplanationChange: (value: string) => void
  records: WeaveRecord[]
  notice: string | null
  onSave: () => void
  onDownload: () => void
  onRestore: (record: WeaveRecord) => void
  onDelete: (createdAt: string) => void
  onRestart: () => void
}

export function ResultPanel({
  explanation,
  onExplanationChange,
  records,
  notice,
  onSave,
  onDownload,
  onRestore,
  onDelete,
  onRestart,
}: Props) {
  return (
    <section className="panel" aria-labelledby="result-title">
      <div className="panel__head">
        <h2 className="panel__title" id="result-title">
          결과 · 기록
        </h2>
        <span className="panel__note">저장 {records.length}건</span>
      </div>
      <div className="panel__body stack">
        <label className="swatch-group">
          <span className="swatch-group__label">
            이 조직을 어떻게 설명하겠습니까?
          </span>
          <textarea
            rows={3}
            value={explanation}
            onChange={(event) => onExplanationChange(event.target.value)}
            placeholder="예: 2:2 능직으로 대각선이 생겼고, 뜀실이 2교차라 결속이 유지된다."
            style={{
              width: '100%',
              padding: 12,
              borderRadius: 10,
              border: '1px solid var(--rule-strong)',
              background: 'var(--paper-card)',
              font: 'inherit',
              resize: 'vertical',
            }}
          />
        </label>
        <div className="controls">
          <button
            type="button"
            className="button button--primary"
            onClick={onSave}
          >
            이 설계 저장
          </button>
          <button type="button" className="button" onClick={onDownload}>
            JSON 내려받기
          </button>
          <button type="button" className="button button--quiet" onClick={onRestart}>
            처음 화면으로
          </button>
        </div>
        {records.length > 0 && (
          <ul className="stack" aria-label="저장한 설계">
            {records.map((record) => (
              <li key={record.createdAt} className="row">
                <span className="rule-text">
                  {record.createdAt.slice(0, 10)}{' '}
                  {record.createdAt.slice(11, 16)} ·{' '}
                  {record.parameters.repeatRows}×{record.parameters.repeatCols} ·{' '}
                  {record.explanation || '설명 없음'}
                </span>
                <span style={{ marginLeft: 'auto' }} className="row">
                  <button
                    type="button"
                    className="ghost-button ghost-button--sm"
                    onClick={() => onRestore(record)}
                  >
                    복원
                  </button>
                  <button
                    type="button"
                    className="ghost-button ghost-button--sm"
                    onClick={() => onDelete(record.createdAt)}
                  >
                    삭제
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
        {notice && (
          <div className="status" data-tone="info">
            {notice}
          </div>
        )}
      </div>
    </section>
  )
}
