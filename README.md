# 직물 알고리즘 공방

0과 1의 직조 규칙을 실의 위아래 구조로 바꿔 보고 뜀실을 검사하는 학습용 직조
실험실. 초등 고학년~고등학교 수학·미술·정보 수업의 25분 활동용 정적 웹앱이다.

설계 문서: `00-shared-design-principles.md`, `06-textile-algorithm-studio.md`
제품 맥락: `PRODUCT.md` · 시각 결정: `DESIGN.md` · 진행 기록: `PROGRESS.md`

## 실행

```bash
npm install
npm run dev      # http://127.0.0.1:5173
```

## 검증

```bash
npm test         # Vitest 41개 (엔진 규칙·뜀실·기하·미션·기록·컴포넌트)
npm run typecheck
npm run lint
npm run build    # dist/ 생성
npm run preview  # 빌드 결과 제공, http://127.0.0.1:4173
```

## 배포

서버가 필요 없는 정적 파일이다. `dist/` 안의 파일을 그대로 올린다.

- `vite.config.ts`의 `base: './'` 덕분에 저장소 하위 경로에서도 자산 경로가
  깨지지 않는다. 배포 후에는 **공개 URL과 하위 경로의 자산·기능을 직접
  확인**한다(공통 원칙 §6).
- 기록은 `localStorage`에만 저장된다(개인 식별 정보 없음). 저장 실패 시 현재
  세션 유지 + JSON 내려받기를 제공한다.
- WebGL을 열 수 없는 기기에서는 입체 보기 대신 교차 확대·옆 단면으로 같은
  구조 검사를 유지한다.
- VoiceOver·TTS·자동 재생 오디오는 범위에서 제외한다(공통 원칙 §3).

## 구조

```
src/
  engine/            렌더러와 분리된 순수 함수
    weaveModel.ts      평직/능직/반대 대각, 토글, 반복 전개, 주기 구간
    floatInspector.ts  뜀실 검사(반복 경계 포함), 결속 부족
    threadGeometry.ts  실 교차 3D 폴리라인, 관통 판정
    missions.ts        평직·대각 능직·줄무늬 미션 판정
  app/               React UI (파일당 500줄 미만)
    App.tsx            셸·상태·단계·다이얼로그
    DesignPanel.tsx    관찰 뒤의 설계·규칙·실 색
    ObservePanel.tsx   엔진 가상 표본과 예측 대조
    MissionPanel.tsx   미션 3종 확인
    SurfacePanel.tsx   24×24 표면 + 한 줄씩 짜기
    StructurePanel.tsx 교차 확대·옆 단면·입체(지연 불러오기)
    FloatPanel.tsx     뜀실 검사 결과
    ResultPanel.tsx    설명·저장·복원·삭제·내보내기
```

라이브러리 버전은 `package.json`에 고정되어 있다. 업그레이드 시 공식 문서와
호환성을 확인한다.
