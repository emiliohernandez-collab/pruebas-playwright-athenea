import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M08-04-6 — Administrador Organización — Eliminar categoría de conocimiento', async ({ page }) => {
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
  const category = `QA M08-04 ${Date.now()}`;
  await page.getByRole('button', { name: /Nueva categoría|Agregar categoría|Crear categoría/i }).first().click();
  let dialog = page.getByRole('dialog');
  await dialog.getByRole('textbox').first().fill(category);
  await dialog.getByRole('button', { name: /Guardar|Crear/i }).click();
  const row = page.locator('tr, .card, .list-group-item').filter({ hasText: category }).first();
  await expect(row).toBeVisible();
  await row.getByRole('button').last().click();
  await page.getByRole('button', { name: /Sí, eliminar/i }).click();
  await page.waitForTimeout(300);
  await expect(page.locator('body')).not.toContainText(category);
});
