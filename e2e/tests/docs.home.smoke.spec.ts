import { test, expect } from '@playwright/test';

test('docs: home smoke', async ({ page }) => {
  await page.goto('/'); // webServer + baseURL
  await expect(page.getByTestId('title')).toHaveText('Ara Docs Smoke');
  await expect(page.getByTestId('desc')).toBeVisible();
});
