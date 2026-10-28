import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M17-06-6 — Administrador Organización — Reintentar timbrado', async ({ page }) => {
  const login = new LoginPage(page); const org = new OrganizationPage(page); const dashboard = new DashboardPage(page);
  await login.open(); await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) { await org.select(process.env.ATHENEA_ORGANIZATION ?? 'Athenea Demo'); await org.continue(); }
  await login.expectAuthenticated(); await dashboard.expectLoaded(); await page.goto('/OrganizationSubscription/BillingHistory');
  await expect(page.locator('body')).toContainText(/Historial|Facturaci[oó]n|Pagos|Facturas/i);
  const retry = page.getByRole('button', { name: /Reintentar|Retry|timbr/i }).first();
  await expect(retry).toBeVisible({ timeout: 15_000 });
  await retry.click();
  await expect(page.locator('body')).toContainText(/timbr|PAC|proces|factura/i, { timeout: 15_000 });
});
