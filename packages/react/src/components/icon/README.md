# Icon

`Icon` 컴포넌트는 `@ara/icons`에서 생성된 개별 SVG 아이콘을 토큰 기반 크기·색상 규칙에 맞춰 출력한다.

## Props

| 이름 | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| **icon** | `ComponentType<IconProps>` | (필수) | `@ara/icons`에서 export된 아이콘 컴포넌트. |
| **size** | `"sm" \| "md" \| "lg" \| string \| number` | `"md"` | 토큰 스케일 또는 임의 CSS/픽셀 크기. |
| **tone** | `"primary" \| "neutral" \| "danger" \| null` | `null` | 지정 시 토큰 색상을 `currentColor` 로 주입한다. |
| **strokeWidth** | `number` | `tokens.component.icon.strokeWidth.default` | 스트로크 기반 아이콘의 두께를 덮어쓴다. |
| **filled** | `boolean` | `false` | `fill` 이 비어 있거나 `none` 인 노드에 `currentColor` 를 적용한다. |
| **className** | `string` | — | 기본 클래스(`ara-icon`)와 병합된다. |
| **기타** | `@ara/icons` `IconProps` | — | `title`, `aria-*`, `data-*` 등 SVG 속성을 그대로 전달한다. |

## 사용 예시

```tsx
import { Icon } from "@ara/react";
import { ArrowRight } from "@ara/icons/icons/arrow-right";

function Example() {
  return <Icon icon={ArrowRight} size="sm" tone="primary" aria-label="다음" />;
}
```
