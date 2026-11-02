import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';
import path from 'node:path';

test.use({ ignoreHTTPSErrors: true });

test('M15-10-7 — Super Administrador — Eliminar reunión', async ({ page }) => {
  test.setTimeout(60_000);
  const login = new LoginPage(page);
  const org = new OrganizationPage(page);
  const dashboard = new DashboardPage(page);
  const fixtureName = 'QA eliminar reunión M15-10-7';
  await login.open();
  await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) {
    const expected = page.getByText(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe', { exact: true });
    if (await expected.count()) await expected.click();
    await org.continue();
  }
  await login.expectAuthenticated();
  await dashboard.expectLoaded();
  await page.goto('/Meetings');
  await page.getByRole('button', { name: /Subir Grabación/i }).first().click();
  await page.locator('input[type="text"]').nth(1).fill(fixtureName);
  await page.locator('input[type="file"]').first().setInputFiles(path.resolve('qa-meeting-with-audio.mp4'));
  await page.getByRole('button', { name: /Subir Grabación/i }).last().click();
  const row = page.locator('tr').filter({ hasText: fixtureName }).first();
  await expect(row).toBeVisible({ timeout: 15_000 });
  await row.locator('button.btn-soft-danger').first().click();
  const confirm = page.getByRole('button', { name: /^Eliminar$/i }).last();
  await expect(confirm).toBeVisible({ timeout: 8_000 });
  await confirm.click();
  await expect(page.locator('tr').filter({ hasText: fixtureName })).toHaveCount(0, { timeout: 15_000 });
});
