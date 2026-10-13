import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M09-06-6 — Administrador Organización — Aprobar incidencia', async ({ page }) => {
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
  await page.goto('/Attendance/Incidents');
  await expect(page.locator('body')).toContainText(/incidencia|Pendiente/i);
  const approve = page.getByRole('button', { name: /Aprobar|Aceptar/i }).first();
  await expect(approve).toBeVisible();
  await approve.click();
  if (await page.getByRole('button', { name: /Sí|Confirmar/i }).count()) await page.getByRole('button', { name: /Sí|Confirmar/i }).click();
  await expect(page.locator('body')).toContainText(/Aprobada|aprobada|incidencia/i);
});
