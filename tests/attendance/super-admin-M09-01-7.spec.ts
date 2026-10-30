import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M09-01-7 — Super Administrador — Consultar asistencia', async ({ page }) => {
  test.setTimeout(45_000);
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
  await page.goto('/Attendance');
  await expect(page).toHaveURL(/\/Attendance/);
  await expect(page.locator('body')).not.toContainText(/Sin permiso|Acceso denegado|403/i);
  await expect(page.locator('body')).toContainText(/asistencia|entrada|salida|registro/i);
});
