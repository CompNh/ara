# Form Controls v0 접근성 가이드

> 대상: `Checkbox`, `CheckboxGroup`, `Radio`, `RadioGroup`, `Switch`
> 위치: `packages/react/src/components/{checkbox,radio,switch}`

## 필수 연결 규칙

- **레이블 → 컨트롤**
  - 모든 컴포넌트는 시각적 `label`을 `for/id`로 연결하고, 커스텀 UI의 `aria-labelledby`에 포함한다.
  - 그룹(`CheckboxGroup`/`RadioGroup`)은 컨테이너에 `role`과 함께 `aria-labelledby`를 부여해 스크린 리더가 그룹 레이블을 먼저 읽는다.
- **설명/에러 → 컨트롤**
  - `description`(helper/error 용)을 제공하면 `aria-describedby`에 연결해 상태/보조 메시지가 스크린 리더에 노출된다.
  - 그룹 설명은 개별 항목과 병합되어 전달된다.
- **상태 ARIA**
  - `required` → `aria-required="true"`
  - `invalid` → `aria-invalid="true"`
  - `disabled` → `aria-disabled="true"` (포커스/상호작용 차단)
  - `readOnly` → `aria-readonly="true"` (포커스 허용, 토글만 차단)
- **역할(Role)**
  - 체크박스/그룹: 커스텀 UI에 `role="checkbox"`, 그룹 컨테이너는 div(기본) 유지.
  - 라디오/그룹: 항목에 `role="radio"`, 그룹 컨테이너에 `role="radiogroup"`.
  - 스위치: 커스텀 UI에 `role="switch"` + 숨김 `<input type="checkbox">`.

## 키보드/포커스 규정

- **Checkbox/Switch**: `Space`/`Enter`로 토글, `Tab`으로 기본 포커스 이동. `disabled` 시 포커스/토글 모두 차단, `readOnly` 시 토글만 차단.
- **RadioGroup**: `Tab` 진입 시 선택된 항목(없으면 첫 항목)에 포커스. `ArrowLeft/ArrowRight`(가로) 또는 `ArrowUp/ArrowDown`(세로)로 다음 항목으로 이동하면서 선택을 갱신한다. `loop` 여부에 따라 끝에서 순환 여부를 결정한다.
- **레이블 클릭/포커스**: 모든 컴포넌트는 시각적 레이블 클릭으로 포커스를 위임하고 상태를 변경한다.

## 테스트 커버리지

- `Checkbox.test.tsx`
  - 기본/indeterminate 토글, 레이블 클릭, `aria-labelledby`/`aria-describedby`/`aria-required`/`aria-invalid`/`aria-readonly` 검증.
- `Radio.test.tsx`
  - 그룹 단일 선택 유지, 화살표 키 이동 시 선택 갱신, 그룹 `aria-labelledby`/`aria-describedby`/상태 ARIA 검증.
- `Switch.test.tsx`
  - 클릭/Space/Enter 토글, 레이블/설명 연결, `disabled`/`readOnly` 차단, 제어형(onCheckedChange) 흐름 검증.

> 위 규칙과 테스트는 label-for/id 연결, `aria-describedby`(helper/error), 필수/오류 상태, 그룹 라벨링, 키보드 내비게이션 요구사항을 모두 포괄한다.
