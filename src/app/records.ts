export type WeaveRecord = {
  schemaVersion: 1
  appId: 'textile-algorithm-studio'
  createdAt: string
  scenarioId: string
  parameters: {
    repeatRows: number
    repeatCols: number
    matrix: boolean[][]
    warpDye: string
    weftDye: string
    view: string
  }
  seed: string
  observations: string[]
  prediction: string
  explanation: string
}

const INDEX_KEY = 'textile-algorithm-studio:records'
const LIMIT = 20

export type StorageResult =
  | { ok: true; records: WeaveRecord[] }
  | { ok: false; records: WeaveRecord[] }

export function loadRecords(): StorageResult {
  try {
    const raw = window.localStorage.getItem(INDEX_KEY)
    if (!raw) return { ok: true, records: [] }
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return { ok: true, records: [] }
    return { ok: true, records: parsed as WeaveRecord[] }
  } catch {
    return { ok: false, records: [] }
  }
}

export function saveRecord(record: WeaveRecord): StorageResult {
  const existing = loadRecords()
  const records = [record, ...existing.records].slice(0, LIMIT)
  try {
    window.localStorage.setItem(INDEX_KEY, JSON.stringify(records))
    return { ok: true, records }
  } catch {
    return { ok: false, records: existing.records }
  }
}

export function deleteRecord(createdAt: string): StorageResult {
  const existing = loadRecords()
  const records = existing.records.filter(
    (record) => record.createdAt !== createdAt,
  )
  try {
    window.localStorage.setItem(INDEX_KEY, JSON.stringify(records))
    return { ok: true, records }
  } catch {
    return { ok: false, records: existing.records }
  }
}

export function isValidMatrix(value: unknown): value is boolean[][] {
  if (!Array.isArray(value)) return false
  const size = value.length
  if (size < 2 || size > 8) return false
  return value.every(
    (row) =>
      Array.isArray(row) &&
      row.length === size &&
      row.every((cell) => typeof cell === 'boolean'),
  )
}

export function recordToJson(record: WeaveRecord): string {
  return JSON.stringify(record, null, 2)
}

export function makeRecord(input: {
  matrix: boolean[][]
  warpDye: string
  weftDye: string
  view: string
  prediction: string
  explanation: string
  observations: string[]
  scenarioId?: string
  createdAt?: string
}): WeaveRecord {
  return {
    schemaVersion: 1,
    appId: 'textile-algorithm-studio',
    createdAt: input.createdAt ?? new Date().toISOString(),
    scenarioId: input.scenarioId ?? 'free-weave',
    parameters: {
      repeatRows: input.matrix.length,
      repeatCols: input.matrix[0]?.length ?? 0,
      matrix: input.matrix,
      warpDye: input.warpDye,
      weftDye: input.weftDye,
      view: input.view,
    },
    seed: 'deterministic',
    observations: input.observations,
    prediction: input.prediction,
    explanation: input.explanation,
  }
}
