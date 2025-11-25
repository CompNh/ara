# Switch

> 파일: `packages/react/src/components/switch/README.md`
> 범위: 토글 스위치(checkbox semantics 기반). 체크박스/라디오 그룹은 별도 문서 참고.

## 1) 목적 / 범위

- **목적:** 스위치의 Props·이벤트·상태(data-state)·ARIA 계약을 확정한다.
- **성공 기준:** 폼 제출/키보드/스크린리더 동작이 계약과 일치하며, 변경 시 Major 로 관리한다.

---

## 2) Public API (Props 계약)

| 속성 | 값/형식 | 기본값 | 설명 |
| --- | --- | --- | --- |
| **checked** | boolean | — | 제어 모드 상태. 존재 시 `onCheckedChange` 필수. |
| **defaultChecked** | boolean | false | 비제어 초기 상태. |
| **onCheckedChange** | `(checked: boolean) => void` | — | 상태 변경 시 호출. 스페이스/클릭/폼 reset 등 모든 변경 경로 포함. |
| **name** | string | — | 폼 제출용 이름. 숨김 체크박스에 적용. |
| **value** | string | "on" | 제출 값. 미선택 시 제출되지 않음. |
| **label** | ReactNode | — | 시각적 레이블. `<label for>` 연결. |
| **description** | ReactNode | — | 보조 설명. `aria-describedby` 연결. |
| **disabled** | boolean | false | 상호작용 차단 + `data-disabled` + `aria-disabled`. |
| **readOnly** | boolean | false | 읽기 전용. 포커스는 허용하되 토글 차단, `aria-readonly` 적용. |
| **required** | boolean | false | 필수 여부. 네이티브 검증 힌트(`aria-required`). |
| **invalid** | boolean | false | 오류 상태. `aria-invalid` + `data-invalid`. |
| **id** | string | — | 숨김 `<input>` id. 미지정 시 자동 생성. |
| **inputRef** | `React.Ref<HTMLInputElement>` | — | 내부 `<input type="checkbox">` 포워딩. |
| **className / style** | 문자열 / 스타일 | — | 루트 요소에 병합. |

> **역할:** 스위치는 시맨틱상 체크박스를 사용하되, 커스텀 UI에 `role="switch"` + `aria-checked`를 부여한다.

---

## 3) 동작 계약 (Behavior)

- **토글:** 클릭/Space/Enter 로 `true ↔ false` 전환. `readOnly` 는 토글 무효화, `disabled` 는 포커스도 차단.
- **폼 제출:** `name` 설정 시 체크박스 값으로 제출. 미체크 시 제출 생략. `value` 는 문자열만 허용.
- **reset 대응:** 비제어 모드에서 `form.reset()` 시 초기값으로 돌아가며, 제어 모드에서는 상위에서 `checked` 갱신 필요.
- **포커스:** 키보드 진입 시 포커스 링 표시. 클릭 시에도 포커스 유지해 토글 후 단절 방지.

---

## 4) 접근성 계약 (A11y)

- **역할/속성:** 커스텀 UI에 `role="switch"` + `aria-checked` 적용. 숨김 체크박스는 시각적으로 숨기되 포커스/스크린리더 가능하도록 유지.
- **레이블/설명:** `label`/`description` 은 각각 `aria-labelledby`/`aria-describedby` 로 연결. 외부 aria 전달 시 병합.
- **상태 ARIA:**
  - `disabled` → `aria-disabled="true"`
  - `readOnly` → `aria-readonly="true"`
  - `required` → `aria-required="true"`
  - `invalid` → `aria-invalid="true"`
- **키보드:** Space/Enter 토글, `Tab` 포커스 이동. 방향키 특별 처리 없음.

---

## 5) 스타일/데이터 속성

- **데이터 속성:** `[data-state="checked|unchecked"]`, `[data-disabled]`, `[data-readonly]`, `[data-required]`, `[data-invalid]`.
- **CSS 변수:** thumb/track 색상·크기·애니메이션 토큰을 상태별로 제공. 포커스 링/disabled opacity 포함.
- **클래스 병합:** 기본 스타일 뒤 사용자 `className` 적용.

---

## 6) Exports 계약

- **@ara/react**: `@ara/react/switch` → `Switch`, `SwitchProps`
- **@ara/core**: `@ara/core/use-switch` → `useSwitch`, `UseSwitchResult`
- **package.json (react 패키지)**: `exports`에 `./switch`(ESM) + `types`, `sideEffects:false`

---

## 7) 에지 케이스 / 동결 규칙

- `disabled && readOnly` → disabled 우선, readOnly ARIA 생략.
- `required` 는 UI 표시 선택적이며, 실제 검증/오류 메시지는 상위 폼 로직에서 처리.
- 계약 변경은 Major 사유로 취급한다.
