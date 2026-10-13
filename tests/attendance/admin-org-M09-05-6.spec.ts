import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M09-05-6 — Administrador Organización — Registrar incidencia', async ({ page }) => {
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
  await page.getByRole('button', { name: /Reportar Incidencia|Registrar incidencia/i }).click();
  const dialog = page.getByRole('dialog');
  const textboxes = dialog.getByRole('textbox');
  if (await textboxes.count()) await textboxes.first().fill('Incidencia QA de asistencia');
  const selects = dialog.locator('select');
  if (await selects.count()) await selects.first().selectOption({ index: 1 });
  await dialog.getByRole('button', { name: /Guardar|Registrar|Enviar/i }).click();
  await expect(page.locator('body')).toContainText(/Pendiente|incidencia|registrad/i);
});
