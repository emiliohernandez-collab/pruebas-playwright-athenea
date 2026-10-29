import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M05-09-7 — Super Administrador — Crear política SLA', async ({ page }) => {
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
  await page.goto('/Tickets/AdminSLAs');
  await expect(page.locator('body')).toContainText(/Pol[ií]ticas SLA/i);
  await page.getByRole('button', { name: /Agregar SLA/i }).first().click();
  const name = `QA M05-09 ${Date.now()}`;
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('textbox').first().fill(name);
  await dialog.getByRole('combobox', { name: /Prioridad/i }).selectOption({ index: 1 });
  const numbers = dialog.getByRole('spinbutton');
  for (let i = 0; i < await numbers.count(); i++) await numbers.nth(i).fill('60');
  await dialog.getByRole('button', { name: /Guardar|Crear/i }).click();
  await expect(page.locator('body')).toContainText(name);
});
