import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M09-07-6 — Administrador Organización — Rechazar incidencia', async ({ page }) => {
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
  let dialog = page.getByRole('dialog');
  if (await dialog.getByRole('textbox').count()) await dialog.getByRole('textbox').first().fill('Incidencia QA para rechazo');
  if (await dialog.locator('select').count()) await dialog.locator('select').first().selectOption({ index: 1 });
  await dialog.getByRole('button', { name: /Guardar|Registrar|Enviar/i }).click();
  await page.goto('/Attendance/Incidents');
  const reject = page.getByRole('button', { name: /Rechazar|Denegar/i }).first();
  await expect(reject).toBeVisible();
  await reject.click();
  const rejectDialog = page.getByRole('dialog');
  if (await rejectDialog.getByRole('textbox').count()) await rejectDialog.getByRole('textbox').first().fill('Motivo de rechazo QA');
  if (await rejectDialog.locator('textarea').count()) await rejectDialog.locator('textarea').first().fill('Motivo de rechazo QA');
  if (await rejectDialog.getByRole('button', { name: /Confirmar/i }).count()) await rejectDialog.getByRole('button', { name: /Confirmar/i }).click();
  await expect(page.locator('body')).toContainText(/Rechazada|rechazada/i);
});
