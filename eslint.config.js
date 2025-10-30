import { configs } from "@ara/eslint-config";

export default [
  ...configs.node,
  {
    ignores: ["**/*.md"]
  }
];
