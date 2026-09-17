export type ChangeEntry = {
  date: string
  title: string
  text: string
}

export const FIRST_DEVELOPED = '2026-09-17'

export const CHANGE_LOG: ChangeEntry[] = [
  {
    date: FIRST_DEVELOPED,
    title: '첫 개발',
    text: '반복 격자 편집, 24×24 표면 미리보기, 위에서 본 교차 확대와 옆 단면, 뜀실 검사, 설계 저장과 JSON 내보내기를 만들었습니다.',
  },
  {
    date: FIRST_DEVELOPED,
    title: '입체 보기 추가',
    text: '격자 규칙을 그대로 따라 실이 오르내리는 입체 보기를 넣었습니다. 이 기기에서 입체 보기를 열 수 없으면 교차 확대와 단면 보기로 같은 구조를 확인할 수 있습니다.',
  },
  {
    date: '2026-09-17',
    title: '관찰 표본과 미션 추가',
    text: '엔진으로 그린 평직 가상 표본과 시작 화면의 예측을 대조하는 관찰 패널, 평직·대각 능직·줄무늬 미션 3종, 반대 대각 능직을 넣었습니다.',
  },
  {
    date: '2026-09-17',
    title: '복원과 한 줄 짜기',
    text: '저장한 설계를 복원·삭제할 수 있습니다. 표면에서 한 줄씩 짜기를 실행하고, 반복 단위를 줄이기 전에 규칙 변경을 미리 알립니다. 활동 단계 표시가 실제 진행에 따라 바뀝니다.',
  },
]
