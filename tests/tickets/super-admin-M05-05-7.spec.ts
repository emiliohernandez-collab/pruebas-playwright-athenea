import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M05-05-7 — Super Administrador — Cargar categorías predeterminadas', async ({ page }) => {
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
  const responsePromise = page.waitForResponse(response => response.url().includes('/Tickets/SeedDefaults') && response.request().method() === 'POST');
  await page.getByRole('button', { name: /Crear por defecto/i }).click();
  const confirm = page.getByRole('button', { name: 'Crear por defecto', exact: true }).last();
  await expect(confirm).toBeVisible();
  await confirm.click();
  const response = await responsePromise;
  expect(response.status()).toBe(200);
  const result = await response.json();
  expect(result.success).toBe(false);
  expect(result.message).toMatch(/Ya existen categor[ií]as/i);
});
