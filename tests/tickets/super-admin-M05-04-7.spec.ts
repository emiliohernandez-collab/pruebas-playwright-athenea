import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M05-04-7 — Super Administrador — Eliminar categoría de tickets', async ({ page }) => {
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
  await page.goto('/Tickets/AdminCategories');
  await expect(page.locator('body')).toContainText(/Categor[ií]as de Tickets/i);
  await page.getByRole('button', { name: /Agregar Categoria/i }).click();
  const name = `QA M05-04 eliminar ${Date.now()}`;
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('textbox').first().fill(name);
  await dialog.getByRole('button', { name: /Guardar|Crear/i }).click();
  const row = page.getByRole('row').filter({ hasText: name }).first();
  await expect(row).toBeVisible();
  await row.getByRole('button').nth(2).click();
  const confirm = page.getByRole('button', { name: /Eliminar|Sí|Confirmar/i }).last();
  if (await confirm.isVisible().catch(() => false)) await confirm.click();
  await page.waitForTimeout(500);
  await page.reload();
  await expect(page.getByRole('row').filter({ hasText: name })).toHaveCount(0);
});
