import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M05-08-7 — Super Administrador — Eliminar campo personalizado', async ({ page }) => {
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
  await page.getByRole('button', { name: /Agregar Campo/i }).first().click();
  const name = `QA M05-08 eliminar ${Date.now()}`;
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('textbox').first().fill(name);
  await dialog.getByRole('combobox', { name: /Tipo de Campo/i }).selectOption({ index: 1 });
  await dialog.getByRole('button', { name: /Guardar|Crear/i }).click();
  const row = page.getByRole('row').filter({ hasText: name }).first();
  await expect(row).toBeVisible();
  page.once('dialog', dialog => dialog.accept());
  await row.getByRole('button').nth(2).click();
  await page.waitForTimeout(500);
  await page.reload();
  await expect(page.getByRole('row').filter({ hasText: name })).toHaveCount(0);
});
