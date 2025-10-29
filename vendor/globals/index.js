const browser = {
  window: false,
  document: false,
  navigator: false
};

const node = {
  module: false,
  require: false,
  __dirname: false,
  process: false
};

const es2024 = {
  globalThis: false,
  queueMicrotask: false
};

export { browser, node, es2024 };

export default {
  browser,
  node,
  es2024
};
