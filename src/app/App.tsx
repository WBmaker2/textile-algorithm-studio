import { useCallback, useMemo, useState } from 'react'
import { inspectWeave } from '../engine/floatInspector'
import { geometryStatus } from '../engine/threadGeometry'
import {
  plainWeave,
  repeatTo,
  toggleCell,
  twill22,
  twill22Mirror,
  type Matrix,
} from '../engine/weaveModel'
import { DesignPanel } from './DesignPanel'
import { FloatPanel } from './FloatPanel'
import { MissionPanel } from './MissionPanel'
import { ObservePanel } from './ObservePanel'
import { DEFAULT_WARP_DYE, DEFAULT_WEFT_DYE, dyeHex } from './palette'
import {
  deleteRecord,
  isValidMatrix,
  loadRecords,
  makeRecord,
  recordToJson,
  saveRecord,
  type WeaveRecord,
} from './records'
import { ResultPanel } from './ResultPanel'
import { StartScreen } from './StartScreen'
import { StructurePanel, type View } from './StructurePanel'
import { SurfacePanel } from './SurfacePanel'
import { UpdateLog } from './UpdateLog'

const STAGES = ['관찰', '설계', '직조', '검사', '결과']

export function App() {
  const [started, setStarted] = useState(false)
  const [prediction, setPrediction] = useState('')
  const [matrix, setMatrix] = useState<Matrix>(() => plainWeave(4))
  const [history, setHistory] = useState<Matrix[]>([])
  const [future, setFuture] = useState<Matrix[]>([])
  const [didEdit, setDidEdit] = useState(false)
  const [visited, setVisited] = useState<Record<View, boolean>>({
    crossing: true,
    section: false,
    loom: false,
  })
  const [didInspect, setDidInspect] = useState(false)
  const [warpDye, setWarpDye] = useState(DEFAULT_WARP_DYE)
  const [weftDye, setWeftDye] = useState(DEFAULT_WEFT_DYE)
  const [view, setView] = useState<View>('crossing')
  const [sceneKey, setSceneKey] = useState(0)
  const [highlight, setHighlight] = useState<{
    row: number
    col: number
  } | null>(null)
  const [activeWarning, setActiveWarning] = useState<string | null>(null)
  const [pendingSize, setPendingSize] = useState<number | null>(null)
  const [wovenUntil, setWovenUntil] = useState<number | null>(null)
  const [explanation, setExplanation] = useState('')
  const [logOpen, setLogOpen] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [records, setRecords] = useState<WeaveRecord[]>(
    () => loadRecords().records,
  )

  const inspection = useMemo(() => inspectWeave(matrix), [matrix])
  const geometryOk = useMemo(() => geometryStatus(matrix) === 'ok', [matrix])
  const warpColor = dyeHex(warpDye)
  const weftColor = dyeHex(weftDye)
  const rows = matrix.length
  const cols = matrix[0]?.length ?? 0

  const stageStates = useMemo(() => {
    const done = [
      true,
      didEdit,
      visited.loom || visited.section,
      didInspect,
      records.length > 0,
    ]
    const firstOpen = done.findIndex((item) => !item)
    return STAGES.map((_, index) =>
      firstOpen === -1 || index < firstOpen
        ? 'done'
        : index === firstOpen
          ? 'current'
          : 'todo',
    )
  }, [didEdit, visited, didInspect, records.length])

  const commit = useCallback(
    (next: Matrix) => {
      setHistory((prev) => [...prev, matrix])
      setFuture([])
      setDidEdit(true)
      setMatrix(next)
    },
    [matrix],
  )

  const toggle = useCallback(
    (row: number, col: number) => commit(toggleCell(matrix, row, col)),
    [commit, matrix],
  )

  const undo = () => {
    if (history.length === 0) return
    setFuture((prev) => [matrix, ...prev])
    setMatrix(history[history.length - 1])
    setHistory((prev) => prev.slice(0, -1))
  }

  const redo = () => {
    if (future.length === 0) return
    setHistory((prev) => [...prev, matrix])
    setMatrix(future[0])
    setFuture((prev) => prev.slice(1))
  }

  const copyRow = () => {
    const next = matrix.map((cells) => [...cells])
    next[1 % rows] = [...matrix[0]]
    commit(next)
  }

  const applyPreset = (preset: 'plain' | 'twill' | 'twillMirror') =>
    commit(
      preset === 'plain'
        ? plainWeave(rows)
        : preset === 'twill'
          ? twill22(rows)
          : twill22Mirror(rows),
    )

  const applySize = (size: number) => {
    const surface = repeatTo(matrix, size)
    commit(Array.from({ length: size }, (_, i) => surface[i].slice(0, size)))
    setHighlight(null)
    setActiveWarning(null)
    setWovenUntil(null)
    setPendingSize(null)
  }

  const requestSize = (size: number) => {
    if (size === rows) return
    if (size < rows) {
      setPendingSize(size)
      return
    }
    applySize(size)
  }

  const changeView = (next: View) => {
    setVisited((prev) => ({ ...prev, [next]: true }))
    setView(next)
  }

  const jumpToWarning = (run: {
    thread: 'warp' | 'weft'
    index: number
    start: number
  }) => {
    setActiveWarning(`${run.thread}-${run.index}-${run.start}`)
    setHighlight({
      row: run.thread === 'weft' ? run.index % rows : run.start % rows,
      col: run.thread === 'warp' ? run.index % cols : run.start % cols,
    })
    changeView('crossing')
  }

  const buildRecord = () =>
    makeRecord({
      matrix,
      warpDye,
      weftDye,
      view,
      prediction,
      explanation,
      observations: [
        `최대 뜀실 ${inspection.maxFloat}교차`,
        `긴 뜀실 ${inspection.floats.filter((run) => run.length > 1).length}곳`,
        `결속 부족 행 ${inspection.unboundRows.length}개, 열 ${inspection.unboundCols.length}개`,
      ],
    })

  const saveDesign = () => {
    const saved = saveRecord(buildRecord())
    setRecords(saved.records)
    setNotice(
      saved.ok
        ? '이 기기에 설계를 저장했습니다. JSON으로도 내려받을 수 있습니다.'
        : '이 브라우저에서는 저장이 막혀 있습니다. JSON 내려받기로 기록을 보관하세요.',
    )
  }

  const restoreDesign = (record: WeaveRecord) => {
    if (!isValidMatrix(record.parameters.matrix)) {
      setNotice('이 기록의 격자를 읽을 수 없습니다.')
      return
    }
    commit(record.parameters.matrix.map((cells) => [...cells]))
    setWarpDye(record.parameters.warpDye)
    setWeftDye(record.parameters.weftDye)
    setNotice(
      '저장한 설계를 복원했습니다. 되돌리기로 이전 격자로 돌아갈 수 있습니다.',
    )
  }

  const download = () => {
    const record = buildRecord()
    const blob = new Blob([recordToJson(record)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `textile-weave-${record.createdAt.slice(0, 10)}.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const runInspection = () => {
    changeView('crossing')
    setDidInspect(true)
    const needsWork =
      inspection.floats.some((run) => run.length > 4) ||
      inspection.unboundRows.length > 0 ||
      inspection.unboundCols.length > 0
    setNotice(
      needsWork
        ? '검사 결과: 고쳐야 할 구간이 있습니다. 아래 검사 목록에서 위치로 이동할 수 있습니다.'
        : `검사 결과: 최대 뜀실 ${inspection.maxFloat}교차로 결속이 유지됩니다.`,
    )
    document
      .getElementById('inspect-title')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (!started) {
    return (
      <>
        <StartScreen
          onStart={(choice) => {
            setPrediction(choice)
            setStarted(true)
          }}
        />
        <div className="actionbar">
          <button
            type="button"
            className="ghost-button ghost-button--sm"
            onClick={() => setLogOpen(true)}
          >
            업데이트 내역
          </button>
        </div>
        {logOpen && <UpdateLog onClose={() => setLogOpen(false)} />}
      </>
    )
  }

  return (
    <div className="app">
      <a className="skip-link" href="#workbench">
        작업 화면으로 건너뛰기
      </a>

      <header className="topbar">
        <h1 className="topbar__mark">
          직물 알고리즘 공방
          <span>직조 견본 장부</span>
        </h1>
        <div className="topbar__spacer" />
        <button
          type="button"
          className="ghost-button ghost-button--sm"
          onClick={() => setLogOpen(true)}
        >
          업데이트 내역
        </button>
      </header>

      <nav className="stages" aria-label="활동 단계">
        {STAGES.map((stage, index) => (
          <span className="stages__item" key={stage} data-state={stageStates[index]}>
            <span className="stages__num">{index + 1}</span>
            {stage}
          </span>
        ))}
      </nav>

      <main className="workspace" id="workbench">
        <div className="workspace__side">
          <ObservePanel
            prediction={prediction}
            warpColor={warpColor}
            weftColor={weftColor}
          />
          <DesignPanel
            matrix={matrix}
            onToggle={toggle}
            highlight={highlight}
            onPreset={applyPreset}
            onSizeChange={requestSize}
            onUndo={undo}
            onRedo={redo}
            canUndo={history.length > 0}
            canRedo={future.length > 0}
            onCopyRow={copyRow}
            warpDye={warpDye}
            weftDye={weftDye}
            onWarpDye={setWarpDye}
            onWeftDye={setWeftDye}
          />
          <MissionPanel matrix={matrix} />
        </div>

        <div className="workspace__main">
          <SurfacePanel
            matrix={matrix}
            warpColor={warpColor}
            weftColor={weftColor}
            inspection={inspection}
            geometryOk={geometryOk}
            wovenUntil={wovenUntil}
            onWeaveStart={() => setWovenUntil(1)}
            onWeaveNext={() =>
              setWovenUntil((prev) =>
                prev === null || prev >= rows ? null : prev + 1,
              )
            }
            onWeaveReset={() => setWovenUntil(null)}
          />

          <StructurePanel
            matrix={matrix}
            warpColor={warpColor}
            weftColor={weftColor}
            view={view}
            onViewChange={changeView}
            highlight={highlight}
            onClearHighlight={() => setHighlight(null)}
            sceneKey={sceneKey}
            onResetScene={() => setSceneKey((key) => key + 1)}
          />

          <section className="panel" aria-labelledby="inspect-title">
            <div className="panel__head">
              <h2 className="panel__title" id="inspect-title">
                검사 · 뜀실
              </h2>
              <span className="panel__note">반복 경계를 넘어 계산</span>
            </div>
            <div className="panel__body">
              <FloatPanel
                inspection={inspection}
                active={activeWarning}
                onJump={jumpToWarning}
              />
            </div>
          </section>

          <ResultPanel
            explanation={explanation}
            onExplanationChange={setExplanation}
            records={records}
            notice={notice}
            onSave={saveDesign}
            onDownload={download}
            onRestore={restoreDesign}
            onDelete={(createdAt) =>
              setRecords(deleteRecord(createdAt).records)
            }
            onRestart={() => {
              setStarted(false)
              setNotice(null)
            }}
          />
        </div>
      </main>

      <div className="actionbar">
        <button
          type="button"
          className="button button--primary button--pulse"
          onClick={runInspection}
        >
          뜀실 검사
        </button>
        <button
          type="button"
          className="ghost-button"
          onClick={() => changeView('section')}
        >
          옆 단면 보기
        </button>
        <span className="actionbar__hint">
          검사는 반복 경계를 넘어 이어지는 뜀실까지 셉니다.
        </span>
      </div>

      {pendingSize !== null && (
        <div
          className="dialog-backdrop"
          onClick={() => setPendingSize(null)}
        >
          <div
            className="dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="shrink-title"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => {
              if (event.key === 'Escape') setPendingSize(null)
            }}
          >
            <div className="dialog__head">
              <h2 className="dialog__title" id="shrink-title">
                반복 단위 줄이기
              </h2>
            </div>
            <div className="dialog__body">
              <p className="rule-text">
                {rows}×{rows} 격자를 {pendingSize}×{pendingSize}로 줄이면 규칙이
                달라질 수 있습니다. 이전 격자는 되돌리기로 복원할 수 있습니다.
              </p>
              <div className="row">
                <button
                  type="button"
                  className="button button--primary"
                  onClick={() => applySize(pendingSize)}
                >
                  줄이기
                </button>
                <button
                  type="button"
                  className="button"
                  autoFocus
                  onClick={() => setPendingSize(null)}
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {logOpen && <UpdateLog onClose={() => setLogOpen(false)} />}
    </div>
  )
}
