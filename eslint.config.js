import { configs } from "@ara/eslint-config";

export default [
  ...configs.node,
  {
    files: ["**/*.md"],
    languageOptions: {
      parser: null
    }
  }
];
