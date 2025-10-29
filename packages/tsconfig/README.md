# @ara/tsconfig

Ara 모노레포 패키지에서 공유하는 TypeScript 설정 모음이다. `packages/*` 라이브러리와 `apps/*` 애플리케이션 모두 아래 절차를 따라 설정을 확장한다.

## 사용 방법

1. 패키지 루트에 `tsconfig.json`(또는 `tsconfig.build.json`)을 생성한다.
2. `extends` 속성으로 루트 `tsconfig.base.json`을 참조한다.
3. 패키지별 출력 경로나 포함/제외 대상을 추가한다.

```jsonc
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "exclude": ["dist", "node_modules"]
}
```

루트 `tsconfig.base.json`은 `@ara/tsconfig/base.json`을 확장해 공통 모듈 해석과 `@ara/*` 경로 별칭을 정의한다. React 패키지는 필요에 따라 `compilerOptions.jsx` 를 `react-jsx`로 덮어쓰거나 `@ara/tsconfig/react-library.json`을 추가 확장한다.

## 제공 프리셋

- `@ara/tsconfig/base.json` : 모든 패키지에서 공통으로 사용하는 엄격한 기본 설정. 선언 파일을 생성(`emitDeclarationOnly`)하며, 모듈 해석은 번들러 기준(`Bundler`)으로 고정한다.
- `@ara/tsconfig/react-library.json` : React 기반 라이브러리를 위한 확장 프리셋. DOM 라이브러리와 `react-jsx` 컴파일을 활성화한다.

## 점검 방법

- `pnpm exec tsc --showConfig -p tsconfig.base.json` : 루트 설정이 정상적으로 확장되었는지 확인한다.
- `pnpm run check:manifests` : 패키지 메타데이터가 [패키지 거버넌스 가이드](../../docs/package-governance.md)와 일치하는지 검증한다.
