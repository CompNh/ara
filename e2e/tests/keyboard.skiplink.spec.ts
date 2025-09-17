import { test, expect } from '@playwright/test';

test('keyboard: skip link -> content', async ({ page, browserName }) => {
  await page.goto('/');

  if (browserName === 'webkit') {
    // Safari 계열: Tab이 링크를 건너뛰는 환경 존재 → 확정적으로 포커스
    await page.focus('.skip-link');
  } else {
    await page.keyboard.press('Tab');
  }

  await expect(page.locator('.skip-link')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#content')).toBeVisible();
});
