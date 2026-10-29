import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M04-05-7 — Super Administrador — Aprobar registro de tiempo', async ({ page }) => {
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
  await page.goto('/TimesheetApproval/Index');
  await expect(page.locator('body')).toContainText(/Aprobación de tiempo/i);
  const pendingRows = page.getByRole('row').filter({ hasText: 'Registro QA M04-02' });
  const pendingCount = await pendingRows.count();
  expect(pendingCount).toBeGreaterThan(0);
  const pending = pendingRows.first();
  await expect(pending).toBeVisible();
  await pending.getByRole('button').first().click();
  await page.waitForTimeout(500);
  await page.reload();
  await expect(page.getByRole('row').filter({ hasText: 'Registro QA M04-02' })).toHaveCount(pendingCount - 1);
});
