# Radio / RadioGroup

> 파일: `packages/react/src/components/radio/README.md`
> 범위: 단일 라디오와 라디오 그룹(단일 선택). 체크박스/스위치는 별도 계약 참고.

## 1) 목적 / 범위

- **목적:** 라디오/라디오 그룹의 Props·이벤트·상태(data-state)·키보드 내비게이션 계약을 명확히 한다.
- **성공 기준:** 선택 로직, ARIA, Exports 가 본 문서와 일치하며, 변경 시 Major 로 관리한다.

---

## 2) Public API (Props 계약)

### Radio

| 속성 | 값/형식 | 기본값 | 설명 |
| --- | --- | --- | --- |
| **value** | string | — | 그룹에서 구분할 값(필수). 단일 사용 시 폼 제출 값. |
| **checked** | boolean | — | 제어 모드 선택 여부. 존재 시 `onChange` 필수. |
| **defaultChecked** | boolean | false | 비제어 초기 선택 여부. |
| **onChange** | `(checked: boolean) => void` | — | 선택 상태 변경 시 호출. 그룹 제공 핸들러 우선. |
| **label** | ReactNode | — | 라디오 레이블. `<label for>` 연결. |
| **description** | ReactNode | — | 보조 설명. `aria-describedby` 연결. |
| **disabled** | boolean | false | 상호작용 차단, 그룹 `disabled` 우선. |
| **required** | boolean | false | 단일 라디오 사용 시 적용. 그룹에서는 그룹 `required` 가 우선. |
| **invalid** | boolean | false | 오류 표시 및 `aria-invalid` 설정. 그룹 상태와 병합 시 그룹 우선. |
| **id** | string | — | 숨김 `<input>` id. 미지정 시 자동 생성. |
| **inputRef** | `React.Ref<HTMLInputElement>` | — | 내부 `<input type="radio">` 포워딩. |
| **className / style** | 문자열 / 스타일 | — | 루트 요소에 병합. |

### RadioGroup

| 속성 | 값/형식 | 기본값 | 설명 |
| --- | --- | --- | --- |
| **value** | string | — | 제어 모드 선택 값. |
| **defaultValue** | string | — | 비제어 초기 선택 값. 미설정 시 아무것도 선택되지 않음. |
| **onValueChange** | `(value: string) => void` | — | 선택 변경 시 호출. 제어 모드에서 UI 갱신은 상위 책임. |
| **name** | string | — | 그룹 내 모든 라디오에 동일 적용되는 `name`. 폼 제출 시 단일 값으로 전달. |
| **label** | ReactNode | — | 그룹 레이블. `aria-labelledby` 연결. |
| **description** | ReactNode | — | 그룹 설명. `aria-describedby` 연결. |
| **disabled** | boolean | false | 그룹 전체 비활성화. 항목 개별 `disabled` 존재 시 그룹 우선. |
| **required** | boolean | false | 최소 1개 선택 요구. 네이티브 검증 시 group `required` 를 첫 항목에 적용. |
| **invalid** | boolean | false | 오류 상태. `aria-invalid`/`data-invalid`를 그룹/항목에 반영. |
| **orientation** | horizontal · vertical | vertical | 표시 방향 + 키보드 이동 힌트. |
| **loop** | boolean | true | 화살표 탐색 시 끝에서 시작으로 순환 여부. |
| **className / style** | 문자열 / 스타일 | — | 그룹 루트 병합. |

> **항목 컨텍스트:** 그룹은 각 라디오에 `name`, `onChange`, `checked` 상태, `disabled/required/invalid` 플래그를 주입한다.

---

## 3) 동작 계약 (Behavior)

- **단일 선택:**
  - 클릭/Space/Enter 시 해당 라디오로 선택 이동. 다른 항목은 자동 해제.
  - 제어 모드에서는 `onValueChange` 호출만 수행하며, 렌더 상태는 상위 `value`에 의존.
- **키보드 내비게이션:**
  - `Tab` 으로 그룹 컨테이너에 진입하면 현재 선택된 항목이 포커스를 받는다. 선택이 없으면 첫 항목 포커스.
  - 좌우(orientation=horizontal) 또는 상하(orientation=vertical) 화살표로 포커스를 이동하며, 이동과 동시에 선택을 갱신한다.
  - `loop=true` 시 마지막→첫/첫→마지막으로 순환. `loop=false`면 끝에서 멈춤.
- **폼 제출:** `name`이 설정된 경우 선택된 라디오의 `value` 하나만 제출. 미선택이면 제출되지 않음.
- **포커스 표시:** 키보드 진입 시 포커스 링을 명확히 표시하고, 마우스 클릭 시 최소화한다.

---

## 4) 접근성 계약 (A11y)

- **역할/속성:** 커스텀 UI에는 `role="radio"` + `aria-checked`를 적용하고, 그룹 컨테이너에는 `role="radiogroup"` + `aria-labelledby`/`aria-describedby`를 연결한다.
- **레이블/설명:** `label`/`description` 은 각각 `aria-labelledby`/`aria-describedby` 로 연결. 외부 aria 속성 전달 시 병합.
- **상태 ARIA:**
  - `disabled` → `aria-disabled="true"`
  - `required` → `aria-required="true"`
  - `invalid` → `aria-invalid="true"`
- **로빙 탭 인덱스:** 그룹은 하나의 포커스 루트를 유지하기 위해 선택 항목에 `tabIndex=0`, 나머지에 `-1`을 부여한다.

---

## 5) 스타일/데이터 속성

- **데이터 속성:** `[data-state="checked|unchecked"]`, `[data-disabled]`, `[data-required]`, `[data-invalid]`, `[data-orientation]`, `[data-loop]`.
- **CSS 변수:** 체크박스/라디오/스위치 공통 `--ara-fc-*` 토큰 사용.
  - 베이스: `--ara-fc-radius`, `--ara-fc-border-width`, `--ara-fc-disabled-opacity`, `--ara-fc-focus-outline`,
    `--ara-fc-focus-outline-offset`, `--ara-fc-focus-ring`
  - Tone/State: `--ara-fc-tone-{tone}-{part}-{state}` (`part = control|border|indicator|label`,
    `tone = primary|neutral|danger`, `state = default|hover|focus|disabled|invalid`) + 중립 alias(`--ara-fc-control-default` 등)
  - Size: `--ara-fc-size-{size}-control|gap|font-size|line-height|track-width|track-height|thumb`
- **클래스 병합:** 기본 스타일 후 사용자 `className`을 마지막에 적용.

---

## 6) Exports 계약

- **@ara/react**
  - `@ara/react/radio` → `Radio`, `RadioProps`, `RadioGroup`, `RadioGroupProps`
- **@ara/core**
  - `@ara/core/use-radio` → `useRadio`, `UseRadioResult`
  - `@ara/core/use-radio-group` → `useRadioGroup`, `UseRadioGroupResult`
- **package.json (react 패키지)**
  - `exports`: `./radio`(ESM) + `types`, `sideEffects:false`

---

## 7) 에지 케이스 / 동결 규칙

- 그룹 없이 단일 라디오 사용 시에도 ARIA/폼 제출이 일관되도록 `name`/`required`/`invalid` 를 그대로 반영한다.
- `disabled && required` 조합은 disabled 우선. required ARIA는 생략한다.
- 화살표 이동 시 스크롤 발생을 방지하기 위해 기본 동작을 `preventDefault` 처리한다.
- 계약 변경은 Major 사유로 취급한다.
