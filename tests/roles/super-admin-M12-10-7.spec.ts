import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M12-10-7 — Super Administrador — Guardar matriz de permisos', async ({ page }) => {
  test.setTimeout(60_000);
  const login = new LoginPage(page); const org = new OrganizationPage(page); const dashboard = new DashboardPage(page);
  await login.open(); await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) { await org.select('QA Checkout Stripe'); await org.continue(); }
  await login.expectAuthenticated(); await dashboard.expectLoaded();
  await page.goto('/Permissions');
  const permission = page.locator('input.js-perm[data-role-id="1638b94a-90a8-48c3-803e-90a648289c09"][data-permission="Organization.View"]');
  await expect(permission).toHaveCount(1);
  const initial = await permission.isChecked();
  await permission.setChecked(!initial);
  await page.getByRole('button', { name: /Guardar cambios/i }).first().click();
  await expect(page).toHaveURL(/\/Permissions$/, { timeout: 15_000 });
  await page.goto('/Permissions');
  await expect(permission).toBeChecked({ checked: !initial });
  await permission.setChecked(initial);
  await page.getByRole('button', { name: /Guardar cambios/i }).first().click();
  await expect(page).toHaveURL(/\/Permissions$/, { timeout: 15_000 });
  await page.goto('/Permissions');
  await expect(permission).toBeChecked({ checked: initial });
});
