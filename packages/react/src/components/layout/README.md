# Layout Primitives

`Stack`, `Flex`, `Grid`, `Spacer`는 Ara UI에서 가장 빈번하게 쓰이는 레이아웃 기본기이며, 모든 화면 구성 요소를 정돈하는 공통 계약을 가진다.

- 경로는 `@ara/react/<컴포넌트>` 하위로 고정하며, 상위 엔트리 `@ara/react` 에서도 재노출한다.
- 모든 컴포넌트는 기본적으로 `div`를 사용하지만 `as` 프롭으로 다른 태그·컴포넌트를 지정할 수 있다.
- `gap` 등 간격 값은 `@ara/tokens` 의 `layout.space` 스케일을 우선 사용하며, 임의의 CSS 길이값(예: `12px`, `1rem`, `clamp(...)`)도 허용한다.
- 논리 속성·방향을 우선 사용해 RTL에서도 동일한 결과를 보장한다.

## 공통 반응형 규칙

- 레이아웃 프롭은 단일 값 또는 **반응형 오브젝트**로 전달할 수 있다.
- 반응형 타입: `T | { base?: T; sm?: T; md?: T; lg?: T }`
  - `base`는 모든 뷰포트에 적용되는 기본값이며 생략 시 컴포넌트 기본값을 따른다.
  - `sm(≥640px)`, `md(≥768px)`, `lg(≥1024px)`는 모바일 우선(min-width) 순서로 적용된다.
  - 특정 구간 값이 없으면 더 작은 구간에서 가장 최근에 지정한 값을 상속한다.
- `gap`, `align`, `justify`, `direction`, `wrap`, `columns`, `rows` 등에서 동일한 규칙을 따른다.

## Stack (`@ara/react/stack`)

수직/수평 스택을 위한 `flex` 기반 컨테이너다. 자식 사이의 간격과 정렬을 일관되게 관리하고, 필요 시 구분선(`divider`)을 삽입한다.

| 이름 | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| **direction** | `Responsive<"row" \| "row-reverse" \| "column" \| "column-reverse">` | `"column"` | 스택 방향. `row`는 수평, `column`은 수직 스택을 의미한다. |
| **gap** | `Responsive<SpaceScale \| string \| number>` | `0` | 자식 간 간격. 숫자는 `px`로 해석한다. |
| **align** | `Responsive<"start" \| "center" \| "end" \| "stretch" \| "baseline">` | `"stretch"` | 교차 축 정렬(`align-items`). `start/end`는 논리적 시작/끝을 따른다. |
| **justify** | `Responsive<"start" \| "center" \| "end" \| "between" \| "around" \| "evenly">` | `"start"` | 주 축 정렬(`justify-content`). `start/end`는 `flex-start`/`flex-end`로 출력해 `flex-direction` (reverse 포함)의 주축을 따른다. |
| **wrap** | `Responsive<false \| "wrap" \| "wrap-reverse">` | `false` | 스택 내 요소를 여러 줄로 감쌀지 여부. `false`는 `nowrap`과 동일하다. |
| **divider** | `ReactNode` | — | 각 자식 사이에 삽입할 구분선 요소. 첫/마지막 위치에는 그리지 않는다. |
| **inline** | `boolean` | `false` | `inline-flex` 로 렌더링해 텍스트 흐름 안에서 배치한다. |
| **as** | `ElementType` | `"div"` | 시맨틱 태그 또는 커스텀 컴포넌트로 대체한다. |
| **기타** | `ComponentPropsWithoutRef<"div">` | — | `className`, `style`, `data-*`, `role` 등 기본 속성을 그대로 전달한다. |

## Flex (`@ara/react/flex`)

가장 범용적인 `flex` 컨테이너다. 스택보다 세밀한 플렉스 배치를 위해 사용하며, `gap`·정렬 규칙은 Stack과 동일하다.

| 이름 | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| **direction** | `Responsive<"row" \| "row-reverse" \| "column" \| "column-reverse">` | `"row"` | 메인 축 방향(`flex-direction`). |
| **gap** | `Responsive<SpaceScale \| string \| number>` | `0` | 자식 간 간격. |
| **align** | `Responsive<"start" \| "center" \| "end" \| "stretch" \| "baseline">` | `"stretch"` | `align-items`. |
| **justify** | `Responsive<"start" \| "center" \| "end" \| "between" \| "around" \| "evenly">` | `"start"` | `justify-content`. `start/end`는 `flex-start`/`flex-end`로 매핑되어 역방향 `flex-direction`에서도 주 축 시작/끝을 따른다. |
| **wrap** | `Responsive<false \| "wrap" \| "wrap-reverse">` | `false` | `flex-wrap` 설정. |
| **inline** | `boolean` | `false` | `inline-flex` 렌더링. |
| **as** | `ElementType` | `"div"` | 시맨틱 태그 교체. |
| **기타** | `ComponentPropsWithoutRef<"div">` | — | 네이티브 div 속성 전달. |

## Grid (`@ara/react/grid`)

격자 배치용 컨테이너다. 컬럼/로우 개수 또는 템플릿 문자열을 받아 CSS Grid 레이아웃을 구성한다.

| 이름 | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| **columns** | `Responsive<number \| string>` | `1` | 컬럼 개수 또는 `grid-template-columns` 문자열. 숫자는 `repeat(n, minmax(0, 1fr))`로 확장한다. |
| **rows** | `Responsive<number \| string>` | `"auto"` | 로우 개수 또는 `grid-template-rows` 문자열. 숫자는 `repeat(n, minmax(0, auto))`. |
| **areas** | `string[]` | — | `grid-template-areas` 한 줄씩을 배열로 전달. 생략 시 영역 정의 없음. |
| **gap** | `Responsive<SpaceScale \| string \| number>` | `0` | 전체 격자 간격(`gap`). |
| **columnGap** | `Responsive<SpaceScale \| string \| number>` | — | 컬럼 전용 간격. 설정 시 `gap`보다 우선한다. |
| **rowGap** | `Responsive<SpaceScale \| string \| number>` | — | 로우 전용 간격. 설정 시 `gap`보다 우선한다. |
| **align** | `Responsive<"start" \| "center" \| "end" \| "stretch">` | `"stretch"` | 아이템 교차 축 정렬(`align-items`). |
| **justify** | `Responsive<"start" \| "center" \| "end" \| "stretch">` | `"stretch"` | 인라인 축 정렬(`justify-items`). |
| **autoFlow** | `Responsive<"row" \| "column" \| "dense" \| "row dense" \| "column dense">` | `"row"` | 자동 배치 규칙(`grid-auto-flow`). |
| **inline** | `boolean` | `false` | `inline-grid` 렌더링. |
| **as** | `ElementType` | `"div"` | 시맨틱 태그 교체. |
| **기타** | `ComponentPropsWithoutRef<"div">` | — | 네이티브 div 속성 전달. |

## Spacer (`@ara/react/spacer`)

형제 요소 사이에 고정 간격을 만들기 위한 전용 구성 요소다. 레이아웃 컨테이너 없이도 margin/gap을 안전하게 삽입할 수 있다.

| 이름 | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| **size** | `SpaceScale \| string \| number` | (필수) | 공간 크기. 숫자는 `px`로 해석한다. |
| **direction** | `"inline" \| "block"` | `"block"` | 어느 축을 채울지 결정한다. `inline`은 가로, `block`은 세로 방향 간격이다. |
| **inline** | `boolean` | `false` | `inline-block` 으로 렌더링해 텍스트 흐름에 삽입한다. |
| **as** | `ElementType` | `"div"` | 시맨틱 태그 교체. |
| **shrink** | `boolean` | `true` | 필요 시 0까지 축소 가능(`flex-shrink`). `false`면 가용 공간보다 커도 줄어들지 않는다. |
| **grow** | `boolean` | `false` | 남는 공간을 차지하도록 확장(`flex-grow`). Stack/Flex 내부에서 사용 시 의미가 있다. |
| **기타** | `ComponentPropsWithoutRef<"div">` | — | 네이티브 div 속성 전달. |

## 설계/계약 메모

- 정렬·방향 프롭은 **논리적 start/end** 어휘를 사용해 RTL 전환 시 자동 반영하되, `justify`는 `flex-direction`의 주 축(역방향 포함)을 따르도록 `flex-start`/`flex-end`를 사용한다.
- Stack/Flex/Grid는 기본적으로 `box-sizing: border-box`를 사용하며, 자식 요소의 `margin`과 무관하게 `gap`으로 일관된 간격을 만든다.
- 반응형 프롭은 **가장 작은 구간부터 점진적으로 덮어쓴다**. 예를 들어 `gap={{ base: "sm", md: "lg" }}` 는 모바일에서 `sm`, 768px 이상에서 `lg`를 사용한다.
- Spacer는 레이아웃 컨테이너와 무관하게 단독 사용 가능하며, 접근성을 위해 시맨틱 의미가 없는 요소를 기본으로 사용한다.

## RTL & 접근성 가이드

- `start`/`end` 정렬 값은 CSS 논리 정렬 속성으로 출력돼 `dir="rtl"`에서도 동일한 공간·정렬을 보장한다.
- Spacer는 `inline-size`/`block-size`를 사용해 방향 전환 시에도 간격이 뒤섞이지 않으며, `aria-hidden`으로 탭 순서에서 제외된다.
- Stack의 `divider`는 `role="presentation"`, `tabIndex={-1}`, `aria-hidden`을 기본으로 적용해 화면 읽기/탭 순서를 흐트러뜨리지 않는다.
