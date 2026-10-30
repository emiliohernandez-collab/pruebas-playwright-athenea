import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M08-02-7 — Super Administrador — Crear categoría de conocimiento', async ({ page }) => {
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
  await expect(page.locator('body')).not.toContainText(/Sin permiso|Acceso denegado|403/i);
  const category = `QA M08-02 ${Date.now()}`;
  await page.getByRole('button', { name: /Nueva categoría|Agregar categoría|Crear categoría/i }).first().click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('textbox').first().fill(category);
  await dialog.getByRole('button', { name: /Guardar|Crear/i }).click();
  await expect(page.locator('body')).toContainText(category, { timeout: 20_000 });
});
