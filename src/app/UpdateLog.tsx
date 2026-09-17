import { useEffect, useRef } from 'react'
import { CHANGE_LOG } from './changelog'

type Props = {
  onClose: () => void
}

export function UpdateLog({ onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="log-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="dialog__head">
          <h2 className="dialog__title" id="log-title">
            업데이트 내역
          </h2>
          <button
            ref={closeRef}
            type="button"
            className="ghost-button ghost-button--sm"
            style={{ marginLeft: 'auto' }}
            onClick={onClose}
          >
            닫기
          </button>
        </div>
        <div className="dialog__body">
          {CHANGE_LOG.map((entry) => (
            <article className="log-entry" key={`${entry.date}-${entry.title}`}>
              <p className="log-entry__date">{entry.date}</p>
              <h3 className="log-entry__title">{entry.title}</h3>
              <p className="log-entry__text">{entry.text}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
