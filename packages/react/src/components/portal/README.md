# Portal

React 트리의 외부(DOM 계층 최상단 등)로 자식 노드를 이동시키는 컴포넌트입니다. 오버레이/모달과 같이 시맨틱 트리 밖에서 렌더링해야
하는 UI를 단순한 API로 구성합니다.

## 사용 방법

```tsx
import { Portal } from "@ara/react";

function TooltipContent() {
  return (
    <Portal>
      <div role="tooltip">툴팁 내용</div>
    </Portal>
  );
}
```

## Props

| 이름 | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| **container** | `HTMLElement \| null` | 자동 생성 | 포털이 렌더링될 DOM 노드. 지정하지 않으면 `data-ara-portal-container`를 가진 `div`를 `document.body`에 생성합니다. |
| **disablePortal** | `boolean` | `false` | `true`일 경우 포털을 사용하지 않고 자식을 현재 위치에 그대로 렌더링합니다. SSR 환경에서 `document`가 없는 경우에도 자연스럽게 동작합니다. |
| **className** | `string` | — | 포털 컨테이너에 병합될 클래스 이름. 기존 클래스는 보존되며 `ara-portal` 기본 클래스와 함께 적용됩니다. |
| **children** | `ReactNode` | — | 포털로 이동시킬 콘텐츠. |

## 동작/고려 사항

- 컨테이너를 전달하지 않으면 `usePortal` 훅이 기본 컨테이너를 생성·정리합니다.
- 전달한 컨테이너가 StrictMode에서 중복 생성되지 않도록 `usePortal`의 내부 정리 로직을 따릅니다.
- `className`은 컨테이너의 기존 클래스와 병합하며, 컴포넌트가 언마운트되면 원래 클래스 상태로 복원합니다.
- 포털을 비활성화(`disablePortal`)하면 DOM 이동 없이 자식이 현재 트리에 머무르므로, SSR이나 간단한 레이아웃에서 손쉽게 폴백할 수 있습니다.
