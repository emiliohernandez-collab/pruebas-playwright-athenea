import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M10-05-7 — Super Administrador — Eliminar día festivo', async ({ page }) => {
  test.setTimeout(75_000);
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
  await row.locator('button').nth(1).click({ force: true });
  const confirm = page.getByRole('button', { name: /Sí, eliminar|Confirmar/i });
  if (await confirm.count()) await confirm.click();
  await expect.poll(async () => {
    await page.reload({ waitUntil: 'domcontentloaded' });
    return await page.locator('tr').filter({ hasText: name }).count();
  }, { timeout: 30_000, intervals: [1_000, 2_000, 5_000] }).toBe(0);
});
