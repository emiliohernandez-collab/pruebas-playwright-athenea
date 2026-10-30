import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M07-04-7 — Super Administrador — Desactivar correo a ticket', async ({ page }) => {
  test.setTimeout(60_000);
  const login = new LoginPage(page); const org = new OrganizationPage(page); const dashboard = new DashboardPage(page);
  await login.open(); await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) { await org.select('QA Checkout Stripe'); await org.continue(); }
  await login.expectAuthenticated(); await dashboard.expectLoaded();
  await page.goto('/EmailToTicket');
  const enabled = page.locator('#Enabled');
  await expect(enabled).toBeChecked();
  await enabled.uncheck();
  await page.locator('#configForm button[type="submit"]').click();
  const confirm = page.locator('button.swal2-confirm');
  if (await confirm.count()) { await expect(confirm).toBeVisible(); await confirm.click(); }
  await page.reload();
  await expect(enabled).not.toBeChecked();
  await enabled.check();
  await page.locator('#configForm button[type="submit"]').click();
  const restoreConfirm = page.locator('button.swal2-confirm');
  if (await restoreConfirm.count()) { await expect(restoreConfirm).toBeVisible(); await restoreConfirm.click(); }
  await page.reload();
  await expect(enabled).toBeChecked();
});
