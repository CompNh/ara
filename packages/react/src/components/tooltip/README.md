# Tooltip

> 파일: `packages/react/src/components/tooltip/README.md`
> 범위: 간단한 정보성 풍선 도움말. 키보드/포인터 트리거만 허용, **상호작용형(popover) UI는 제외**.

## 1) 목적 / 범위

- **목적:** Anchored overlay 계열 컴포넌트의 계약(Props/동작/A11y/Exports)을 Tooltip에서 확정한다.
- **성공 기준:** Trigger/Content/Arrow 계약과 타이밍(openDelay/closeDelay), 포지셔닝 옵션(placement/offset)이 본 문서와 일치하고 이후 구현·스토리·테스트가 이를 준수한다.

---

## 2) Public API (Props 계약)

### Tooltip (루트 상태/컨텍스트)

| 속성 | 값/형식 | 기본값 | 설명 |
| --- | --- | --- | --- |
| **open** | boolean | — | 제어 모드. 존재 시 모든 열림/닫힘은 상위에서 관리하며, 내부 상태를 사용하지 않는다. |
| **defaultOpen** | boolean | false | 비제어 초기값. 이후 상태는 내부에서 관리된다. |
| **onOpenChange** | `(open: boolean) => void` | — | 열림 상태가 바뀔 때 호출. 제어/비제어 모두에서 발화. |
| **placement** | `Placement` (`top\|bottom\|left\|right` + `-start\|center\|end`) | `top-start` | 콘텐츠가 기준(anchor) 대비 배치될 위치. `@ara/core/use-positioner` 타입 그대로 사용한다. |
| **offset** | number | 8 | 기준 요소와 풍선 사이의 간격(px). |
| **strategy** | `"absolute" \| "fixed"` | "absolute" | 포지셔닝 전략. 스크롤 컨테이너 내 고정이 필요하면 `fixed` 사용. |
| **withArrow** | boolean | false | true이면 `TooltipArrow`를 렌더하고 Positioner에서 화살표 위치 계산을 요청한다. |
| **openDelay** | number(ms) | 300 | 마우스/포인터 진입 후 실제 표시까지 지연 시간. A11y 가이드 최소 300ms 준수. |
| **closeDelay** | number(ms) | 150 | 포인터 이탈/blur 후 닫히기까지 지연. 서브 콘텐츠 없이 짧게 유지. |
| **disabled** | boolean | false | true이면 모든 트리거 이벤트를 무시하고 콘텐츠를 렌더하지 않는다. |
| **portalContainer** | `HTMLElement \| null` | 기본 Portal 컨테이너 | 콘텐츠를 렌더링할 DOM 노드. 미지정 시 `Portal`의 기본 컨테이너를 사용. |
| **className / style** | 문자열 / 스타일 | — | 최상위 래퍼에 병합될 사용자 정의 클래스/스타일. |

> **제어 규칙:** `open`이 주어지면 내부 상태를 사용하지 않으며, `onOpenChange`는 트리거 이벤트가 발생했을 때 호출만 한다.
> **포지셔닝 용어:** `placement`/`offset`/`strategy`는 `usePositioner`의 옵션과 1:1 대응한다.

### TooltipTrigger (앵커/트리거)

| 속성 | 값/형식 | 기본값 | 설명 |
| --- | --- | --- | --- |
| **asChild** | boolean | false | true이면 자식 하나를 그대로 렌더하고 이벤트/refs/ARIA를 병합한다. |
| **children** | ReactNode | — | 툴팁을 여는 앵커 요소. 버튼/아이콘 등 자유롭게 사용. |
| **disabled** | boolean | — | 명시 시 루트 `disabled`보다 우선해 해당 트리거만 비활성화한다. |
| **aria-label** | 문자열 | — | 아이콘 전용 트리거 등 레이블이 없는 경우 **필수**. |

### TooltipContent

| 속성 | 값/형식 | 기본값 | 설명 |
| --- | --- | --- | --- |
| **children** | ReactNode | — | 표시할 텍스트/노드. 인터랙티브 컨트롤은 넣지 않는 것을 규칙으로 한다. |
| **id** | string | 자동 생성 | 트리거와 `aria-describedby`로 연결되는 id. 미지정 시 내부에서 생성한다. |
| **className / style** | 문자열 / 스타일 | — | 콘텐츠 래퍼에 최종 병합. |
| **asChild** | boolean | false | 사용자 정의 래퍼로 치환할 때 사용(예: 애니메이션 컴포넌트). |

### TooltipArrow (선택)

- 별도 Props 없음. `withArrow`가 true일 때만 렌더하며, `usePositioner`에서 제공하는 `data-side`/`data-align`/`style`을 그대로 적용한다.

---

## 3) 동작 계약 (Behavior)

- **열림 트리거:**
  - 포인터 `mouseenter`/`pointerenter` → `openDelay` 후 열림. `disabled` 또는 `TooltipTrigger.disabled`면 무시.
  - 키보드 `focusin` → 즉시 열림. 포커스가 유지되는 동안만 표시.
- **닫힘 트리거:**
  - 포인터가 트리거와 콘텐츠 모두에서 벗어나면 `closeDelay` 후 닫힘. `disabled` 또는 컨텐츠 존재하지 않으면 즉시 닫힘.
  - `blur` 시 즉시 닫힘. ESC/외부 클릭 시에도 닫혀야 한다(포커스 트랩 없음).
- **상태 관리:**
  - 루트 `open`이 제어 모드이면 내부 타이머/상태는 콜백만 호출하고 실제 표시 여부는 상위가 결정한다.
  - 동일 앵커에 대한 연속 진입 시 기존 타이머를 공유해 깜빡임을 방지한다.
- **포지셔닝:** `usePositioner` 결과를 Anchor/Floating에 반영하고, `withArrow`일 때는 Arrow의 `data-side/align`과 `style`을 전달한다. 플립/시프트 기본 동작은 `usePositioner` 기본값(flip/shift true)을 따른다.

---

## 4) 접근성 계약 (A11y)

- **역할/연결:** 콘텐츠는 `role="tooltip"`을 사용하고, 트리거에 `aria-describedby={contentId}`를 설정한다.
- **키보드:** 포커스 진입 시 바로 노출하며, 포커스 아웃/ESC에서 닫힌다. 포커스 링은 트리거에만 노출되고 콘텐츠에는 포커스 가능 요소를 넣지 않는다.
- **레이블:** 텍스트 없는 아이콘 트리거는 `aria-label` 또는 외부 `aria-labelledby`를 제공해야 한다.
- **모션/타이밍:** `openDelay` 최소 300ms로 설정해 의도하지 않은 깜빡임을 방지하고, `closeDelay`는 짧게 유지해 포인터 이동 시 빠르게 숨겨 사용자를 방해하지 않도록 한다.
- **Portal:** 기본 포털 렌더링을 사용해 DOM 계층에 상관없이 스크린 리더가 올바르게 탐색하도록 한다.

---

## 5) 컴포지션 / 슬롯

- 구조: `Tooltip`(상태) → `TooltipTrigger`(anchor) → `TooltipContent`(+ `TooltipArrow` 선택).
- 스타일 훅: `data-state="open|closed"`, `data-side`, `data-align`, `data-placement` 등을 콘텐츠/화살표에 노출해 CSS 제어를 돕는다.
- Portal/Positioner/외부 Theme Provider와 병합 가능해야 한다.

---

## 6) Exports 계약

- **@ara/react**
  - `@ara/react/tooltip` → `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipArrow`, 관련 Props/Context 타입
- **package.json (react 패키지)**
  - `exports`: `./tooltip`(ESM) + `types`, `sideEffects:false`
  - Node ≥ 22, ESM 우선, d.ts 포함

---

## 7) 테스트/스토리 요구

- 트리거 hover/focus/ESC 닫힘 시나리오 스냅 및 RTL/포털 환경 검증.
- `placement`/`offset`/`withArrow` 옵션별 시각 스냅샷과 키보드 접근성 검사(aria-describedby 연결) 준비.
