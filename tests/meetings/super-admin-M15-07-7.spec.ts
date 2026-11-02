import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test.use({ ignoreHTTPSErrors: true });

test('M15-07-7 — Super Administrador — Iniciar análisis con IA', async ({ page }) => {
  test.setTimeout(60_000);
  const login = new LoginPage(page);
  const org = new OrganizationPage(page);
  const dashboard = new DashboardPage(page);
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
  const row = page.locator('tr').filter({ hasText: 'QA transcripción audio real M15-06-7' }).first();
  await expect(row).toBeVisible({ timeout: 15_000 });
  await row.getByRole('link').click();
  await page.locator('#btnReAnalyze').click();
  await expect(page.locator('body')).toContainText(/Análisis iniciado/i, { timeout: 15_000 });
});
