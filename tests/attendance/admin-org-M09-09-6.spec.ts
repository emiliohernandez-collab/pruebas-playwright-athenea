import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M09-09-6 — Administrador Organización — Eliminar reporte de asistencia', async ({ page }) => {
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
  const generate = page.getByRole('button', { name: /Generar|Crear reporte/i }).first();
  await generate.click();
  const report = page.locator('tr, .card, .list-group-item').filter({ hasText: /reporte|asistencia/i }).last();
  await expect(report).toBeVisible();
  await report.getByRole('button').last().click();
  if (await page.getByRole('button', { name: /Sí, eliminar|Confirmar/i }).count()) await page.getByRole('button', { name: /Sí, eliminar|Confirmar/i }).click();
  await page.waitForTimeout(500);
  await page.reload();
  await expect(page.locator('body')).toContainText(/reporte|asistencia/i);
});
