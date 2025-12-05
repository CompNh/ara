# Overlay Primitives v0 계약

> 대상: `Portal`, `FocusTrap`, `DismissableLayer`, `Positioner` (core 훅 + React 컴포넌트)
> 위치: `packages/core` / `packages/react`

## 공통 스택·이벤트 정책

- **스택 관리**
  - 각 오버레이 인스턴스는 마운트 시 스택에 push, 언마운트 시 pop 된다.
  - 전역 이벤트(ESC, 바깥 포인터/포커스)는 **스택 최상단 인스턴스만** 처리한다.
  - `disabled` 상태나 언마운트된 인스턴스는 스택에서 제외되어 이벤트가 전달되지 않는다.
- **ESC 처리**
  - 스택 최상단 오버레이만 `Escape` 이벤트를 수신하고, `preventDefault()` 또는 `onEscapeKeyDown` 반환값으로 처리 여부를 결정한다.
  - ESC 처리가 `dismiss` 조건이면 `onDismiss`를 호출한다.
- **바깥 상호작용 처리**
  - 포인터/포커스 이벤트는 capture 단계에서 감지한다.
  - 스택 최상단만 `onPointerDownOutside`/`onFocusOutside`를 실행하며, 내부에서 `event.preventDefault()` 시 기본 동작을 차단한다.
  - `disableOutsidePointerEvents` 활성화 시 스택 상위 오버레이가 `pointerdown` 기본 동작을 막아 하위 레이어 상호작용을 차단한다.
- **Portal + 스택 정합성**
  - Portal로 이동한 노드도 스택 순서를 유지한다. DOM 계층과 무관하게 마운트 순서를 기반으로 top 여부를 판단한다.

## Portal

- **API**
  - `container?: HTMLElement | null` — 지정 시 해당 노드 아래로 포털링, 없으면 기본 컨테이너를 사용한다.
  - `disabled?: boolean` — true 시 포털링을 건너뛰고 자식 노드를 그대로 렌더링한다.
  - `onContainerChange?: (node: HTMLElement) => void` — 컨테이너가 준비되면 단 한 번 호출한다.
- **SSR 안전성**
  - 서버 렌더링 시 포털 이동 없이 자식만 반환한다.
  - 클라이언트 최초 페인트 이후 `document` 존재를 확인하고 컨테이너를 생성한다. 문서가 없거나 언마운트된 경우 노드 생성·참조를 피한다.
- **정리**
  - 언마운트 시 동적으로 생성한 컨테이너를 제거하고 이벤트 리스너도 함께 해제한다.

## FocusTrap

- **props**
  - `active?: boolean` — 기본 true. false면 센티널만 배치하지 않고 포커스를 통과시킨다.
  - `initialFocus?: () => HTMLElement | null` — 트랩 활성 시 포커스를 줄 타깃 반환. 없으면 첫 포커스 가능한 요소로 이동한다.
  - `restoreFocus?: boolean` — 언마운트/비활성화 시 이전 포커스 위치로 복귀한다.
  - `loop?: boolean` — true 시 마지막 → 첫 번째, 첫 번째 → 마지막으로 포커스 루프.
  - `onMountAutoFocus?`, `onUnmountAutoFocus?` — 진입/복귀 직전에 호출, `event.preventDefault()` 시 기본 포커스 이동을 취소한다.
- **동작**
  - 앞/뒤 센티널 요소로 탭 이동을 감시하고, 루프 옵션에 따라 포커스를 되돌린다.
  - 스택 최상단만 포커스 트랩을 활성화하며, 하위 트랩은 비활성화 상태로 유지된다.
  - `active=false` 또는 `disabled` 시 센티널 제거 + restoreFocus 수행 없이 통과시킨다.

## DismissableLayer

- **props**
  - `disableOutsidePointerEvents?: boolean` — true 시 오버레이 바깥 포인터 이벤트를 `preventDefault()`하여 차단한다.
  - `onEscapeKeyDown?`, `onPointerDownOutside?`, `onFocusOutside?` — 각 이벤트 발생 시 호출. 핸들러에서 `event.preventDefault()` 하면 기본 dismiss를 중단한다.
  - `onDismiss?: (reason: "escape" | "pointer" | "focus") => void` — 닫힘 트리거 발생 시 단일 호출.
- **동작**
  - 캡처 단계 포인터 감시로 내부→외부로 이동하는 드래그(press inside, release outside)를 dismiss 대상으로 취급하지 않는다.
  - 스택 최상단만 ESC/외부 상호작용을 처리한다. 하위 레이어는 이벤트에 반응하지 않는다.
  - 포커스가 바깥으로 이동하려 할 때 `onFocusOutside` 후 `preventDefault()` 여부에 따라 유지 또는 dismiss를 결정한다.
  - 모달 시 오버레이 이외의 형제 DOM을 `inert` + `aria-hidden="true"`로 전환해 스크린 리더·포커스 유출을 차단하고, 언마운트 시 이전 상태로 복원한다.

## Positioner

- **props**
  - `anchorRef: RefObject<HTMLElement>` — 기준 앵커.
  - `placement?: "top" | "bottom" | "left" | "right"` + `align?: "start" | "center" | "end"` — 배치 축/정렬.
  - `offset?: number | { mainAxis?: number; crossAxis?: number }` — 앵커와의 거리.
  - `flip?: boolean` — 뷰포트 충돌 시 반대 축으로 뒤집음.
  - `shift?: boolean | { padding?: number }` — 뷰포트 안쪽으로 이동.
  - `strategy?: "absolute" | "fixed"` — 포지셔닝 전략.
  - `onUpdate?: (data: { x: number; y: number; placement: string }) => void` — 위치 계산 후 호출.
  - `arrowRef?: RefObject<HTMLElement>` — 화살표 요소 위치를 함께 계산.
- **동작**
  - resize/scroll/mutation 옵저버로 위치를 재계산한다.
  - 앵커가 사라지면 포지셔닝을 중단하고 `(0,0)` 기본값을 유지한다.
  - 포털 내부에서도 앵커 기준으로 배치된다(Portal 유무와 무관).

## 조합 예시

- **모달**: `Portal` → `DismissableLayer(disableOutsidePointerEvents)` → `FocusTrap(restoreFocus)` + `aria-modal="true"`/`role="dialog"`/`aria-labelledby` 연결.
- **드롭다운/팝오버**: `Portal` → `Positioner(offset+flip+shift)` → `DismissableLayer(onDismiss)`; 포커스 유지가 필요하면 `FocusTrap(active=false, restoreFocus=true)` 또는 `FocusScope` 대체.
- **토스트/비차단 알림**: `Positioner(strategy="fixed")`만 사용하고 dismiss 핸들러는 타이머/버튼 기반으로 처리한다(스택은 시맨틱 오버레이만 등록).

> 위 계약이 확정되면 추후 구현(PRD/테스트)은 해당 스펙을 변경하지 않는 범위에서 진행하며, 변경이 필요하면 Breaking 변동으로 간주한다.
