import { test, expect } from '@playwright/test';

test.describe('Input (smoke)', () => {
  test('label 연결 / hint+error 연결 / errormessage / 입력 타이핑', async ({ page }) => {
    //await page.goto('/components/input'); // baseURL= http://localhost:5173 가정
    await page.goto('/?page=input');
    await expect(page.getByRole('heading', { name: 'Input Demo' })).toBeVisible(); // 페이지 로딩 확인

    // label for=id
    const email = page.getByLabel('이메일');
    await expect(email).toBeVisible();

    // hint + error → describedby(둘 다 포함)
    const nameInput = page.getByLabel('이름');
    const describedby = await nameInput.getAttribute('aria-describedby');
    expect(describedby).toBeTruthy();
    expect(describedby!).toMatch(/-hint/);

    const pwd = page.getByLabel('암호');
    await expect(pwd).toHaveAttribute('aria-invalid', 'true');
    // const errId = await pwd.getAttribute('aria-errormessage');
    // expect(errId).toBeTruthy();
    // const err = page.locator(`#${errId}`); // ← 여기서 CSS 셀렉터 에러
    // await expect(err).toHaveAttribute('role', 'alert');
    const errId = await pwd.getAttribute('aria-errormessage');
    expect(errId).toBeTruthy();
    // id에 콜론(:)이 섞여 있어도 안전한 "속성 셀렉터"로 조회
    const err = page.locator(`[id="${errId}"]`);
    await expect(err).toHaveAttribute('role', 'alert');

    // 제어 입력 타이핑
    const nick = page.getByLabel('닉네임');
    await nick.fill('ara');
    await expect(page.getByTestId('nick-value')).toHaveText('ara');
  });
});
