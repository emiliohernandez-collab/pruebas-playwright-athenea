import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M08-05-6 — Administrador Organización — Crear artículo de conocimiento', async ({ page }) => {
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
  const title = `QA M08-05 ${Date.now()}`;
  await page.getByRole('button', { name: /Nuevo artículo|Agregar artículo|Crear artículo/i }).first().click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('textbox').first().fill(title);
  const textareas = dialog.locator('textarea');
  if (await textareas.count()) await textareas.first().fill('Contenido de prueba QA para artículo en borrador.');
  const selects = dialog.locator('select');
  if (await selects.count()) await selects.first().selectOption({ index: 1 });
  await dialog.getByRole('button', { name: /Guardar|Crear/i }).click();
  await expect(page.locator('body')).toContainText(title);
});
