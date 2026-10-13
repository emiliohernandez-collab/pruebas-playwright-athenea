import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M05-01-6 — Administrador Organización — Consultar tickets', async ({ page }) => {
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
  await page.goto('/Tickets/Index');
  await expect(page.locator('body')).toContainText(/Tickets/i);
  if (await page.locator('a[href*="/Tickets/Details/"]').count() === 0) {
    await page.getByRole('button', { name: /Crear Ticket/i }).first().click();
    const subject = `QA M05-01 ${Date.now()}`;
    await page.getByLabel(/Asunto/i).fill(subject);
    await page.locator('[contenteditable="true"]').first().fill('Ticket de prueba para validar la consulta del módulo.');
    await page.getByRole('combobox', { name: /Categoria/i }).selectOption({ index: 1 });
    await page.getByRole('button', { name: /Crear Ticket/i }).last().click();
    await expect(page).toHaveURL(/\/Tickets\/Details\//);
    await expect(page.locator('body')).toContainText(subject);
    return;
  }
  const ticketLink = page.locator('a[href*="/Tickets/Details/"]').first();
  await expect(ticketLink).toBeVisible();
  await ticketLink.click();
  await expect(page).toHaveURL(/\/Tickets\/Details\//);
  await expect(page.locator('body')).toContainText(/Detalle|Descripción|Estado/i);
});
