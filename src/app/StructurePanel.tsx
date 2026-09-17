import { lazy, Suspense } from 'react'
import type { Matrix } from '../engine/weaveModel'
import { CrossingDiagram } from './CrossingDiagram'
import { CrossSection } from './CrossSection'

const LoomScene = lazy(() =>
  import('./LoomScene').then((module) => ({ default: module.LoomScene })),
)

export type View = 'crossing' | 'section' | 'loom'

export const VIEW_LABEL: Record<View, string> = {
  crossing: '교차 확대',
  section: '옆 단면',
  loom: '입체',
}

type Props = {
  matrix: Matrix
  warpColor: string
  weftColor: string
  view: View
  onViewChange: (view: View) => void
  highlight: { row: number; col: number } | null
  onClearHighlight: () => void
  sceneKey: number
  onResetScene: () => void
}

export function StructurePanel({
  matrix,
  warpColor,
  weftColor,
  view,
  onViewChange,
  highlight,
  onClearHighlight,
  sceneKey,
  onResetScene,
}: Props) {
  const rows = matrix.length
  const cols = matrix[0]?.length ?? 0

  return (
    <section className="panel" aria-labelledby="view-title">
      <div className="panel__head">
        <h2 className="panel__title" id="view-title">
          구조 보기
        </h2>
        <span className="panel__note">
          {highlight
            ? `씨실 ${highlight.row + 1} · 날실 ${highlight.col + 1}`
            : '교차를 고르면 함께 표시됩니다'}
        </span>
      </div>
      <div className="panel__body viewport">
        <div className="row">
          <div className="tabs" role="tablist" aria-label="구조 보기 선택">
            {(Object.keys(VIEW_LABEL) as View[]).map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={view === item}
                className="tabs__tab"
                onClick={() => onViewChange(item)}
              >
                {VIEW_LABEL[item]}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="ghost-button ghost-button--sm"
            onClick={onClearHighlight}
            disabled={!highlight}
          >
            표시 지우기
          </button>
          {view === 'loom' && (
            <button
              type="button"
              className="ghost-button ghost-button--sm"
              onClick={onResetScene}
            >
              정면으로
            </button>
          )}
        </div>

        <div className="viewport__frame">
          {view === 'crossing' && (
            <CrossingDiagram
              matrix={matrix}
              warpColor={warpColor}
              weftColor={weftColor}
              span={Math.min(8, rows)}
              highlight={highlight}
            />
          )}
          {view === 'section' && (
            <CrossSection
              matrix={matrix}
              warpColor={warpColor}
              weftColor={weftColor}
              row={highlight?.row ?? 0}
              span={Math.min(8, cols)}
            />
          )}
          {view === 'loom' && (
            <Suspense
              fallback={
                <div className="viewport__fallback">
                  입체 보기를 준비하고 있습니다.
                </div>
              }
            >
              <LoomScene
                key={sceneKey}
                matrix={matrix}
                warpColor={warpColor}
                weftColor={weftColor}
                highlight={highlight}
              />
            </Suspense>
          )}
          <span className="viewport__tag">{VIEW_LABEL[view]}</span>
        </div>
        <p className="viewport__caption">
          위에서 본 확대는 표면 무늬를, 옆 단면과 입체는 실의 위아래 구조를
          보여줍니다. 입체 보기는 끌어서 돌리고 휠로 당길 수 있습니다.
        </p>
      </div>
    </section>
  )
}
