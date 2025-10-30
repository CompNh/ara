# Storybook TypeScript "node" 타입 정의 해결 가이드

Storybook 워크스페이스(`apps/storybook`)를 작업할 때 다음과 같은 TypeScript 오류가 나타날 수 있습니다.

```
Cannot find type definition file for 'node'.
  The file is in the program because:
    Entry point of type library 'node' specified in compilerOptions
```

이 저장소에서는 루트 `package.json`의 워크스페이스 수준 개발 의존성으로 Node 타입 정의(`@types/node`)를 선언해 문제를 해결합니다. 루트에서 의존성을 설치하기만 하면, 편집기와 Storybook 빌드는 `apps/storybook` 내부에 별도 의존성을 추가하지 않아도 `node` 타입을 올바르게 해석할 수 있습니다.

## 로컬에서 해결하는 방법

1. 저장소 루트에서 의존성을 설치합니다.

   ```sh
   pnpm install
   ```

2. 사용하는 편집기가 저장소 루트를 워크스페이스로 열도록 합니다. 일부 편집기는 열린 폴더를 기준으로 타입 정의를 검색하기 때문에 `apps/storybook`만 단독으로 열면 `@types/node`가 들어 있는 루트 `node_modules`를 찾지 못합니다.

3. 의존성 설치 전에 수집된 진단이 캐시되어 있다면 편집기에서 TypeScript 언어 서비스를 다시 시작합니다.

루트에서 의존성을 설치하고 편집기가 워크스페이스 루트를 인식하면, Storybook의 tsconfig에서 `"types": ["node", "vite/client"]`를 선언하더라도 문제없이 Node 타입을 찾을 수 있습니다.
