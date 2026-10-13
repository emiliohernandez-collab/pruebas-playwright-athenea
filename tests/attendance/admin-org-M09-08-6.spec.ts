import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M09-08-6 — Administrador Organización — Generar reporte de asistencia', async ({ page }) => {
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
  await page.goto('/Attendance/Reports');
  await expect(page.locator('body')).not.toContainText(/Sin permiso|Acceso denegado|403/i);
  await expect(page.locator('body')).toContainText(/reporte|periodo|asistencia/i);
  const generate = page.getByRole('button', { name: /Generar|Crear reporte/i }).first();
  await expect(generate).toBeVisible();
  await generate.click();
  await expect(page.locator('body')).toContainText(/reporte|descarg|generad/i);
});
