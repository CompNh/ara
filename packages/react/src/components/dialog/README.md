# Dialog

> 파일: `packages/react/src/components/dialog/README.md`
> 범위: 전역 스크림과 포커스 트랩을 동반하는 **모달 다이얼로그**. 페이지 일부에 고정된 드로어/시트는 제외한다.

## 1) 목적 / 범위

- **목적:** Dialog 컴포넌트군의 Props/동작/A11y/Exports 계약을 고정한다.
- **성공 기준:** 열림 제어, 포커스 진입/복귀, 닫힘 규칙(ESC/바깥 클릭)과 타이틀·설명 연결 계약이 합의되고 이후 구현·스토리·테스트에서 동일하게 적용된다.

---

## 2) Public API (Props 계약)

### Dialog (루트 상태/컨텍스트)

| 속성 | 값/형식 | 기본값 | 설명 |
| --- | --- | --- | --- |
| **open** | boolean | — | 제어 모드. 존재 시 내부 상태를 사용하지 않고 상위가 열림/닫힘을 관리한다. |
| **defaultOpen** | boolean | false | 비제어 초기값. 이후 상태는 내부에서 유지한다. |
| **onOpenChange** | `(open: boolean) => void` | — | 열림 상태가 변할 때 호출. 제어/비제어 공통. |
| **initialFocus** | `HTMLElement \| (() => HTMLElement \| null) \| null` | 첫 포커스 가능한 요소 | 콘텐츠 마운트 시 포커스를 둘 대상. 무효하면 첫 포커스 가능한 요소로 대체. |
| **restoreFocus** | boolean | true | 닫히거나 언마운트될 때 트리거 등 이전 포커스로 복귀. |
| **closeOnEsc** | boolean | true | ESC keyup 시 닫기 허용 여부. |
| **closeOnOutsideClick** | boolean | true | 오버레이 밖 포인터 다운/클릭 시 닫기 여부. |
| **size** | `"sm" \| "md" \| "lg"` | "md" | 콘텐츠 영역 너비/패딩 프리셋. |
| **mount** | `"portal" \| "inline"` | "portal" | 콘텐츠 렌더 위치. portal이면 DOM 최상단에 렌더한다. |
| **className / style** | 문자열 / 스타일 | — | 루트 래퍼 병합. |

### DialogTrigger

| 속성 | 값/형식 | 기본값 | 설명 |
| --- | --- | --- | --- |
| **asChild** | boolean | false | 자식 요소를 그대로 렌더하며 이벤트/refs/ARIA를 병합. |
| **children** | ReactNode | — | 다이얼로그를 여는 트리거. 기본 press(Enter/Space/Click) 토글. |
| **disabled** | boolean | — | true이면 해당 트리거만 비활성화. |
| **aria-label** | 문자열 | — | 아이콘 트리거 등 레이블 없는 경우 필수. |

### DialogOverlay / DialogContent / DialogHeader / DialogTitle / DialogDescription / DialogFooter / DialogClose

- **DialogOverlay:** Props 없음. 루트 `closeOnOutsideClick`/`closeOnEsc`에 따라 닫힘 처리를 연결하고 `data-state=open|closed`를 노출한다.
- **DialogContent:** `id` 자동 생성, `aria-label`/`aria-labelledby`/`aria-describedby` 병합 지원, `className`/`style`/`asChild` 제공. `size` 프리셋을 data-attribute로 노출한다(`data-size`).
- **DialogHeader/Footer:** 시맨틱 래퍼. Header 안의 Title id를 Content의 `aria-labelledby`에 병합한다.
- **DialogTitle/DialogDescription:** `asChild` 지원, 각각 `aria-labelledby`/`aria-describedby` 연결에 사용되는 id를 제공한다.
- **DialogClose:** `asChild` 지원, 클릭/press 시 닫고 `aria-label="Close"` 권장.

---

## 3) 동작 계약 (Behavior)

- **열림/닫힘:** Trigger press → `open` 토글. 제어 모드는 `onOpenChange`만 호출. `closeOnEsc` true이면 ESC keyup에서 닫고, `closeOnOutsideClick` true이면 Overlay 외부 포인터 다운/클릭에서 닫는다.
- **포커스 진입/복귀:** 콘텐츠가 열리면 `initialFocus` 대상으로 포커스를 이동하고, 없으면 첫 포커스 가능한 요소나 콘텐츠 자체로 이동한다. 닫힐 때 `restoreFocus` true라면 마지막 Trigger로 포커스를 돌려준다.
- **포커스 트랩:** 열린 동안 Tab 순환이 콘텐츠 내부에 가둬진다. Shift+Tab으로 역방향 이동이 가능하고, 포커스 가드는 사용자 마크업에 영향이 없어야 한다.
- **중첩 처리:** 동시에 여러 Dialog가 있을 때 최상단만 ESC/외부 클릭에 반응한다. 데이터 속성으로 `data-state`를 모든 슬롯에 전달해 스타일/애니메이션 훅이 가능해야 한다.
- **마운트 위치:** `mount="portal"`이면 Portal을 사용해 문서 끝에 렌더하고, `"inline"`이면 트리거 인근에 인라인 렌더한다. A11y 계약은 동일하게 유지한다.

---

## 4) 접근성 계약 (A11y)

- **역할:** `DialogContent`는 `role="dialog"`와 `aria-modal="true"`를 기본 적용한다.
- **레이블/설명:** `DialogTitle` id를 `aria-labelledby`에, `DialogDescription` id를 `aria-describedby`에 병합한다. 둘 중 하나가 없으면 `aria-label`이나 외부 id를 명시해야 한다.
- **트리거 연결:** Trigger에 `aria-haspopup="dialog"`, `aria-controls={contentId}`, `aria-expanded`(상태 기반)를 설정한다.
- **키보드:** ESC 닫힘, Tab/Shift+Tab 순환, 포커스 복귀, 스크림 영역은 포커스 불가. `closeOnEsc=false`일 때는 문서에 ESC가 통과됨을 명시한다.
- **포털 렌더링:** Portal 사용 시에도 `aria-controls`/`aria-labelledby` 연결로 스크린 리더 탐색이 유지되어야 한다.

---

## 5) 컴포지션 / 슬롯

- 구조: `Dialog` → `DialogTrigger` → (`DialogOverlay` + `DialogContent` 안에 `DialogHeader`/`DialogTitle`/`DialogDescription`/`DialogFooter`/`DialogClose`).
- 스타일 훅: `data-state`, `data-size`, `data-open` 등을 Overlay/Content/Close에 노출해 CSS 애니메이션과 토큰 매핑을 가능하게 한다.
- 내부적으로 Portal + DismissableLayer + FocusTrap + ScrollLock을 조합하지만, `asChild`를 통해 애니메이션 래퍼와 안전하게 병합된다.

---

## 6) Exports 계약

- **@ara/react**
  - `@ara/react/dialog` → `Dialog`, `DialogTrigger`, `DialogOverlay`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogClose` 및 Props/Context 타입
- **package.json (react 패키지)**
  - `exports`: `./dialog`(ESM) + `types`, `sideEffects:false`
  - Node ≥ 22, ESM 우선, d.ts 포함

---

## 7) 테스트/스토리 요구

- 열림/닫힘 제어/비제어 시나리오, ESC/외부 클릭 닫힘, 포커스 트랩 및 복귀, `mount` 옵션에 따른 포털 렌더링 스냅.
- size 프리셋에 따른 레이아웃, `aria-labelledby`/`aria-describedby` 연결, 중첩 다이얼로그에서 최상단만 닫힘 이벤트 처리하는지에 대한 테스트를 준비한다.
