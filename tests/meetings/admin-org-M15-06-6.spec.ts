import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M15-06-6 — Administrador Organización — Iniciar transcripción', async ({ page }) => {
  test.setTimeout(60_000);
  const login = new LoginPage(page);
  const org = new OrganizationPage(page);
  const dashboard = new DashboardPage(page);
  await login.open();
  await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) {
    const expected = page.getByText(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe', { exact: true });
    if (await expected.count()) await expected.click(); else await page.getByText('Athenea Demo.', { exact: true }).click();
    await org.continue();
  }
  await login.expectAuthenticated();
  await dashboard.expectLoaded();
  await page.goto('/Meetings');
  const row = page.locator('tr').filter({ hasText: 'QA ERROR ABORT M15-05-6' }).first();
  await expect(row).toBeVisible({ timeout: 15_000 });
  await row.getByRole('link').click();
  const transcribe = page.getByRole('button', { name: /Transcripci[oó]n|Transcribir|Iniciar transcripci[oó]n/i }).first();
  await expect(transcribe).toBeVisible({ timeout: 15_000 });
  await transcribe.click();
  await expect(page.locator('body')).toContainText(/Transcripci[oó]n|procesando|completad/i, { timeout: 30_000 });
});
