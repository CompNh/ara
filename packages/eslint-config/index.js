import js from "@eslint/js";
import jsxA11y from "eslint-plugin-jsx-a11y";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import prettierConfig from "eslint-config-prettier";
import globals from "globals";
import tseslint from "typescript-eslint";

const IGNORE_PATTERNS = [
  "**/.next/**",
  "**/.storybook/**",
  "**/.turbo/**",
  "**/coverage/**",
  "**/dist/**",
  "**/node_modules/**",
  "**/storybook-static/**"
];

const baseConfigs = tseslint.config(
  {
    name: "ara/ignores",
    ignores: IGNORE_PATTERNS
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    name: "ara/typescript-parser-options",
    files: ["**/*.{ts,tsx,cts,mts}"],
    languageOptions: {
      parserOptions: {
        projectService: true
      }
    }
  },
  prettierConfig
);

const reactLayer = {
  name: "ara/react",
  plugins: {
    react,
    "react-hooks": reactHooks,
    "jsx-a11y": jsxA11y
  },
  languageOptions: {
    globals: {
      ...globals.browser,
      ...globals.es2024
    }
  },
  settings: {
    react: {
      version: "detect"
    }
  },
  rules: {
    ...react.configs.recommended.rules,
    ...react.configs["jsx-runtime"].rules,
    ...reactHooks.configs.recommended.rules,
    ...jsxA11y.configs.recommended.rules
  }
};

const nodeLayer = {
  name: "ara/node",
  languageOptions: {
    globals: {
      ...globals.node,
      ...globals.es2024
    }
  }
};

function withBase(...layers) {
  return [...baseConfigs, ...layers];
}

export const configs = {
  /**
   * 기본 TypeScript/JavaScript 규칙 세트
   */
  base: withBase(),
  /**
   * Node.js 실행 환경을 위한 규칙 세트
   */
  node: withBase(nodeLayer),
  /**
   * 브라우저 + React 환경을 위한 규칙 세트
   */
  react: withBase(reactLayer)
};

export const preset = configs.react;

export default preset;
