# Menu

> 파일: `packages/react/src/components/menu/README.md`
> 범위: 단일 레벨+1-depth 서브메뉴를 지원하는 컨텍스트/버튼 드롭다운 메뉴. Command palette/Select는 별도 컴포넌트.

## 1) 목적 / 범위

- **목적:** Anchored overlay 중 키보드 내비게이션/선택 중심 메뉴의 계약을 정의한다.
- **성공 기준:** Trigger/List/Item/Group/Separator/Submenu 계약과 roving focus/typeahead/닫힘 규칙이 합의되고, 이후 구현·테스트·스토리가 이를 따른다.

---

## 2) Public API (Props 계약)

### Menu (루트 상태/컨텍스트)

| 속성 | 값/형식 | 기본값 | 설명 |
| --- | --- | --- | --- |
| **open** | boolean | — | 제어 모드 열림 상태. |
| **defaultOpen** | boolean | false | 비제어 초기값. |
| **onOpenChange** | `(open: boolean) => void` | — | 열림/닫힘 전환 시 호출. |
| **placement** | `Placement` (`top|bottom|left|right` + `-start|center|end`) | `bottom-start` | 리스트가 트리거 대비 놓일 위치. |
| **offset** | number | 6 | 앵커와 리스트 간격(px). |
| **strategy** | `"absolute" \| "fixed"` | "absolute" | 포지셔닝 전략. |
| **openOnHover** | boolean | false | true이면 hover로도 오픈(서브메뉴 포함). 기본은 click/press 전용. |
| **closeOnSelect** | boolean | true | 항목 선택 시 메뉴 닫기. checkbox/radio는 상태 토글 후에도 닫을지 여부. |
| **loopFocus** | boolean | true | roving focus가 끝에서 다시 처음으로 순환할지 여부. |
| **typeaheadTimeout** | number(ms) | 700 | 연속 타이핑으로 검색할 때 리셋까지의 시간. |
| **portalContainer** | `HTMLElement \| null` | 기본 Portal 컨테이너 | 리스트 렌더 위치. |

### MenuTrigger (MenuButton)

| 속성 | 값/형식 | 기본값 | 설명 |
| --- | --- | --- | --- |
| **asChild** | boolean | false | 자식 요소로 치환. 이벤트/ARIA/refs 병합. |
| **children** | ReactNode | — | 메뉴를 여는 버튼 또는 커스텀 앵커. |
| **disabled** | boolean | — | true이면 press 무시. |
| **aria-label** | 문자열 | — | 레이블 없는 아이콘 트리거 시 필수. |

### MenuContent (MenuList)

| 속성 | 값/형식 | 기본값 | 설명 |
| --- | --- | --- | --- |
| **children** | ReactNode | — | `MenuItem`/`MenuGroup`/`MenuSeparator` 등을 포함. |
| **id** | string | 자동 생성 | `aria-controls`/`aria-labelledby` 연결용. |
| **aria-label** | 문자열 | — | 시각적 제목 없을 때 필수. |
| **className / style** | 문자열 / 스타일 | — | 리스트 래퍼 병합. |
| **asChild** | boolean | false | 사용자 정의 래퍼 사용. |

### MenuItem / MenuCheckboxItem / MenuRadioGroup / MenuRadioItem

| 컴포넌트 | 주요 Props | 설명 |
| --- | --- | --- |
| **MenuItem** | `onSelect: () => void`, `disabled?: boolean`, `shortcut?: string`, `inset?: boolean` | 기본 항목. press/Enter/Space/Click로 선택, `closeOnSelect`에 따라 닫힘. `shortcut`은 보조 텍스트 슬롯. |
| **MenuCheckboxItem** | `checked: boolean`, `onCheckedChange: (checked: boolean) => void`, `disabled?`, `shortcut?` | 토글 가능 항목. Space/Click로 체크 전환 후 `closeOnSelect`에 따라 닫힘. 체크 상태는 `role="menuitemcheckbox"`. |
| **MenuRadioGroup** | `value: string`, `onValueChange: (value: string) => void`, `name?: string` | 동일 그룹 내 `MenuRadioItem`을 관리. `aria-labelledby`로 외부/Label과 연결. |
| **MenuRadioItem** | `value: string`, `disabled?: boolean`, `shortcut?` | `role="menuitemradio"`. 선택 시 그룹 value를 변경하고 필요 시 닫힘. |

### MenuGroup / MenuLabel / MenuSeparator / MenuArrow

- **MenuGroup:** 관련 항목 묶음. `aria-labelledby`로 Label id와 연결.
- **MenuLabel:** 그룹 제목. 자동 id를 생성해 그룹에 전달.
- **MenuSeparator:** 구분선(`role="separator"`).
- **MenuArrow:** Positioner arrow props 사용. 필요한 경우만 렌더.

### MenuSub / MenuSubTrigger / MenuSubContent (1-depth 서브메뉴)

- **MenuSub:** 서브메뉴 상태 컨텍스트. 별도 Props 없음, 부모 Menu의 placement/offset을 기본 상속하되 `placement="right-start"`를 기본으로 사용.
- **MenuSubTrigger:** 부모 MenuItem 역할 + `aria-haspopup="menu"`, `aria-expanded` 관리. hover 또는 방향키 Right로 열림, Left/ESC로 닫힘.
- **MenuSubContent:** 서브 리스트. `closeDelay`(기본 150ms) 동안 pointer-safe polygon 지원을 염두에 둔다. 포지셔닝은 `usePositioner`를 재사용.

---

## 3) 동작 계약 (Behavior)

- **열림:** Trigger press(Click/Enter/Space) 기본. `openOnHover` true이면 hover/포인터 진입 시 `openDelay`(기본 150ms) 후 열림.
- **닫힘:**
  - ESC 또는 `closeOnInteractOutside`(기본 true)로 외부 클릭 시 닫힘.
  - 포커스가 Menu 컨텍스트 밖으로 이동하면 닫음. Trigger 포커스 복귀.
  - 항목 선택 시 `closeOnSelect` true면 닫고 `onOpenChange(false)` 호출.
- **포커스/내비게이션:**
  - Roving tabIndex로 한 번에 하나의 항목만 tabIndex=0. ArrowUp/Down, Home/End 이동. `loopFocus`에 따라 첫↔끝 순환.
  - Typeahead: 연속 입력을 `typeaheadTimeout` 윈도우 내 버퍼링해 첫 매칭 항목으로 포커스 이동. 한글 초성 등은 제외(문서화).
  - 서브메뉴: Right Arrow 또는 hover 지연 후 열림, Left/ESC로 부모로 복귀. 부모 메뉴는 열린 서브메뉴가 닫힐 때까지 focus/selection을 유지.
- **포지셔닝:** `usePositioner` 활용. 서브메뉴는 기본 `right-start` + 동일 offset. Arrow 사용 시 `data-side/align` 제공.

---

## 4) 접근성 계약 (A11y)

- **역할:** Trigger `aria-haspopup="menu"` + `aria-expanded`. Content `role="menu"`, Item `role="menuitem"`/`menuitemcheckbox`/`menuitemradio`.
- **레이블링:** Trigger는 레이블 필요. MenuContent는 `aria-labelledby`(Label/외부 id) 또는 `aria-label`로 이름을 가져야 한다. Group/Label을 통한 서브 레이블 연결.
- **포커스 관리:** 메뉴가 열릴 때 첫 활성 항목에 포커스, 닫힐 때 Trigger로 복귀. 포커스 트랩은 사용하지 않지만 Tab키는 메뉴를 닫고 다음 포커스로 이동하도록 한다.
- **키보드 상호작용:**
  - Enter/Space → 선택. Arrow 키는 포커스 이동, Right/Left로 서브 열림/닫힘.
  - ESC → 현재 메뉴 계층 닫기. 상위 메뉴 존재 시 상위로 포커스 이동.
- **마우스/포인터:** 서브메뉴는 pointer-safe polygon(향후 `useHoverIntent` 연동)으로 포인터 지름길 이동 시 닫힘을 지연시켜 사용성을 보장.

---

## 5) 컴포지션 / 슬롯

- 구조: `Menu` → `MenuTrigger` → `MenuContent` → (`MenuItem` | `MenuCheckboxItem` | `MenuRadioGroup`→`MenuRadioItem` | `MenuGroup`→`MenuLabel`/`MenuItem` | `MenuSeparator` | `MenuSub`→`MenuSubTrigger`+`MenuSubContent`).
- 데이터 속성: `data-state`, `data-disabled`, `data-highlighted`(focus된 항목), `data-checked`, `data-submenu-open`, `data-side`/`data-align`.
- Portal/Positioner/DismissableLayer와 조합 가능, `asChild`로 애니메이션 래퍼에 위임.

---

## 6) Exports 계약

- **@ara/react**
  - `@ara/react/menu` → `Menu`, `MenuTrigger`, `MenuContent`, `MenuItem`, `MenuCheckboxItem`, `MenuRadioGroup`, `MenuRadioItem`, `MenuGroup`, `MenuLabel`, `MenuSeparator`, `MenuArrow`, `MenuSub`, `MenuSubTrigger`, `MenuSubContent` 및 Props 타입
- **package.json (react 패키지)**
  - `exports`: `./menu`(ESM) + `types`, `sideEffects:false`
  - Node ≥ 22, ESM 우선, d.ts 포함

---

## 7) 테스트/스토리 요구

- 키보드 내비게이션(Arrow/Home/End/Enter/Space/ESC)과 typeahead 버퍼링 시나리오 검증.
- `closeOnSelect`/`openOnHover`/서브메뉴 지연 등의 상호작용 스냅, RTL/Portal 환경에서 포지셔닝/aria 연결 확인.
