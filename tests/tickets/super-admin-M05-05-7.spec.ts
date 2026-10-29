import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M05-05-7 — Super Administrador — Cargar categorías/SLA predeterminados', async ({ page }) => {
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
  const responsePromise = page.waitForResponse(response => response.url().includes('/ticket-categories/seed-defaults') && response.request().method() === 'POST');
  await page.evaluate(() => {
    fetch('/api/v1/ticket-categories/seed-defaults', { method: 'POST' });
  });
  const response = await responsePromise;
  expect(response.status()).toBe(200);
  const result = await response.json();
  expect(result.success).toBe(false);
  expect(result.message).toMatch(/Ya existen categor[ií]as|ya existen/i);
});
