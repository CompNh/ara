import * as React from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

type ProvidersProps = { children: React.ReactNode };

// TODO: 필요해지면 여기서 Theme/Intl/Router 등 Provider를 래핑한다.
const Providers = ({ children }: ProvidersProps) => <>{children}</>;

const customRender = (ui: React.ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: Providers, ...options });

export * from '@testing-library/react';
export { customRender as render, userEvent };
