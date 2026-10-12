import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M04-01-6 — Administrador Organización — Consultar reportes de tiempo', async ({ page }) => {
  test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan credenciales');
  const login = new LoginPage(page);
  const org = new OrganizationPage(page);
  const dashboard = new DashboardPage(page);
  await login.open();
  await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) {
    await org.select(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe');
    await org.continue();
  }
  await login.expectAuthenticated();
  await dashboard.expectLoaded();
  await page.goto('/ProjectTimeReports');
  await expect(page).toHaveURL(/\/ProjectTimeReports/);
  await expect(page.locator('body')).toContainText(/Reporte[s]? de tiempo|Reportes de Tiempo|Tiempo registrado/i);
  await expect(page.locator('table, [role="table"], .card').first()).toBeVisible();
  await page.reload();
  await expect(page.locator('body')).toContainText(/Reporte[s]? de tiempo|Reportes de Tiempo|Tiempo registrado/i);
});
