import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M12-01-7 — Super Administrador — Consultar roles y permisos', async ({ page }) => {
  test.setTimeout(60_000);
  const login = new LoginPage(page); const org = new OrganizationPage(page); const dashboard = new DashboardPage(page);
  await login.open(); await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) { await org.select('QA Checkout Stripe'); await org.continue(); }
  await login.expectAuthenticated(); await dashboard.expectLoaded();
  await page.goto('/Roles');
  await expect(page).toHaveURL(/\/Roles/);
  await expect(page.locator('body')).toContainText(/Roles del sistema|Lista de roles/i);
  await expect(page.locator('table thead')).toContainText('Nombre del rol');
  await expect(page.locator('table thead')).toContainText('Cantidad de usuarios');
  const rows = page.locator('table tbody tr');
  await expect(rows.first()).toBeVisible();
  await expect(rows.first()).toContainText(/Usuarios/i);
});
