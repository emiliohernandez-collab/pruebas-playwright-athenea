import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M08-07-7 — Super Administrador — Eliminar artículo de conocimiento', async ({ page }) => {
  test.setTimeout(45_000);
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
  await page.goto('/KnowledgeBase/Admin');
  const title = `QA M08-07 ${Date.now()}`;
  await page.getByRole('button', { name: /Nuevo artículo|Agregar artículo|Crear artículo/i }).first().click();
  let dialog = page.getByRole('dialog');
  await dialog.getByRole('textbox').first().fill(title);
  if (await dialog.locator('textarea').count()) await dialog.locator('textarea').first().fill('Contenido de prueba para eliminar.');
  if (await dialog.locator('select').count()) await dialog.locator('select').first().selectOption({ index: 1 });
  await dialog.getByRole('button', { name: /Guardar|Crear/i }).click();
  const row = page.locator('tr, .card, .list-group-item').filter({ hasText: title }).first();
  await expect(row).toBeVisible();
  await row.getByRole('button').last().click();
  await page.getByRole('button', { name: /Sí, eliminar/i }).click();
  await expect.poll(
    async () => {
      await page.reload({ waitUntil: 'domcontentloaded' });
      return await page.locator('tr, .card, .list-group-item').filter({ hasText: title }).count();
    },
    { timeout: 30_000, intervals: [1_000, 2_000, 5_000] },
  ).toBe(0);
});
