export type Dye = {
  id: string
  name: string
  hex: string
}

export const DYES: Dye[] = [
  { id: 'indigo', name: '쪽', hex: '#27407b' },
  { id: 'rust', name: '다홍', hex: '#c2422b' },
  { id: 'moss', name: '풀', hex: '#4c6141' },
  { id: 'ochre', name: '황토', hex: '#b8801f' },
  { id: 'plum', name: '자두', hex: '#6d3350' },
  { id: 'charcoal', name: '숯', hex: '#2f3439' },
  { id: 'lilac', name: '라일락', hex: '#7d7b9c' },
  { id: 'sand', name: '모래', hex: '#cbb894' },
]

export const DEFAULT_WARP_DYE = 'indigo'
export const DEFAULT_WEFT_DYE = 'rust'

export function dyeHex(id: string): string {
  return DYES.find((dye) => dye.id === id)?.hex ?? DYES[0].hex
}

export function dyeName(id: string): string {
  return DYES.find((dye) => dye.id === id)?.name ?? '쪽'
}
