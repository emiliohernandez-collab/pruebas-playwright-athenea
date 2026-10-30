import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M09-02-7 — Super Administrador — Configurar horario de asistencia', async ({ page }) => {
  test.setTimeout(60_000);
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
  await page.goto('/Attendance/Config');
  await expect(page.locator('body')).not.toContainText(/Sin permiso|Acceso denegado|403/i);
  await expect(page.locator('body')).toContainText(/horario|tolerancia|asistencia/i);
  const edit = page.locator('button:has(i.mdi-pencil)').first();
  await expect(edit).toBeVisible();
  await edit.click();
  const dialog = page.getByRole('dialog');
  const inputs = dialog.locator('input');
  for (let i = 0; i < await inputs.count(); i++) {
    if (await inputs.nth(i).getAttribute('type') === 'number') await inputs.nth(i).fill('10');
  }
  await dialog.getByRole('button', { name: /Guardar|Actualizar/i }).click();
  await expect(page.locator('body')).toContainText(/guardad|actualiz|horario/i);
});
