import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M05-05-6 — Administrador Organización — Cargar categorías predeterminadas', async ({ page }) => {
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
  page.on('response', async response => {
    if (response.request().method() !== 'GET') {
      console.log(`NONGET_RESPONSE ${response.status()} ${response.request().method()} ${response.url()}`);
    }
  });
  await page.getByRole('button', { name: /Crear por defecto/i }).click();
  await page.waitForTimeout(700);
  await page.reload();
  await expect(page.locator('body')).not.toContainText(/No hay politicas SLA/i);
  await expect(page.locator('body')).toContainText(/pol[ií]ticas SLA/i);
});
