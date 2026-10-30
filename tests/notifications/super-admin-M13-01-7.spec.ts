import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M13-01-7 — Super Administrador — Consultar notificaciones', async ({ page }) => {
  test.setTimeout(60_000);
  const login = new LoginPage(page); const org = new OrganizationPage(page); const dashboard = new DashboardPage(page);
  await login.open(); await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) { await org.select('QA Checkout Stripe'); await org.continue(); }
  await login.expectAuthenticated(); await dashboard.expectLoaded();
  await page.locator('li.notification-list > a.nav-link').click();
  await expect(page.locator('#notification-dropdown-items')).toBeVisible();
  await page.getByRole('link', { name: /Ver todas las notificaciones/i }).click();
  await expect(page).toHaveURL(/\/NotificationCenter\/Index/);
  await expect(page.locator('body')).toContainText(/Notificaciones|notification/i);
});
