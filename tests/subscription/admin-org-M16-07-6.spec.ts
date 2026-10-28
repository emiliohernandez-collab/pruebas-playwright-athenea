import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M16-07-6 — Administrador Organización — Cambiar de plan', async ({ page }) => {
  const login = new LoginPage(page); const org = new OrganizationPage(page); const dashboard = new DashboardPage(page);
  await login.open(); await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) { await org.select(process.env.ATHENEA_ORGANIZATION ?? 'Athenea Demo'); await org.continue(); }
  await login.expectAuthenticated(); await dashboard.expectLoaded(); await page.goto('/OrganizationSubscription/UpgradePlan');
  await expect(page.locator('body')).toContainText(/plan|suscripci[oó]n|precio|Stripe|tarjeta/i);
  await page.screenshot({ path: 'test-results/m16-07-upgrade-plan.png', fullPage: true });
});
