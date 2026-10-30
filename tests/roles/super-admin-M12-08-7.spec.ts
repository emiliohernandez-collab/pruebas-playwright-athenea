import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M12-08-7 — Super Administrador — Quitar permiso de un rol', async ({ page }) => {
  test.setTimeout(60_000);
  const login = new LoginPage(page); const org = new OrganizationPage(page); const dashboard = new DashboardPage(page);
  await login.open(); await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) { await org.select('QA Checkout Stripe'); await org.continue(); }
  await login.expectAuthenticated(); await dashboard.expectLoaded();
  const roleId = '112acb0d-6b3e-4d98-959e-1b4de5c35dff';
  const permission = page.locator('#permission-Organization-View');
  await page.goto(`/Permissions/ManageRole?roleId=${roleId}`);
  if (!(await permission.isChecked())) await permission.check();
  await page.getByRole('button', { name: /Guardar cambios/i }).first().click();
  await page.waitForTimeout(700); await page.reload();
  await expect(permission).toBeChecked();
  await permission.uncheck();
  await page.getByRole('button', { name: /Guardar cambios/i }).first().click();
  await page.waitForTimeout(700); await page.reload();
  await expect(permission).not.toBeChecked();
});
