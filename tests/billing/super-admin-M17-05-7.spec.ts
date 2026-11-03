import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test.use({ ignoreHTTPSErrors: true });

test('M17-05-7 — Super Administrador — Cancelar factura CFDI', async ({ page }) => {
  test.skip(true, 'Bloqueado: /Invoices/Cancel devuelve 302, pero el CFDI permanece Timbrado; falta corrección del backend/PAC.');
  const login = new LoginPage(page);
  const org = new OrganizationPage(page);
  const dashboard = new DashboardPage(page);
  const responses: string[] = [];
  page.on('response', response => {
    if (/Invoice|Factura|Cancel/i.test(response.url())) responses.push(`${response.status()} ${response.url()}`);
  });

  await page.goto('/Subscriptions/Dashboard');
  if (/Account\/Login/i.test(page.url())) {
    await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
    if (/SelectOrganizationAtLogin/i.test(page.url())) {
      await org.select(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe');
      await org.continue();
    }
  }
  await login.expectAuthenticated();
  await dashboard.expectLoaded();
  await page.goto('/Invoices/Details/2679fead-18ca-4f34-8a85-e15d68bebe70');
  await page.getByRole('button', { name: /Cancelar factura/i }).click();
  await page.locator('select[name="motivo"]').selectOption({ label: 'Comprobante emitido con errores sin relación' });
  await page.locator('button').filter({ hasText: 'Cancelar factura' }).last().click();
  await page.waitForTimeout(2500);
  console.log(`CFDI_RESPONSES ${responses.join(' | ')}`);
  await page.reload();
  await expect(page.locator('body')).toContainText(/Estado:\s*Cancelada/i);
});
