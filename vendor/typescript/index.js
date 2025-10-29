export const version = "0.0.0-stub";

export function transpileModule(source) {
  return {
    outputText: source,
    diagnostics: []
  };
}

export default {
  version,
  transpileModule
};
