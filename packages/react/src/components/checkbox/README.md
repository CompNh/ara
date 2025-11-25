# Checkbox / CheckboxGroup

> 파일: `packages/react/src/components/checkbox/README.md`
> 범위: 단일 체크박스와 체크박스 그룹(다중 선택). 토글 스위치, 라디오 그룹은 별도 계약 참고.

## 1) 목적 / 범위

- **목적:** 체크박스/체크박스 그룹의 Props·이벤트·상태(data-state)·Exports 계약을 확정한다.
- **성공 기준:** 구현/스토리/테스트가 본 계약과 일치하며, 이후 변경은 SemVer Major 사유로 관리한다.

---

## 2) Public API (Props 계약)

### Checkbox

| 속성 | 값/형식 | 기본값 | 설명 |
| --- | --- | --- | --- |
| **checked** | `boolean | "indeterminate"` | — | 제어 모드 상태. 존재 시 `onCheckedChange` 필수. |
| **defaultChecked** | `boolean | "indeterminate"` | false | 비제어 초기 상태. 이후 내부에서 관리. |
| **onCheckedChange** | `(state: boolean | "indeterminate") => void` | — | 상태 변경 시 호출. indeterminate → click/space 시 `true` 로 전환. |
| **value** | string | "on" | 폼 제출 값. 그룹 내에서는 각 항목의 고유 값. |
| **name** | string | — | 네이티브 폼 제출용 이름. 그룹에서 전달받은 이름 우선. |
| **label** | ReactNode | — | 표시 레이블. `<label for>` 연결. |
| **description** | ReactNode | — | 보조 설명. `aria-describedby` 연결. |
| **disabled** | boolean | false | 상호작용 차단 + `data-disabled` + `aria-disabled`. |
| **readOnly** | boolean | false | 읽기 전용. 값 보여주되 토글 차단, `aria-readonly` 적용. |
| **required** | boolean | false | 필수 여부. `aria-required` 적용, UI 표시 선택. |
| **invalid** | boolean | false | 오류 상태. `aria-invalid` + `data-invalid`. |
| **id** | string | — | 숨김 `<input>` id. 미지정 시 자동 생성. |
| **inputRef** | `React.Ref<HTMLInputElement>` | — | 내부 `<input type="checkbox">` 포워딩. |
| **className / style** | 문자열 / 스타일 | — | 루트 요소에 병합. 사용자 정의 우선. |

> **CheckedState 규칙:** `"indeterminate"` 는 표시 전용 상태이며, 다음 상호작용에서 `true` 로 전환된다.

### CheckboxGroup

| 속성 | 값/형식 | 기본값 | 설명 |
| --- | --- | --- | --- |
| **value** | `string[]` | — | 제어 모드 선택 목록. |
| **defaultValue** | `string[]` | `[]` | 비제어 초기 선택 목록. |
| **onValueChange** | `(values: string[]) => void` | — | 그룹 선택 변경 시 호출. 중복 없는 배열 보장. |
| **name** | string | — | 그룹 전체에서 공유할 `input` name. 지정 시 각 항목에 동일 적용. |
| **label** | ReactNode | — | 그룹 레이블. `aria-labelledby`로 연결. |
| **description** | ReactNode | — | 그룹 설명. `aria-describedby` 연결. |
| **disabled** | boolean | false | 그룹 내 모든 항목 비활성화. 항목 개별 `disabled`가 있으면 그룹보다 우선? 아니 그룹 우선. |
| **readOnly** | boolean | false | 그룹 전체 읽기 전용. 항목 개별 `readOnly`와 병합 시 그룹 우선. |
| **required** | boolean | false | 최소 1개 선택 요구 시 `aria-required` 적용(네이티브 검증은 직접 처리 필요). |
| **invalid** | boolean | false | 오류 상태. 그룹 컨테이너 및 항목에 `data-invalid`/`aria-invalid` 반영. |
| **orientation** | horizontal · vertical | vertical | 배치 방향. 키보드 포커스 이동 힌트에 사용. |
| **className / style** | 문자열 / 스타일 | — | 그룹 루트에 병합. |

> **항목 등록 규칙:** 그룹 컨텍스트가 항목에 `name/disabled/readOnly/required/invalid/onChange`를 주입해 일관성을 유지한다.

---

## 3) 동작 계약 (Behavior)

- **토글:**
  - 클릭/Space 로 상태 전환. `indeterminate` → `true` → `false` 순환.
  - `disabled` 는 모든 상호작용 차단, `readOnly` 는 포커스 허용하되 토글만 차단.
- **그룹 값 관리:**
  - 그룹은 항목 `value` 기준으로 집합을 유지한다. 중복 추가 없음.
  - 항목 토글 결과는 그룹 `onValueChange(updatedValues)` 로 통지. 제어 모드에서는 상위에서 배열을 갱신해야 UI가 반영된다.
- **폼 제출:**
  - 단일 체크박스: `name`+`value` 가 설정된 경우에만 제출. 미선택 시 미포함.
  - 그룹: 동일 `name` 으로 여러 값이 제출된다. `disabled` 항목은 제출 제외, `readOnly` 는 제출 포함.
- **포커스 흐름:**
  - 체크박스 단독: 기본 탭 순서 사용.
  - 그룹: 포커스 이동은 브라우저 기본(tab) + 컨테이너 단위 포커스 보조 UI 가능(로빙 탭 인덱스는 라디오 그룹에만 적용).
  - `orientation`이 horizontal 이면 좌우 방향키 안내를 문서화하되, 실제 키보드 포커스 이동은 기본값을 유지한다.

---

## 4) 접근성 계약 (A11y)

- **역할/속성:** 숨김 `<input type="checkbox">` 에 `checked|indeterminate` 상태를 설정하고, 커스텀 UI는 `role="checkbox"` + `aria-checked` 로 동기화.
- **레이블:** `label` 제공 시 `<label for>` 연결 및 `aria-labelledby` 구성. 외부 `aria-labelledby` 가 전달되면 병합.
- **설명:** `description` 이 존재하면 `aria-describedby`에 포함. 그룹 `description` 은 개별 항목과 병합.
- **상태 ARIA:**
  - `required` → `aria-required="true"`
  - `disabled` → `aria-disabled="true"` + 포커스/입력 차단
  - `readOnly` → `aria-readonly="true"` (포커스 허용)
  - `invalid` → `aria-invalid="true"`
- **키보드:** Space/Enter 로 토글, `Tab` 으로 포커스 이동. 그룹에서는 로빙 탭 인덱스 미사용.

---

## 5) 스타일/데이터 속성

- **데이터 속성:** `[data-state="checked|unchecked|indeterminate"]`, `[data-disabled]`, `[data-readonly]`, `[data-required]`, `[data-invalid]`, `[data-orientation]`(그룹) 노출.
- **CSS 변수:** 체크박스/라디오/스위치 공통으로 `--ara-fc-*` 프리픽스 토큰을 소비한다.
  - 베이스: `--ara-fc-radius`, `--ara-fc-border-width`, `--ara-fc-disabled-opacity`, `--ara-fc-focus-outline`,
    `--ara-fc-focus-outline-offset`, `--ara-fc-focus-ring`
  - Tone/State: `--ara-fc-tone-{tone}-{part}-{state}` (`part = control|border|indicator|label`,
    `tone = primary|neutral|danger`, `state = default|hover|focus|disabled|invalid`) + 중립 프리셋 alias
    (`--ara-fc-control-default` 등)
  - Size: `--ara-fc-size-{size}-control|gap|font-size|line-height|track-width|track-height|thumb`
- **클래스 병합:** 기본 스타일 → 사용자 `className` 순으로 병합.

---

## 6) Exports 계약

- **@ara/react**
  - `@ara/react/checkbox` → `Checkbox`, `CheckboxProps`, `CheckboxGroup`, `CheckboxGroupProps`
- **@ara/core**
  - `@ara/core/use-checkbox` → `useCheckbox`, `UseCheckboxResult`
  - `@ara/core/use-checkbox-group` → `useCheckboxGroup`, `UseCheckboxGroupResult`
- **package.json (react 패키지)**
  - `exports`: `./checkbox`(ESM) + `types`, `sideEffects:false`

---

## 7) 에지 케이스 / 동결 규칙

- `disabled && readOnly` → disabled 우선, readOnly ARIA 생략.
- `indeterminate` 상태에서 `required`일 경우 최소 1개 선택 규칙은 상위 비즈니스 로직에서 검증.
- 그룹/항목 `name` 불일치 금지: 그룹이 우선하며, 개별로 다른 name을 주입하려 하면 오류/경고 처리.
- 본 계약 변경은 Major 사유로 취급한다.
