import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M08-03-7 — Super Administrador — Editar categoría de conocimiento', async ({ page }) => {
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
  const original = `QA M08-03 ${Date.now()}`;
  const edited = `${original} editada`;
  await page.getByRole('button', { name: /Nueva categoría|Agregar categoría|Crear categoría/i }).first().click();
  let dialog = page.getByRole('dialog');
  await dialog.getByRole('textbox').first().fill(original);
  await dialog.getByRole('button', { name: /Guardar|Crear/i }).click();
  const row = page.locator('tr, .card, .list-group-item').filter({ hasText: original }).first();
  await expect(row).toBeVisible();
  await row.getByRole('button').first().click();
  dialog = page.getByRole('dialog');
  await dialog.getByRole('textbox').first().fill(edited);
  await dialog.getByRole('button', { name: /Guardar|Actualizar/i }).click();
  await expect(page.locator('body')).toContainText(edited);
  await page.reload();
  await expect(page.locator('body')).toContainText(edited);
});
