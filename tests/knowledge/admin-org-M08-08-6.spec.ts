import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M08-08-6 — Administrador Organización — Publicar artículo', async ({ page }) => {
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
  let dialog = page.getByRole('dialog');
  await dialog.getByRole('textbox').first().fill(title);
  if (await dialog.locator('textarea').count()) await dialog.locator('textarea').first().fill('Artículo QA para publicar.');
  if (await dialog.locator('select').count()) await dialog.locator('select').first().selectOption({ index: 1 });
  await dialog.getByRole('button', { name: /Guardar|Crear/i }).click();
  const row = page.locator('tr').filter({ hasText: title }).first();
  await expect(row).toBeVisible();
  const publish = row.getByRole('button', { name: /Publicar/i });
  await row.getByRole('button').nth(1).click();
  if (await page.getByRole('button', { name: /Sí, publicar|Confirmar/i }).count()) await page.getByRole('button', { name: /Sí, publicar|Confirmar/i }).click();
  await page.waitForTimeout(500);
  await expect(row).toContainText(/Publicado|Publicad/i);
});
