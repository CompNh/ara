# Button

> 파일: `packages/react/src/components/button/README.md`  
> 범위: 일반 버튼/링크 버튼. `ToggleButton(pressed)`은 **비포함**(별도 컴포넌트).

## 1) 목적 / 범위
- **목적:** tokens → core(headless) → react 바인딩 흐름을 **Button**으로 검증하고, 외부에 불변 약속(Props/동작/A11y/Exports)을 고정.
- **성공 기준:** 테스트·스토리·빌드·Exports가 본 계약과 일치, canary 배포 가능.

---

## 2) Public API (Props 계약)

| 속성 | 값/형식 | 기본값 | 설명 |
| --- | --- | --- | --- |
| **variant** | solid · outline · ghost | solid | 시각 스타일 변형. 토큰(CSS 변수)로 값 주입. |
| **tone** | primary · neutral · danger | primary | 의미/강조 톤. 색 토큰에 매핑. |
| **size** | sm · md · lg | md | 높이·패딩·폰트 크기 세트. |
| **disabled** | boolean | false | 상호작용 차단. 버튼은 `disabled`, 링크는 `aria-disabled="true"`+클릭/키 이벤트 취소. |
| **loading** | boolean | false | 상호작용 차단+스피너 슬롯, `aria-busy="true"`. |
| **children** | ReactNode | — | 버튼 라벨. 빈 문자열/`null` 비허용(아이콘만 렌더 시 `aria-label` 필수). |
| **leadingIcon** | 아이콘 노드 | — | 라벨 앞 아이콘(아이콘 전용일 땐 `aria-label` 필수). |
| **trailingIcon** | 아이콘 노드 | — | 라벨 뒤 아이콘. |
| **fullWidth** | boolean | false | 너비 100% 확장. |
| **asChild** | boolean | false | 폴리모픽 렌더링(예: 라우터 링크). **요구:** 자식이 `ref`·DOM props 전달 가능. |
| **href** | 문자열(URL) | — | 존재 시 링크 모드로 렌더. 키보드/press 계약 동일 유지. |
| **type** | button · submit · reset | button | 버튼 모드에서만 의미(링크 모드 무시). 기본값은 폼 오작동 방지 목적의 `button`. |
| **onPress** | 이벤트 핸들러 | — | 클릭+Enter+Space 통합 “확정” 이벤트. `disabled/loading` 시 발화 없음. |
| **onPressStart** | 이벤트 핸들러 | — | 누름 시작(마우스 다운/Space down). |
| **onPressEnd** | 이벤트 핸들러 | — | 누름 종료(마우스 업/Space up). 영역 이탈 시 취소. |
| **aria-label** | 문자열 | — | 아이콘만 렌더 시 **필수**. |
| **className / style** | 문자열 / 스타일 | — | 사용자 정의 최종 병합(충돌 시 사용자 정의 우선). |
| **ref** | 요소 참조 | — | 실제 렌더된 버튼/링크 요소로 포워딩. |
| **기타 DOM 속성** | 표준 버튼/앵커 속성 | — | 유효한 속성은 그대로 전달(`target`, `rel`, `download` 등). `target="_blank"` 시 `rel="noopener noreferrer"` 권고. |

> **Defaults:** `variant='solid'`, `tone='primary'`, `size='md'`, `type='button'`
> **이벤트 의미:** `onPress`는 클릭+Enter+Space **통합 확정**. `disabled | loading`이면 발화 금지.
> **PressEvent:** `type`(`mouse | keyboard | touch | pen`), `pointerType`, `shiftKey` 등 core `PressEvent` 그대로 전달.

---

## 3) 동작 계약 (Behavior)

- **키보드:**
  - 버튼: Enter/Space → press( Space는 down=pressStart, up=pressEnd/press ).
  - 링크 모드: Enter 기본 클릭 + **Space도 press로 동작**(기본 스크롤 취소 후 클릭 합성).
  - `asChild`로 사용자 정의 요소 사용 시에도 동일 press 계약을 유지해야 하며, 필요 시 `role="button"`/`tabIndex=0`를 자식이 구현.
- **마우스/터치:** 누름(pressStart)→떼기(pressEnd)→press. 포인터가 영역 이탈하면 취소.
- **Disabled:** 포커스/press 차단, hover/active 스타일 비활성.
- **Loading:** press 차단, `aria-busy="true"`, spinner 표시(라벨 유지).
- **폼 연동:** `type="submit"`일 때 네이티브 폼 제출 유지(중복 press 방지). 기본은 `button`.
- **포인터 캡처:** pointerdown → pointerup 사이 `pointercancel` 수신 시 press 취소.

---

## 4) 접근성 계약 (A11y)

- 요소/역할: 기본은 `<button>`. 링크 모드여도 키보드 계약(Enter/Space) 동일.  
- ARIA:
  - `disabled` → 버튼: `disabled`; 링크: `aria-disabled="true"` + 상호작용 취소
  - `loading`  → `aria-busy="true"`(spinner는 `aria-hidden="true"`)
- 포커스 링: 키보드 유입에서만 명확(마우스 클릭 시 최소화). `:focus-visible` 우선.
- 레이블: 아이콘만 있는 경우 `aria-label` 또는 `aria-labelledby` 필수. `children` 문자열/요소가 제공되면 별도 레이블 불필요.
- RTL: 아이콘 정렬, 여백, 포커스 링 방향성 확인.

---

## 5) 시각/토큰 계약 (Tokens → CSS Vars)

- `AraProvider`는 자식 subtree를 `<div data-ara-theme>`로 감싸며 토큰을 CSS 변수로 노출한다.
- Button은 토큰을 **두 단계**로 소비한다.
  1. 전역 토큰: `--ara-btn-font`, `--ara-btn-font-weight`, `--ara-btn-radius`, `--ara-btn-border-width`,
     `--ara-btn-disabled-opacity`, `--ara-btn-focus-outline`, `--ara-btn-focus-outline-offset`, `--ara-btn-focus-ring`
  2. Variant/Tone별 토큰: `--ara-btn-variant-{variant}-{tone}-{state}` (`state = bg|fg|border|bg-hover|...|shadow`)
  3. Size별 토큰: `--ara-btn-size-{size}-px|py|gap|font-size|line-height|min-height|spinner`
- 컴포넌트는 위 토큰을 `var(--ara-btn-*, fallback)` 형태로 참조해 토큰 미정의 시에도 기본값을 유지한다.
- **data-attributes(스타일 훅):** `[data-variant]`, `[data-tone]`, `[data-size]`, `[data-loading]`, `[data-disabled]`, `[data-state="hover|active|focus-visible"]`

---

## 6) 커스터마이징 레벨

1. **Props/Variants**(variant/tone/size/slots/fullWidth/asChild)  
2. **스타일 표면**: `className`/`style` + `data-*` + **CSS 변수 오버라이드**  
3. **폴리모픽**: `asChild`로 임의 태그/라우터 링크 치환(Ref/props 전달 유지)  
4. **헤드리스**: `@ara/core/useButton`으로 **UI 완전 자율 구성** 가능

---

## 7) 컴포지션 / 슬롯

- 구조: `root` · `icon--leading` · `label` · `spinner` · `icon--trailing`
- 클래스 병합: 내부 기본 클래스 → 사용자 `className` **최후 우선**(충돌 시 사용자 승)
- 슬롯 가드: `spinner`는 `loading`일 때만 렌더, 아이콘 슬롯은 제공되지 않으면 DOM 비노출.

---

## 8) Exports 계약

- **@ara/react**
  - `@ara/react/button` → `Button`, `ButtonProps`
  - `@ara/react/unstyled/button` → 스타일 없는 기저(슬롯만)
- `ButtonProps['onPress']`는 `@ara/core/use-button`이 반환하는 `PressEvent` 시그니처를 그대로 사용(React SyntheticEvent 아님).
- **@ara/core**
  - `@ara/core/use-button` → `useButton`, `PressEvent`
- **package.json (react 패키지)**  
  - `exports`: `./button`(ESM) + `types`, `sideEffects:false`  
  - Node ≥ 22, ESM 우선, d.ts 포함

---

## 9) 성능/호환

- SSR/StrictMode 안전, 포인터·키 이벤트 중복 억제, 불필요한 리렌더 방지(필요 시 `memo` 고려).  
- 포커스 관리는 브라우저 기본 흐름 우선, 키보드 전용 포커스 링.

---

## 10) 에지 케이스

- `disabled && loading` → **disabled 우선**(상호작용 완전 차단) + busy 시각 상태 병행 가능  
- `href && disabled` → anchor 렌더 + `aria-disabled` + 클릭/키 이벤트 취소
- **아이콘만** 있을 때 → `aria-label` **필수**
- `asChild` + `href` 동시 사용 시 자식 요소가 anchor 역할을 수행하고 `ref`/`className` 전달을 지원해야 함.

---

## 11) 테스트 계획 (Vitest + RTL)

- 키보드: Enter/Space press 시퀀스, focus-visible 표시  
- 마우스/터치: pressStart/End/press 순서, 영역 이탈 취소  
- 상태: `disabled`/`loading` 상호작용 차단 + ARIA 적용  
- 렌더: `asChild`/`href` 브랜치, ref 포워딩, 클래스 병합  
- 스타일 훅: `data-*`/CSS var 존재 최소 스냅  
- **폼 제출:** `type="submit"` 네이티브 동작 유지, 중복 press 방지 검증  
- **링크 보안:** `target="_blank"` 시 `rel` 자동·문서화 확인

---

## 12) Storybook/문서 (MDX)

- Stories: `Playground`, `Variants`, `Tones`, `Sizes`, `WithIcons`, `Loading`, `AsLink`, `FullWidth`  
- Docs: Props 테이블(자동), A11y 가이드, 커스터마이징 예시(CSS var override, Tailwind, asChild)

---

## 13) 수용 기준(AC)

- [ ] 모든 Props/동작이 본 계약과 일치  
- [ ] A11y(키보드/ARIA) 테스트 통과  
- [ ] Storybook smoke + Controls 동작  
- [ ] `@ara/react/button` ESM+types 정상 임포트  
- [ ] CSS var & data-* 커스터마이징 예시 문서화  
- [ ] Changesets canary 발행 가능

---

## 14) 변경 규칙(SemVer)

- **Major:** Props 이름/타입 변경, ARIA/키 동작 변경, Exports 경로 변경, CSS var/data-* 키 변경  
- **Minor:** 신규 variant/tone/size 추가, 비파괴적 시각 개선  
- **Patch:** 버그/접근성 수정, 내부 성능 개선

---

## 15) 참고

- 소비 경로: `import { Button } from '@ara/react/button'`  
- 헤드리스: `import { useButton } from '@ara/core/use-button'`  
- 비범위: `ToggleButton(pressed)`는 별도 WBS
