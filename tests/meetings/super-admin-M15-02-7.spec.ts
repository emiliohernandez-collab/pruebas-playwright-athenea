import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';
import path from 'node:path';
test.use({ ignoreHTTPSErrors: true });

test('M15-02-7 — Super Administrador — Iniciar carga de reunión', async ({ page }) => {
  test.setTimeout(45_000);
  const login = new LoginPage(page);
  const org = new OrganizationPage(page);
  const dashboard = new DashboardPage(page);
  await login.open();
  await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) {
    const expected = page.getByText(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe', { exact: true });
    if (await expected.count()) await expected.click();
    else await page.getByText('Athenea Demo.', { exact: true }).click();
    await org.continue();
  }
  await login.expectAuthenticated();
  await dashboard.expectLoaded();
  await page.goto('/Meetings');
  await page.getByRole('button', { name: /Subir Grabación/i }).first().click();
  await page.locator('input[type="text"]').nth(1).fill('QA reunión automatizada M15-02-7');
  await page.locator('input[type="file"]').first().setInputFiles(path.resolve('qa-meeting-with-audio.mp4'));
  await page.getByRole('button', { name: /Subir Grabación/i }).last().click();
  await expect(page.locator('body')).toContainText(/Grabación subida|Puedes transcribirla|Completed/i);
});
