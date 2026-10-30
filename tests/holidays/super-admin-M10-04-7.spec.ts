import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M10-04-7 — Super Administrador — Editar día festivo', async ({ page }) => {
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
  await page.goto('/Holidays');
  const original = `QA Festivo M10-04 ${Date.now()}`;
  const edited = `${original} editado`;
  await page.getByRole('button', { name: /Agregar/i }).last().click();
  let dialog = page.getByRole('dialog');
  await dialog.getByRole('textbox').first().fill(original);
  const date = dialog.locator('input[type="date"]').first();
  if (await date.count()) await date.fill('2026-11-02');
  await dialog.getByRole('button', { name: /Guardar|Crear/i }).click();
  const row = page.locator('tr').filter({ hasText: original }).first();
  await expect(row).toBeVisible();
  await row.getByRole('button').first().click();
  dialog = page.getByRole('dialog');
  await dialog.getByRole('textbox').first().fill(edited);
  await dialog.getByRole('button', { name: /Guardar|Actualizar/i }).click();
  await expect(page.locator('body')).toContainText(edited);
  await expect(page.locator('body')).toContainText(/11\/2\/2026|2\/11\/2026|2026-11-02/);
  await page.reload();
  await expect(page.locator('body')).toContainText(edited);
});
