import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M08-09-7 — Super Administrador — Votar artículo útil', async ({ page }) => {
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
  const title = `QA M08-09 ${Date.now()}`;
  await page.getByRole('button', { name: /Nuevo artículo|Agregar artículo|Crear artículo/i }).first().click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('textbox').first().fill(title);
  if (await dialog.locator('textarea').count()) await dialog.locator('textarea').first().fill('Artículo publicado para validar voto útil.');
  if (await dialog.locator('select').count()) await dialog.locator('select').first().selectOption({ index: 1 });
  await dialog.getByRole('button', { name: /Guardar|Crear/i }).click();
  const row = page.locator('tr').filter({ hasText: title }).first();
  await expect(row).toBeVisible();
  await row.getByRole('button').nth(1).click();
  await page.waitForTimeout(300);
  await row.getByRole('link').click();
  await expect(page.locator('body')).toContainText(title);
  const useful = page.getByRole('button', { name: /Sí|útil|util/i }).first();
  await expect(useful).toBeVisible();
  await useful.click();
  await expect(page.locator('body')).toContainText(/gracias|registr|útil|util/i);
});
