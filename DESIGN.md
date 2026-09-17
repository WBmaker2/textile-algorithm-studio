# Design

<!-- impeccable:design-schema 1 -->

## World

**지단 직물 견본 장부 (Jacquard Sample Ledger).** 직조 견본서의 문법을 그대로 쓴다. 항공지 바탕, 잉크 네이비 본문, 1px 인쇄 괘선, 조직도(peg plan) 격자, 표로 정리된 측정값, 염료 견본 칩. 표면 무늬가 아니라 **연결 구조**가 문서의 주인공이다. 모든 화면 요소는 이 장부에 실제로 존재할 수 있는 것이어야 한다.

## Color

Restrained 전략: 중성 바탕 + 염료 액센트. 색은 장식이 아니라 **실의 정체**다.

| Token | Value | Role |
|---|---|---|
| `--paper` | `#f2f1ec` | 장부 바탕 |
| `--paper-card` | `#fbfaf7` | 카드·표 면 |
| `--paper-sunk` | `#e9e8e2` | 표 머리·눌린 면 |
| `--ink` | `#16202e` | 본문·제목 |
| `--ink-soft` | `#4a5666` | 보조 텍스트 (7.15:1) |
| `--ink-faint` | `#5a6572` | 라벨·주석 (4.83–5.68:1) |
| `--rule` | `#c8cbc1` | 괘선 (구분선 전용) |
| `--rule-strong` | `#838a7e` | 조작 요소 경계 (3.13:1 이상) |
| `--warp` | `#27407b` | 날실 기본 — 쪽 |
| `--weft` | `#c2422b` | 씨실 기본 — 다홍 |
| `--warn` | `#a2620c` | 뜀실 경고 — 황토 |
| `--ok` | `#2f6b4f` | 결속 양호 — 풀 |
| `--focus` | `#1b4fd8` | 포커스 링 |

염료 팔레트 8색(`palette.ts`): 쪽·다홍·풀·황토·자두·숯·라일락·모래. 사용자는 날실색과 씨실색을 각각 고른다. **색을 바꿔도 조직과 검사 결과는 변하지 않는다** — 이것이 이 앱의 논지다.

## Type

`--font-ui`: `Pretendard Variable, Pretendard, -apple-system, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif`. Operate 표면이므로 시스템 한국어 UI 서체를 쓴다. 표시 서체를 따로 두지 않는다.

- 본문 `--step-0` ≈ 15–16px, 행간 1.6
- 스케일: `--step-0`…`--step-4` (clamp, 41.4px까지)
- **모든 숫자는 `font-variant-numeric: tabular-nums`** — 뜀실 길이, 교차 수, 좌표가 흔들리지 않아야 한다
- 제목 자간 `-0.01em`~`-0.03em`, 본문 자간은 건드리지 않는다
- 모노스페이스 서체를 쓰지 않는다. 측정값은 tabular 숫자로 충분하다

## Layout

- `--gap-1`…`--gap-7`: 4/8/12/16/24/32/48px
- `--radius` 14px (패널), `--radius-sm` 10px (조작 요소, 셀 5px)
- 데스크톱: `workspace` 2열 — 왼쪽 `minmax(280px, 360px)` 설계 열(sticky `top: 128px`), 오른쪽 `minmax(0, 1fr)` 직조·구조·검사·결과
- 900px 이하: 1열로 쌓고 순서는 설계 → 규칙 → 실 색 → 표면 → 구조 → 검사 → 결과
- 상단 `topbar`(sticky) → `stages` 단계 띠 → `workspace` → `actionbar`(fixed, 높이 96px 확보)
- 조직도 격자는 셀 46px 기준으로 폭을 계산하고 `min(100%, …)`로 좁은 화면에서 줄인다. 셀 최소 30px
- 구조 보기 프레임: 데스크톱 `16/10`, 720px 이하 `1/1`

## Depth

- `--shadow-lift`: `0 1px 2px rgb(22 32 46 / 8%), 0 12px 28px -18px rgb(22 32 46 / 34%)`
- `--shadow-pop`: 다이얼로그 전용
- 카드는 **괘선 또는 그림자 중 하나만** 쓴다. 기본은 1px 괘선이고, 그림자는 뜨는 요소(다이얼로그)만
- 실의 입체감은 그림자가 아니라 **실 방향 그라디언트**로 만든다: 날실은 가로 그라디언트, 씨실은 세로 그라디언트(`surface-warp`/`surface-weft`). 색이 아니라 결로 깊이를 만든다

## Components

- `RepeatGrid` — 조직도. 칸은 토글 버튼, `aria-pressed`가 규칙값(1=날실이 위). 방향키 이동, Space/Enter 토글, 경계 순환. 경고 위치는 `data-highlight`
- `SurfacePreview` — 반복 단위를 `<pattern>`으로 타일링한 24×24 표면. 칸마다 위에 있는 실 색 + 실 방향 그라디언트. DOM을 576개 만들지 않는다
- `CrossingDiagram` — 위에서 본 확대. 순서: 씨실 바탕(연속) → 날실 띠(연속, 그림자로 위) → 씨실이 위인 교차 구간만 다시 위로. `data-layer="base|warp|over"`
- `CrossSection` — 옆 단면. 날실은 원(±h 중심), 씨실은 교차 사이에서만 높이가 바뀌는 경로
- `LoomScene` — Three.js `TubeGeometry`. 정수 배 타일링(교차 12 이하), 포인터 드래그 회전 + 휠 줌. `supportsWebGL()`이 거짓이면 SVG 대체 안내. `lazy`로 분리 (본 번들 251KB, 입체 청크 547KB)
- `FloatPanel` — 검사 결과. 가장 긴 구간만 최대 6개 나열하고 나머지는 "같은 길이 n교차 구간이 k곳 더 있습니다"로 요약. 결속 부족 행/열은 별도 목록. `TUTORIAL_FLOAT_LIMIT = 4`는 **활동 제약**이며 직물의 한계가 아님을 항상 명시
- `StartScreen` — 질문 하나 + 예측 선택 하나 + 시작 버튼 하나
- `ObservePanel` — 엔진 가상 표본(실제 사진 아님을 명시) + 시작 화면 예측의
  적중 여부 + 1/0 규칙표(`truth-table`) 토글. 예측→실행→재검증 흐름의 출발점
- `MissionPanel` — 평직·대각 능직(양쪽 대각 인정)·줄무늬 3종. 확인 버튼이
  `missions.ts` 판정을 실행하고 이유를 문장으로 돌려준다
- `SurfacePanel` — 한 줄씩 짜기. `wovenUntil` 아래 줄은 `--paper` 72% 베일과
  황토 점선으로 구분한다
- 축소 확인 다이얼로그 — 반복 단위를 줄이기 전에 규칙 변경을 미리 알리고,
  이전 격자는 되돌리기로 복원한다(기록은 `commit` 히스토리에 남는다)
- `ResultPanel` — 저장 목록의 복원·삭제. 복원 전 `isValidMatrix`로 검증한다
- `UpdateLog` — 다이얼로그. 포커스 이동, Escape 닫기
- `actionbar` — 검사 버튼 하나에만 gi-pulse. 동시에 두 버튼을 강조하지 않는다

## Motion

- `--duration` 180ms, `--ease-out` `cubic-bezier(0.16, 1, 0.3, 1)`
- 유일한 authored moment: 검사 버튼의 **gi-pulse 아우라**(2.6s 주기, `::after` 1px 테두리)
- 셀 호버는 1px 상승 + 그림자, 누르면 1px 하강
- `prefers-reduced-motion`이면 모든 애니메이션을 1ms로 줄이고 gi-pulse는 정적 테두리(`opacity: .9`, 애니메이션 없음)로 대체

## Browser Surfaces

- `::selection` = `--warp-soft` 바탕 / `--ink` 글자
- `:focus-visible` = 2px `--focus` 링, offset 2px
- `color-scheme: light`
- 캐럿·스크롤바는 기본값을 존중하되 밝은 장부에 맞는 light 스킴을 선언

## Accessibility Invariants

- 본문·라벨 텍스트 대비 ≥4.5:1, 조작 요소 경계 ≥3:1 (검증: 최저 4.83:1 텍스트, 3.13:1 경계)
- 모든 조작 대상 높이 ≥24px (실제 버튼 32/40/44px, range 입력 44px)
- 색만으로 상태를 구분하지 않는다: 뜀실 경고는 배지 텍스트 + 숫자 + 하이라이트 위치를 함께 제공. 조직도는 `aria-pressed`와 범례의 1/0 표기를 함께 제공
- 키보드: 방향키 셀 이동, Space/Enter 토글, Tab 순서 = 시각 순서, 스킵 링크, 다이얼로그 Escape/포커스
- 320/360/390/768/1280px에서 가로 스크롤 없음 (검증 완료)
- VoiceOver·TTS·자동 재생 오디오는 프로젝트 범위에서 제외 (설계 문서 지침)
