import type { Decorator, Preview } from "@storybook/react";
import { ThemeProvider, type ColorScheme } from "@ara/react";

const withAraTheme: Decorator = (Story, context) => {
  const mode = (context.globals.colorMode as ColorScheme | undefined) ?? "system";

  return (
    <ThemeProvider mode={mode} defaultMode="light" storageKey={null}>
      <Story />
    </ThemeProvider>
  );
};

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/
      }
    }
  },
  globalTypes: {
    colorMode: {
      description: "Storybook 전역에서 사용할 테마 모드",
      defaultValue: "system",
      toolbar: {
        icon: "mirror",
        items: [
          { value: "system", icon: "mirror", title: "시스템" },
          { value: "light", icon: "sun", title: "라이트" },
          { value: "dark", icon: "moon", title: "다크" }
        ],
        dynamicTitle: true
      }
    }
  },
  decorators: [withAraTheme]
};

export default preview;
