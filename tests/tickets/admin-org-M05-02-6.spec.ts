import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M05-02-6 — Administrador Organización — Crear categoría de tickets', async ({ page }) => {
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
  await page.goto('/Tickets/AdminCategories');
  await expect(page.locator('body')).toContainText(/Categor[ií]as/i);
  await page.getByRole('button', { name: /Agregar Categoria/i }).click();
  const name = `QA M05-02 ${Date.now()}`;
  const dialog = page.getByRole('dialog');
  const field = dialog.getByRole('textbox').first();
  await field.fill(name);
  await dialog.getByRole('button', { name: /Guardar|Crear/i }).click();
  await expect(page.locator('body')).toContainText(name);
});
