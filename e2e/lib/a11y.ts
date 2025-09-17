import { AxeBuilder } from '@axe-core/playwright';
import type { Page } from '@playwright/test';

export async function runA11y(page: Page) {
  // 필요 시 .withTags(['wcag2a','wcag2aa']) 등 체이닝 가능
  const results = await new AxeBuilder({ page }).analyze();
  return results; // { violations, passes, ... }
}
