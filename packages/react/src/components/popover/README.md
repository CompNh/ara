# Popover

> 파일: `packages/react/src/components/popover/README.md`
> 범위: 앵커에 붙는 작은 대화상자. 간단한 폼/버튼 등 **인터랙티브 콘텐츠**를 포함하지만 전체 모달/드로어는 제외.

## 1) 목적 / 범위

- **목적:** Anchored overlay 제품군 중 상호작용형 팝오버의 Props/동작/A11y/Exports를 정의한다.
- **성공 기준:** Trigger/Content/Arrow/Close 슬롯과 상태(open)·포지셔닝(placement/offset)·해제 규칙(ESC/바깥클릭)이 합의되고, 이후 구현/스토리/테스트가 이를 준수한다.

---

## 2) Public API (Props 계약)

### Popover (루트 상태/컨텍스트)

| 속성 | 값/형식 | 기본값 | 설명 |
| --- | --- | --- | --- |
| **open** | boolean | — | 제어 모드. 상위가 열림/닫힘을 직접 관리. |
| **defaultOpen** | boolean | false | 비제어 초기 열림 여부. |
| **onOpenChange** | `(open: boolean) => void` | — | 상태가 변할 때 호출. 제어/비제어 공통. |
| **placement** | `Placement` (`top\|bottom\|left\|right` + `-start\|center\|end`) | `bottom-start` | 앵커 대비 배치 위치. `@ara/core/use-positioner`와 동일. |
| **offset** | number | 8 | 앵커와 콘텐츠 사이 간격(px). |
| **strategy** | `"absolute" \| "fixed"` | "absolute" | 포지셔닝 전략. 스크롤 고정 시 `fixed`. |
| **withArrow** | boolean | false | true일 때 `PopoverArrow` 렌더. |
| **modal** | boolean | false | true이면 `use-focus-trap`을 사용해 Tab 순환을 가두고, 오버레이 뒤 영역을 inert/aria-hidden 처리한다. |
| **closeOnEscape** | boolean | true | ESC 키로 닫기 허용 여부. |
| **closeOnInteractOutside** | boolean | true | 콘텐츠 외부 클릭/포인터다운 시 닫기 여부. |
| **closeOnFocusOutside** | boolean | true | 포커스가 외부로 이동하면 닫기 여부. 폼 입력 유지 시 false로 설정. |
| **returnFocusOnClose** | boolean | true | 닫힐 때 Trigger로 포커스를 돌려준다(모달=true일 때 필수). |
| **portalContainer** | `HTMLElement \| null` | 기본 Portal 컨테이너 | 콘텐츠 렌더링 위치. |
| **className / style** | 문자열 / 스타일 | — | 루트 래퍼에 병합. |

### PopoverTrigger

| 속성 | 값/형식 | 기본값 | 설명 |
| --- | --- | --- | --- |
| **asChild** | boolean | false | 자식 요소를 그대로 렌더하고 이벤트/ARIA/refs를 병합. |
| **children** | ReactNode | — | 팝오버를 여닫는 앵커. 기본 동작은 press(Enter/Space/Click) 토글. |
| **disabled** | boolean | — | true이면 해당 트리거만 비활성(press 무시). |
| **aria-label** | 문자열 | — | 아이콘 전용 트리거 시 필수. |

### PopoverContent

| 속성 | 값/형식 | 기본값 | 설명 |
| --- | --- | --- | --- |
| **children** | ReactNode | — | 인터랙티브 콘텐츠(버튼, 폼 등). |
| **id** | string | 자동 생성 | `aria-controls`/`aria-describedby` 연결용 id. |
| **aria-label** | 문자열 | — | 시각적 제목이 없을 때 필수. |
| **aria-labelledby / aria-describedby** | 문자열 | — | 외부 제목/설명 노드 id 연결. 내부 Header/Body와 병합. |
| **className / style** | 문자열 / 스타일 | — | 콘텐츠 래퍼 병합. |
| **asChild** | boolean | false | 사용자 정의 래퍼 사용 시. |

### PopoverArrow / PopoverClose / PopoverHeader / PopoverBody / PopoverFooter

- **PopoverArrow:** Props 없음. `withArrow` true일 때 사용하며 Positioner `data-side/align`/`style` 적용.
- **PopoverClose:** `asChild` 지원, 클릭/press 시 닫기. 기본 role=button/`aria-label="Close"` 권장.
- **PopoverHeader/Body/Footer:** 시맨틱 래퍼. Header id를 자동으로 생성해 Content의 `aria-labelledby`에 병합한다.

---

## 3) 동작 계약 (Behavior)

- **토글:** Trigger press(Click/Enter/Space) 시 `open` ↔ `closed`. 제어 모드에서는 `onOpenChange`만 호출하고 실제 상태는 상위가 유지.
- **닫힘:**
  - `closeOnEscape`가 true이면 ESC keyup으로 닫고, `onOpenChange(false)` 호출.
  - `closeOnInteractOutside` true → 콘텐츠 밖 포인터 다운/클릭 시 닫음. `preventDefault()`로 사용자 쪽에서 차단 가능.
  - `closeOnFocusOutside` true → 포커스가 컨텍스트 밖으로 이동하면 닫음(모달 모드에서 기본). 폼 제출 등으로 포커스 이동이 필요한 경우 false로 설정.
- **포커스 관리:**
  - `modal=true` → `use-focus-trap`으로 Tab 순환, 초기 포커스는 첫 포커스 가능 요소 또는 콘텐츠에 `autoFocus` 지정된 요소.
  - 닫힐 때 `returnFocusOnClose` true라면 마지막 Trigger로 포커스 복귀.
- **포지셔닝:** `usePositioner`로 anchor/floating/arrow props 제공. flip/shift 기본 true, `placement`/`offset`/`strategy` 옵션을 그대로 전달.
- **상태 동기화:** 내부 상태 변화 시 Context를 통해 Trigger/Content에 `data-state="open|closed"` 전달해 스타일/애니메이션 훅으로 사용.

---

## 4) 접근성 계약 (A11y)

- **역할:** 콘텐츠는 기본적으로 `role="dialog"`(modal=true 시 `aria-modal="true"`). 비모달 시에도 `aria-modal`은 false로 유지하되 dismiss 규칙을 동일하게 적용.
- **연결:** Trigger에는 `aria-haspopup="dialog"`와 `aria-controls={contentId}`를 설정하고, 열림 상태에 따라 `aria-expanded`를 업데이트한다.
- **레이블링:** Header가 있으면 그 id를 `aria-labelledby`에 병합. Header가 없을 때는 `aria-label` 제공 필수. Body 텍스트는 `aria-describedby`에 포함 가능.
- **키보드:** ESC 닫힘, Tab 순환(모달), Shift+Tab 역방향, Trigger 포커스 복귀. 외부 영역은 modal=true일 때 inert/aria-hidden 처리로 스크린 리더 격리.
- **포털:** Portal 렌더링으로 문서 순서가 달라져도 `aria-controls`로 연결된다.

---

## 5) 컴포지션 / 슬롯

- 구조: `Popover` → `PopoverTrigger` → `PopoverContent` (+ `PopoverHeader`/`Body`/`Footer`/`PopoverClose`/`PopoverArrow`).
- 스타일 훅: `data-state`, `data-side`, `data-align`, `data-placement`, `data-modal` 등을 콘텐츠/화살표에 노출.
- DismissableLayer/Portal/FocusTrap/Positioner를 내부에서 조합하되, `asChild`를 통해 애니메이션 래퍼와 병합 가능.

---

## 6) Exports 계약

- **@ara/react**
  - `@ara/react/popover` → `Popover`, `PopoverTrigger`, `PopoverContent`, `PopoverArrow`, `PopoverClose`, `PopoverHeader`, `PopoverBody`, `PopoverFooter` 및 Props 타입
- **package.json (react 패키지)**
  - `exports`: `./popover`(ESM) + `types`, `sideEffects:false`
  - Node ≥ 22, ESM 우선, d.ts 포함

---

## 7) 테스트/스토리 요구

- Trigger press 토글, ESC/외부 클릭/포커스 아웃 닫힘, `modal` 포커스 트랩 시나리오에 대한 RTL/Vitest 스냅.
- `placement`/`offset`/`withArrow` 조합 시각 회귀, `aria-expanded`/`aria-controls` 연결 검증.
