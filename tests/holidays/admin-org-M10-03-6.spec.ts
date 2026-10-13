import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M10-03-6 — Administrador Organización — Crear día festivo', async ({ page }) => {
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
  await page.getByRole('button', { name: /Agregar/i }).last().click();
  const dialog = page.getByRole('dialog');
  const name = `QA Festivo ${Date.now()}`;
  await dialog.getByRole('textbox').first().fill(name);
  const date = dialog.locator('input[type="date"]').first();
  if (await date.count()) await date.fill('2026-10-31');
  await dialog.getByRole('button', { name: /Guardar|Crear/i }).click();
  await expect(page.locator('body')).toContainText(name);
  await expect(page.locator('body')).toContainText(/10\/31\/2026|31\/10\/2026|2026-10-31/);
});
