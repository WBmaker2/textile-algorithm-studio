# Surface Brief — 직물 알고리즘 공방 (전체 P0 앱)

## Scope · Mode

- 범위: P0 앱 전체 (첫 화면, 관찰, 설계, 직조, 검사, 결과, 업데이트 내역)
- Mode: **Operate** — 학생이 과제를 완수하는 도구. 스캐너빌리티·일관성이 표현보다 우선, 브랜드는 정밀한 디테일에.

## Audience · Job · Action

- 초등 고학년~고등학생이 25분 활동으로 0/1 규칙→실 교차 구조를 이해한다.
- 핵심 작업: 격자 셀 토글·행 복사 → 3D/SVG 교차 확인 → 뜀실 검사 → 저장·설명.
- 증거/콘텐츠: 사용자가 만든 격자와 검사 결과 자체. 외부 주장·벤치마크 없음.

## Constraints

- 밝은 한국어 UI, 첫 화면 질문 1 + 시작 버튼 1, gi-pulse(검사 버튼), 업데이트 내역 상단 버튼.
- 320/360/768/1280px 흐름 검증, 키보드 셀 이동·Space 토글, reduced-motion 정적 테두리.
- VoiceOver·TTS 제외. WebGL 실패 시 SVG 동등 화면. 생성 이미지는 범위 외(빈 상태 안내).

## Chosen Direction

**지단 직물 견본 장부 (Jacquard Sample Ledger)** — 직조 견본서 문법: 조직도(peg plan)·카드·경통 표기로 격자 편집, 실 교차는 위업(heddle) 언어로, 뜀실 경고는 검사 인장으로.

## Memorable Moment

셀을 토글하는 순간 반복 경계를 넘어 24×24 직물 전체가 즉시 다시 짜이고, 검사 인장이 실제 뜀실 길이를 숫자로 인증한다.

## Unresolved Decisions

- 없음 (P0 범위 고정). P1(리프트 플랜)은 추후 별도 협의.

## Direction contract

THESIS: 이 앱이 소유한 유일한 아이디어는 '무늬의 뒷면, 즉 위아래 교차 구조를 편집 가능한 문서로 다루는 것'이며, 카테고리 기본값인 '예쁜 무늬 이미지 편집기' 배열을 거부한다. 화면의 주인공은 표면이 아니라 조직도 격자와 실 교차다.

OWN-WORLD: 지단 견본서 팔레트 — 항공지 밝은 배경 위 잉크 네이비 본문, 날실은 남색 계열, 씨실은 다홍 계열의 염료색 두 계열, 뜀실 경고는 호박색. 체커보드 조직도 기호(■/□)와 실 교차 곡선이 공용 문법. 모서리는 살짝 둥근 카드, 견본서처럼 1px 잉크 테두리와 격자 자가 문장이다. sans-serif 한국어 UI + 숫자·좌표는 tabular. 색은 Restrained 전략: 중성 바탕 + 염료색 액센트, 경고만 호박.

STORY: 방문자는 '무늬를 반복하면 실제 천도 짤 수 있는가'를 이해하고, 격자 규칙이 실 교차 구조가 됨을 확인하며, 뜀실 경고를 고치고 자기 규칙을 기록·저장한다.

FIRST VIEWPORT: 상단 얇은 도구띠(앱명·업데이트 내역·모드 전환), 왼쪽에 반복 격자 편집기(최대 8×8, 큰 셀), 오른쪽에 24×24 전개 직물 미리보기와 3D/SVG 전환 — 768px 이상에서 나란히, 모바일은 격자→직물 순으로 쌓음. 주요 행동(검사)은 gi-pulse로 우하단에 고정.

FORM: 지단 견본 장부 (할당 7번, seed 1d9d6feb).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
