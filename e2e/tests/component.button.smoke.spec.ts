import { test, expect } from '@playwright/test';
import { runA11y } from '../lib/a11y';

test('button: role/name + keyboard + click', async ({ page, browserName }, testInfo) => {
  await page.goto('/?page=button');

  // a11y 역할/이름 확인
  const btn = page.getByRole('button', { name: '증가' });
  await expect(btn).toBeVisible();

  // 키보드 포커스: Safari(WebKit)는 Tab 포커스 이슈 있으니 focus() 사용
  if (browserName === 'webkit') await btn.focus();
  else {
    // Skip link가 먼저 잡히므로 Tab 2~3번까지 고려
    await page.keyboard.press('Tab'); // skip-link
    await page.keyboard.press('Tab'); // 버튼
  }
  await expect(btn).toBeFocused();

  // Space/Enter 동작 확인
  await page.keyboard.press(' ');
  await expect(page.getByTestId('count')).toHaveText('count: 1');
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('count')).toHaveText('count: 2');

  // Axe a11y (컴포넌트 영역 중심)
  const { failed, reportFile } = await runA11y(page, {
    include: ['#content'],
    reportFile:
      testInfo.project.outputDir.replace(/test-results.*$/, '') + 'e2e/a11y-report/button.html',
    failOn: ['critical', 'serious'],
  });
  expect(failed, `See HTML: ${reportFile}`).toHaveLength(0);
});
