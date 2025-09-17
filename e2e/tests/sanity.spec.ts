import { test, expect } from '@playwright/test';

test('sanity', async ({ page }) => {
  // 7-1에서 dev server 붙이기 전이라 홈으로만 이동
  await page.goto('about:blank');
  expect(true).toBe(true);
});
