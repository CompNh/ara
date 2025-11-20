# TextField

> 파일: `packages/react/src/components/text-field/README.md`
> 범위: 단일 입력 필드(TextField). textarea/number-spinner 등 복합 입력은 비포함.

## 1) 목적 / 범위

- **목적:** headless 입력 로직(`@ara/core/use-text-field`)과 React UI 바인딩 계약을 확정한다.
- **성공 기준:** Props/동작/A11y/Exports가 본 계약과 일치하며, 이후 구현·스토리·테스트가 이를 충실히 따른다.

---

## 2) Public API (Props 계약)

| 속성 | 값/형식 | 기본값 | 설명 |
| --- | --- | --- | --- |
| **value** | string | — | 제어 모드 값. 존재 시 `onValueChange` 필수. |
| **defaultValue** | string | "" | 비제어 초기값. 이후 상태는 내부에서 관리. |
| **onValueChange** | `(value: string) => void` | — | 값 변경 시 호출. `composition` 중에도 최신 값 제공. |
| **onCommit** | `(value: string) => void` | — | **Enter 확정** 이벤트. IME 조합 중에는 무시. `type="email"` 등에서도 동일. |
| **label** | ReactNode | — | 필드 레이블. `id` 없으면 내부에서 자동 생성해 `for/id` 연결. |
| **helperText** | ReactNode | — | 보조 설명. `aria-describedby` 연결 대상. |
| **errorText** | ReactNode | — | 오류 메시지. 존재 시 `aria-invalid="true"` + `aria-describedby` 연결. |
| **required** | boolean | false | 필수 입력. 시각적 표시와 `aria-required` 반영. |
| **disabled** | boolean | false | 상호작용 차단, `aria-disabled`/tab 차단. |
| **readOnly** | boolean | false | 읽기 전용. 값은 보여주되 편집 차단, `aria-readonly` 표시. |
| **type** | text · email · password · number | text | 표준 입력 타입 제한. `number` 는 기본 입력만 사용(별도 스피너 없음). |
| **size** | sm · md · lg | md | 높이/폰트/패딩 세트. |
| **prefixIcon / suffixIcon** | ReactNode | — | 입력 앞/뒤 아이콘 슬롯. 제공되지 않으면 DOM 미삽입. |
| **clearable** | boolean | false | 값 존재 시 clear 버튼(`X`) 노출. 클릭 또는 `Esc`로 값 초기화+`onValueChange("")`. |
| **passwordToggle** | boolean | false | `type="password"`일 때 가시성 토글 버튼 제공(eye). `type`/`aria-label` 자동 전환. |
| **name** | string | — | 폼 제출용 이름. |
| **id** | string | — | 입력 요소 id. 미지정 시 내부 생성(레이블/설명 연결에 사용). |
| **autoComplete** | string | "on" | HTML `autocomplete` 속성 위임. 가이드에 따라 권장 값 표기. |
| **inputRef** | `React.Ref<HTMLInputElement>` | — | 실제 `<input>` 요소 포워딩. |
| **className / style** | 문자열 / 스타일 | — | 루트 요소에 병합. 사용자 정의 우선. |
| **기타 input props** | 표준 `<input>` 속성 | — | `placeholder`·`maxLength` 등 합법 속성 전달. 제한 타입 외 속성은 브라우저 기본에 위임. |

> **제어 규칙:** `value` 지정 시 내부 상태는 사용하지 않으며, 모든 변경은 `onValueChange` 경유. `defaultValue`만 제공 시 내부 비제어.
> **확정 의미:** `onCommit`는 Enter keyup 시점에 발화하며, IME 조합(`composition`) 중에는 발화하지 않는다.

---

## 3) 동작 계약 (Behavior)

- **입력/포커스 흐름:**
  - 포커스 진입 시 포커스 링 적용, `disabled`/`readOnly`는 포커스 가능 여부를 스펙에 맞춰 유지(`readOnly`는 포커스 허용).
  - `disabled` → 입력/포커스/clear/password 토글 모두 비활성.
- **값 변경:**
  - 제어 모드: `onValueChange` 호출만 수행, 렌더 값은 상위에서 전달된 `value` 기준.
  - 비제어 모드: 내부 상태 업데이트 후 `onValueChange` 병행 호출(있다면)으로 상위 동기화.
- **Clear 버튼:**
  - `clearable`이며 값이 비어 있지 않을 때만 노출.
  - 클릭/Space/Enter/`Esc`로 실행. 실행 시 값 `""`로 설정 + `onValueChange("")`; `onCommit`는 발생하지 않음.
- **Password toggle:**
  - `passwordToggle` 활성+`type="password"`에서만 렌더. 클릭으로 `type`을 `password ↔ text` 전환.
  - 전환 시 값 보존, 포커스는 입력에 남김.
- **Enter 확정:**
  - `keydown Enter` 시 IME 조합 상태가 아니면 `preventDefault` 후 `onCommit(currentValue)` 호출.
  - `type="number"`에서도 동일 계약을 유지(폼 submit과 중복 방지).
- **ARIA/설명 연결:**
  - label/helper/error 존재 여부와 `id` 생성에 따라 `aria-labelledby`/`aria-describedby`를 구성.
- **IME 안전:** `compositionstart`~`compositionend` 구간에서는 `onCommit`/clear/submit을 억제해 한글 입력 시 오발화를 방지.

---

## 4) 접근성 계약 (A11y)

- **레이블:** `label` 제공 시 `<label for>` → `<input id>` 연결. `label` 미제공 시 `aria-label` 또는 외부 `aria-labelledby` 요구.
- **에러/도움말:** `errorText`/`helperText`가 DOM에 존재하면 `aria-describedby`에 모두 연결(에러 우선순위 시각 강조).
- **상태 ARIA:**
  - `required` → `aria-required="true"`
  - `disabled` → `aria-disabled="true"` + tab 이동 차단
  - `readOnly` → `aria-readonly="true"`
  - `errorText` 존재 → `aria-invalid="true"`
- **입력 타입:** `type`에 따른 네이티브 키보드/스크린리더 힌트를 존중하되, password toggle/clear 버튼은 `aria-label`을 명시.
- **포커스 링:** 키보드 유입 시 `:focus-visible` 스타일을 명확히 제공. 마우스 클릭 시 최소화.

---

## 5) 시각/토큰 계약 (Tokens → CSS Vars)

- **전역 토큰:** `--ara-tf-font`, `--ara-tf-font-weight`, `--ara-tf-radius`, `--ara-tf-border-width`, `--ara-tf-disabled-opacity`.
- **State/Tone 토큰:** `--ara-tf-surface-{state}`(`default|hover|focus|disabled|invalid`), `--ara-tf-border-{state}`, `--ara-tf-text-{state}`.
- **Size 토큰:** `--ara-tf-size-{size}-{prop}`(`height|px|py|gap|font-size|line-height|icon|clear|toggle`).
- **데이터 속성:** `[data-size]`, `[data-disabled]`, `[data-readonly]`, `[data-invalid]`, `[data-has-prefix]`, `[data-has-suffix]`, `[data-filled]`, `[data-focus-visible]` 등으로 상태 스타일링을 제공.
- **테마 주입:** `AraThemeBoundary`/`useAraThemeVariables`를 통해 CSS 변수 세트를 제공하며, 미정의 시 합리적 기본값을 내장.

---

## 6) 커스터마이징 레벨

1. **Props/Variants:** size/type/clearable/passwordToggle/prefixIcon/suffixIcon 조합.
2. **스타일:** `className`/`style` 오버라이드 + CSS 변수 재정의 + `data-*` 기반 선택자.
3. **헤드리스:** `@ara/core/use-text-field`로 완전한 UI 커스터마이징 가능(동일 ARIA/이벤트 계약 제공).

---

## 7) 컴포지션 / 슬롯

- 기본 구조: `root` → `label` → `input` → `prefix` → `suffix` → `clear button` → `password toggle` → `helper/error`.
- 클래스 병합 순서: 기본 스타일 → 사용자 `className` 최후 우선.
- 보조 슬롯 가드: `prefixIcon`/`suffixIcon`/`clearable`/`passwordToggle` 조건에 따라 DOM 삽입 여부 결정.

---

## 8) Exports 계약

- **@ara/react**
  - `@ara/react/text-field` → `TextField`, `TextFieldProps`
- **@ara/core**
  - `@ara/core/use-text-field` → `useTextField`, `UseTextFieldResult`
- **package.json (react 패키지)**
  - `exports`: `./text-field`(ESM) + `types`, `sideEffects:false`
  - Node ≥ 22, ESM 우선, d.ts 포함

---

## 9) 에지 케이스

- `disabled && readOnly` → disabled 우선(완전 차단) + readOnly ARIA 생략.
- `clearable && type="password"` → password toggle과 병행 가능. clear 시 토글 상태 유지.
- `type="number"` → 스피너 제공 안 함, 입력값 문자열 그대로 전달(패턴/검증은 상위가 담당).
- `value=""` 상태에서는 clear 버튼 숨김, `onCommit("")` 허용.

---

## 10) 테스트 계획 (Vitest + RTL)

- 제어/비제어 입력 흐름과 `onValueChange` 호출 시점.
- `compositionstart/end` 동안 Enter 무시, 종료 후 onCommit 발화.
- `clearable`: 버튼 표시 조건, 클릭/키 조작으로 값/ARIA 갱신, focus 유지.
- `passwordToggle`: 토글 동작, aria-label, 값 보존, 포커스 유지.
- A11y: label/descr/invalid/required 연결, `disabled/readOnly` 포커스/탭 처리.
- 키보드: Enter onCommit, Esc로 clear, Tab 포커스 이동 순서.
- Props 스냅: size/type 변형별 data-attrs/CSS var 존재 확인.

---

## 11) Storybook/문서 (MDX)

- Stories: `Playground`, `Sizes`, `WithHelper`, `WithError`, `PrefixSuffix`, `Clearable`, `PasswordToggle`, `Controlled vs Uncontrolled`, `Types(text/email/password/number)`.
- Docs: Props 테이블, A11y 가이드(레이블/aria-describedby/autoComplete 추천 값), 커스터마이징 예시(CSS var override).

---

## 12) 수용 기준(AC)

- [ ] 모든 Props/동작이 본 계약과 일치
- [ ] A11y(레이블/aria-invalid/aria-describedby) 검증 완료
- [ ] Clear/Password 토글 동작 및 IME 안전성 확인
- [ ] Storybook smoke + Controls 동작
- [ ] `@ara/react/text-field` ESM+types 정상 임포트

---

## 13) 변경 규칙(SemVer)

- **Major:** Props 이름/타입 변경, Enter 확정/clear/password 토글 동작 변경, Exports 경로 변경, CSS var/data-* 키 변경
- **Minor:** 신규 size/type/슬롯 추가, 비파괴적 시각 개선
- **Patch:** 버그/접근성 수정, 내부 성능 개선

---

## 14) 참고

- 소비 경로: `import { TextField } from '@ara/react/text-field'`
- 헤드리스: `import { useTextField } from '@ara/core/use-text-field'`
- IME 환경(한글 입력)에서 Enter 오발화를 방지하는 것이 핵심 요구사항.
