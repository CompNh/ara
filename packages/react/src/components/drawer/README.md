# Drawer

> 파일: `packages/react/src/components/drawer/README.md`
> 범위: 화면 가장자리에서 슬라이드 진입하는 모달 드로어. 단순 토스트/패널은 제외하며, Dialog와 동일한 포커스·스크롤 제어를 갖는다.

## 1) 목적 / 범위

- **목적:** Drawer 컴포넌트군의 Props/동작/A11y/Exports 계약을 정의한다.
- **성공 기준:** 방향(side), 포커스 트랩, 닫힘 규칙, 타이틀/설명 슬롯 계약이 고정되고 이후 구현·스토리·테스트가 동일하게 따른다.

---

## 2) Public API (Props 계약)

### Drawer (루트 상태/컨텍스트)

| 속성 | 값/형식 | 기본값 | 설명 |
| --- | --- | --- | --- |
| **open** | boolean | — | 제어 모드. 상위가 열림/닫힘을 직접 관리. |
| **defaultOpen** | boolean | false | 비제어 초기 열림 여부. |
| **onOpenChange** | `(open: boolean) => void` | — | 상태 변화 시 호출. |
| **initialFocus** | `HTMLElement \| (() => HTMLElement \| null) \| null` | 첫 포커스 가능한 요소 | 콘텐츠 마운트 시 포커스 대상. |
| **restoreFocus** | boolean | true | 닫힐 때 트리거 등 이전 포커스로 복귀. |
| **closeOnEsc** | boolean | true | ESC keyup 시 닫기 여부. |
| **closeOnOutsideClick** | boolean | true | 스크림 바깥 포인터 다운/클릭 시 닫기 여부. |
| **side** | `"left" \| "right" \| "top" \| "bottom"` | "right" | 드로어가 진입하는 방향. `data-side`로 노출. |
| **size** | `"sm" \| "md" \| "lg"` | "md" | 방향별 폭/높이 프리셋. |
| **mount** | `"portal" \| "inline"` | "portal" | Portal 렌더 여부. |
| **className / style** | 문자열 / 스타일 | — | 루트 래퍼 병합. |

### DrawerTrigger

| 속성 | 값/형식 | 기본값 | 설명 |
| --- | --- | --- | --- |
| **asChild** | boolean | false | 자식 엘리먼트를 그대로 사용. |
| **children** | ReactNode | — | 드로어를 여는 트리거. |
| **disabled** | boolean | — | 개별 트리거 비활성화. |
| **aria-label** | 문자열 | — | 시각적 레이블이 없을 때 필수. |

### DrawerOverlay / DrawerContent / DrawerHeader / DrawerTitle / DrawerDescription / DrawerFooter / DrawerClose

- **DrawerOverlay:** Props 없음. `data-state` 노출, 외부 클릭 닫힘과 ESC 처리에 참여.
- **DrawerContent:** `id` 자동 생성, `aria-` 속성 병합, `className`/`style`/`asChild` 지원. `data-side`/`data-size`/`data-state`를 스타일 훅으로 제공한다.
- **DrawerHeader/Footer:** 시맨틱 래퍼. Title id를 `aria-labelledby`에 병합.
- **DrawerTitle/DrawerDescription:** `asChild` 지원, ARIA 연결용 id를 제공.
- **DrawerClose:** `asChild` 지원, press 시 닫힘. 기본 `aria-label="Close"` 권장.

---

## 3) 동작 계약 (Behavior)

- **열림/닫힘:** Trigger press로 `open` 토글. 제어 모드는 `onOpenChange`만 호출. `closeOnEsc`/`closeOnOutsideClick` 규칙은 Dialog와 동일하게 적용한다.
- **포커스/트랩:** 열리면 `initialFocus` 또는 첫 포커스 가능한 요소로 이동하고, 열린 동안 Tab 순환을 콘텐츠 내부에 제한한다. 닫힐 때 `restoreFocus` true이면 마지막 Trigger로 복귀한다.
- **포지셔닝:** `side`에 따라 Content가 스크린 가장자리에서 슬라이드 진입한다. `data-side`/`data-state`를 CSS 전환에 사용하며, 스크롤은 잠그고 배경 영역은 inert/aria-hidden 처리한다.
- **중첩/우선순위:** 여러 Drawer/Modal이 중첩될 때 최상단만 ESC/외부 클릭을 처리한다. `mount`가 portal이든 inline이든 동일하게 동작해야 한다.

---

## 4) 접근성 계약 (A11y)

- **역할:** `DrawerContent`는 `role="dialog"`, `aria-modal="true"`를 사용한다(드로어이지만 모달 계약 동일 적용).
- **레이블/설명:** Title/Description id를 각각 `aria-labelledby`/`aria-describedby`에 병합한다. 없는 경우 `aria-label` 필수.
- **트리거 연결:** Trigger에 `aria-haspopup="dialog"`, `aria-controls`, `aria-expanded`를 상태에 맞게 설정한다.
- **키보드:** ESC 닫힘, Tab/Shift+Tab 순환, 포커스 복귀. 방향 전환과 무관하게 키보드 규칙은 유지한다.
- **포털:** Portal 렌더링 시에도 aria 연결이 깨지지 않도록 id 연결을 유지한다.

---

## 5) 컴포지션 / 슬롯

- 구조: `Drawer` → `DrawerTrigger` → (`DrawerOverlay` + `DrawerContent` 안에 `DrawerHeader`/`DrawerTitle`/`DrawerDescription`/`DrawerFooter`/`DrawerClose`).
- 스타일 훅: `data-state`, `data-side`, `data-size`를 Overlay/Content/Close에 노출해 슬라이드/페이드 애니메이션과 토큰 매핑에 사용한다.
- 내부 조합: Portal + DismissableLayer + FocusTrap + ScrollLock을 사용하되, `asChild`로 모션 래퍼/레이아웃 래퍼와 안전하게 병합한다.

---

## 6) Exports 계약

- **@ara/react**
  - `@ara/react/drawer` → `Drawer`, `DrawerTrigger`, `DrawerOverlay`, `DrawerContent`, `DrawerHeader`, `DrawerTitle`, `DrawerDescription`, `DrawerFooter`, `DrawerClose` 및 Props/Context 타입
- **package.json (react 패키지)**
  - `exports`: `./drawer`(ESM) + `types`, `sideEffects:false`
  - Node ≥ 22, ESM 우선, d.ts 포함

---

## 7) 테스트/스토리 요구

- side/size 조합별 레이아웃과 애니메이션 상태 스냅, ESC/외부 클릭 닫힘, 포커스 트랩/복귀, 포털 vs 인라인 렌더링 시나리오를 테스트한다.
- `aria-labelledby`/`aria-describedby` 연결, 중첩 드로어/다이얼로그에서 최상단만 닫힘 이벤트를 처리하는지 검증한다.
