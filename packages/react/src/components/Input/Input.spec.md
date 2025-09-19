# [Spec v0.1] Input (Tier-0)

## 목적/사용 시나리오

- 폼의 기본 텍스트 입력 컴포넌트.
- 외부 `<label>` 없이도 접근성 안전 장착(내부 라벨 렌더 옵션 제공).
- 오류/힌트 텍스트와의 연결, 키보드/리더 호환.

## 기능 요구/동작

- 제어/비제어 동시 지원(`value`/`defaultValue`).
- 라벨/힌트/에러 텍스트 제공 및 ARIA 연결.
- 상태: disabled/readonly/required/invalid.
- 타입: `text | password | email | number` (필요 시 확장).
- 이벤트: `onChange`, `onBlur`, `onFocus`, `onKeyDown`.

## API/Props

| Prop         | Type                                             | Default | Description                                                   |
| ------------ | ------------------------------------------------ | ------: | ------------------------------------------------------------- |
| id           | string                                           |    auto | 입력/라벨/설명 요소 연결용 ID(미지정 시 자동 생성)            |
| name         | string                                           |       — | 폼 필드 이름                                                  |
| type         | 'text' \| 'password' \| 'email' \| 'number'      |  'text' | HTML 입력 타입(부분 지원)                                     |
| value        | string                                           |       — | 제어 컴포넌트 값                                              |
| defaultValue | string                                           |       — | 비제어 초기값                                                 |
| onChange     | (e: React.ChangeEvent<HTMLInputElement>) => void |       — | 값 변경 이벤트                                                |
| placeholder  | string                                           |       — | 플레이스홀더                                                  |
| disabled     | boolean                                          |   false | 비활성화                                                      |
| readOnly     | boolean                                          |   false | 읽기 전용                                                     |
| required     | boolean                                          |   false | 필수 필드 표시 및 ARIA 연결                                   |
| invalid      | boolean                                          |   false | 오류 상태 강제(내부 `aria-invalid` 반영)                      |
| label        | string                                           |       — | 내부 라벨 텍스트(없으면 라벨 미렌더)                          |
| labelHidden  | boolean                                          |   false | 라벨 시각적 숨김(스크린리더용 유지)                           |
| hint         | string                                           |       — | 보조 설명 텍스트(ARIA `describedby` 연결)                     |
| error        | string                                           |       — | 에러 메시지(있으면 `aria-invalid=true` 및 `describedby` 연결) |
| size         | 'sm' \| 'md' \| 'lg'                             |    'md' | 시각적 높이/패딩 토큰                                         |
| className    | string                                           |       — | 외부 스타일 확장용                                            |

## 상태 관리/인터페이스

- Headless 훅: `useInput(options)`
  - 입력/라벨/힌트/에러 각 요소의 ID 관리(`inputId`, `labelId`, `hintId`, `errorId`)
  - 제어/비제어 값 동기화(간단한 `useControllable` 로직)
  - 파생 ARIA: `aria-invalid`, `aria-required`, `aria-describedby`
  - 반환: `getInputProps()`, `getLabelProps()`, `getHintProps()`, `getErrorProps()`

## 접근성(A11y)

- 라벨 결합: `label` 제공 시 `<label for={inputId}>`; 숨김 라벨은 sr-only 클래스 적용.
- 힌트/에러: 존재 시 `aria-describedby`에 ID 연결(여러 개 공백 구분).
- 에러가 존재하면 `aria-invalid="true"` 강제.
- 키보드: 기본 `<input>`의 네이티브 키 입력/포커스 흐름 보존.
- 스크린리더: 필수(`required`) 시 `aria-required="true"`.

## 키보드 매핑

- 입력/삭제/이동: 네이티브 동작(브라우저 위임)
- Tab/Shift+Tab: 포커스 이동(폼 흐름 준수)
- Enter: 폼 submit 컨텍스트에서 네이티브 동작

## 스타일/테마(요약)

- 토큰: 높이/패딩(`--ara-size-field-*`), 테두리/포커스 링(`--ara-color-focus`), 상태 색(에러 `--ara-color-danger`).
- data-attr: `data-ara-input`, 상태 `data-invalid`, `data-disabled`, `data-readonly`.

## 테스트 전략

- 단위( RTL + Vitest ):
  1. 라벨 결합(for/aria-labelledby) 렌더
  2. 힌트/에러 → `aria-describedby` 연결
  3. 에러 존재 시 `aria-invalid`=true
  4. 제어/비제어 값 변경(onChange) 동작
  5. disabled/readonly/required 반영
- 커버리지 ≥ 80%

- e2e(Playwright @ docs 샘플):
  1. 입력/포커스/타이핑 시나리오
  2. 에러/힌트 읽기(axe 무오류)
  3. 탭 이동 흐름

## 예시 코드(요약)

```tsx
'<Input id="email" type="email" label="이메일" required hint="회사 메일 권장" />'
'<Input label="암호" type="password" error="8자 이상 입력하세요" />'

## 오픈 이슈

숫자 입력의 로케일/스피너 제어(차후)
prefix/suffix 슬롯(차후)
마스킹/포맷터(차후)
```
