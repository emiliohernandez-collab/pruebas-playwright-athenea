import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M21-01-7 — Super Administrador — Consultar bitácora', async ({ page }) => {
  const login = new LoginPage(page);
  const org = new OrganizationPage(page);
  const dashboard = new DashboardPage(page);
  await login.open();
  await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) {
    const orgName = process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe';
    const radio = page.locator('label').filter({ hasText: orgName }).last();
    if (await radio.count()) await radio.click(); else await page.getByText(orgName, { exact: true }).last().click();
    await org.continue();
  }
  await login.expectAuthenticated();
  await dashboard.expectLoaded();
  await page.goto('/OrganizationAuditLogs');
  await expect(page.locator('body')).toContainText(/bitácora|auditoría|registro|audit/i);
});
