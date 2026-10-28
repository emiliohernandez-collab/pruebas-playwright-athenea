import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M15-07-6 — Administrador Organización — Iniciar análisis con IA', async ({ page }) => {
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
  await page.goto('/Meetings/Detail/f4494ad0-1ffc-4626-a399-2fd8e2c79a0a');
  await expect(page.locator('body')).toContainText('Hola, hija, ven', { timeout: 15_000 });
  const analyze = page.getByRole('button', { name: /Re-analizar con IA|Analizar|Análisis IA/i }).first();
  await expect(analyze).toBeVisible({ timeout: 15_000 });
  await analyze.click();
  await expect(page.locator('body')).toContainText(/Análisis|resumen|acuerdos|tareas|procesando|completad/i, { timeout: 30_000 });
});
