import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M10-05-6 — Administrador Organización — Eliminar día festivo', async ({ page }) => {
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
  await page.goto('/Holidays');
  const name = `QA Festivo M10-05 ${Date.now()}`;
  await page.getByRole('button', { name: /Agregar/i }).last().click();
  let dialog = page.getByRole('dialog');
  await dialog.getByRole('textbox').first().fill(name);
  if (await dialog.locator('input[type="date"]').count()) await dialog.locator('input[type="date"]').first().fill('2026-11-03');
  await dialog.getByRole('button', { name: /Guardar|Crear/i }).click();
  const row = page.locator('tr').filter({ hasText: name }).first();
  await expect(row).toBeVisible();
  page.once('dialog', d => d.accept());
  await row.getByRole('button').last().click();
  if (await page.getByRole('button', { name: /Sí, eliminar|Confirmar/i }).count()) await page.getByRole('button', { name: /Sí, eliminar|Confirmar/i }).click();
  await page.waitForTimeout(300);
  await page.reload();
  await expect(page.locator('body')).not.toContainText(name);
});
