import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M08-11-6 — Administrador Organización — Vincular artículo a ticket', async ({ page }) => {
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
  await page.goto('/Tickets');
  const ticket = page.locator('a[href*="/Tickets/Details/"]').first();
  await expect(ticket).toBeVisible();
  await ticket.click();
  await expect(page.locator('body')).toContainText(/Artículos relacionados|artículos/i);
  const linkButton = page.getByRole('button', { name: /Vincular.*artículo|Agregar.*artículo/i }).first();
  await expect(linkButton).toBeVisible();
  await linkButton.click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('combobox').selectOption({ index: 1 });
  await dialog.getByRole('button', { name: /Vincular|Guardar/i }).click();
  await expect(page.locator('body')).toContainText(/artículo vinculado|Artículos relacionados/i);
});
