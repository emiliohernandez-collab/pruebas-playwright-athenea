import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M05-07-6 — Administrador Organización — Editar campo personalizado', async ({ page }) => {
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
  await page.goto('/Tickets/AdminCustomFields');
  await expect(page.locator('body')).toContainText(/Campos personalizados/i);
  const row = page.getByRole('row').filter({ hasText: 'QA M05-06' }).first();
  await expect(row).toBeVisible();
  await row.getByRole('button').first().click();
  const dialog = page.getByRole('dialog');
  const updated = `QA M05-07 editado ${Date.now()}`;
  await dialog.getByRole('textbox').first().fill(updated);
  await dialog.getByRole('button', { name: /Guardar|Actualizar/i }).click();
  await expect(page.locator('body')).toContainText(updated);
  await page.reload();
  await expect(page.locator('body')).toContainText(updated);
});
