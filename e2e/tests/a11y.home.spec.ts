import { test, expect } from '@playwright/test';
import { runA11y } from '../lib/a11y';

test('a11y: home @a11y', async ({ page }, testInfo) => {
  await page.goto('/'); // baseURL + webServer 사용
  const { failed, violations, reportFile } = await runA11y(page, {
    // 필요시 태그/영역 조정
    tags: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
    reportFile:
      testInfo.project.outputDir.replace(/test-results.*$/, '') + 'e2e/a11y-report/home.html',
    failOn: ['critical', 'serious'],
  });

  // JSON도 첨부(Playwright Report에서 확인)
  await testInfo.attach('a11y-violations.json', {
    body: Buffer.from(JSON.stringify(violations, null, 2)),
    contentType: 'application/json',
  });

  // 실패 기준: critical/serious 0
  expect(failed, `See HTML: ${reportFile}`).toHaveLength(0);
});
