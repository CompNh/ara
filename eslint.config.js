import { configs } from "@ara/eslint-config";
import jsxA11y from "eslint-plugin-jsx-a11y";

const REACT_FILE_PATTERNS = ["packages/react/**/*.{js,jsx,ts,tsx}"];

export default [
  ...configs.node,
  {
    ignores: ["**/*.md"]
  },
  {
    files: REACT_FILE_PATTERNS,
    plugins: {
      "jsx-a11y": jsxA11y
    }
  }
];
