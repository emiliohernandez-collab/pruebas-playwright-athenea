import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M08-08-7 — Super Administrador — Publicar artículo', async ({ page }) => {
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
  await page.goto('/KnowledgeBase/Admin');
  const title = `QA M08-08 ${Date.now()}`;
  await page.getByRole('button', { name: /Nuevo artículo|Agregar artículo|Crear artículo/i }).first().click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('textbox').first().fill(title);
  if (await dialog.locator('textarea').count()) await dialog.locator('textarea').first().fill('Artículo QA para publicar.');
  if (await dialog.locator('select').count()) await dialog.locator('select').first().selectOption({ index: 1 });
  await dialog.getByRole('button', { name: /Guardar|Crear/i }).click();
  const row = page.locator('tr').filter({ hasText: title }).first();
  await expect(row).toBeVisible();
  await row.getByRole('button').nth(1).click();
  const confirm = page.getByRole('button', { name: /Sí, publicar|Confirmar/i });
  if (await confirm.count()) await confirm.click();
  await expect(row).toContainText(/Publicado|Publicad/i, { timeout: 20_000 });
  await page.reload();
  await expect(page.locator('tr').filter({ hasText: title })).toContainText(/Publicado|Publicad/i);
});
