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
  const select = page.getByRole('button', { name: /^Seleccionar$/i }).first();
  await expect(select).toBeVisible();
  await select.click();
  await expect(page.locator('body')).toContainText(/Stripe|pago|tarjeta|checkout/i, { timeout: 15_000 });
  console.log('CHECKOUT_URL', page.url());
  await page.getByPlaceholder('1234 1234 1234 1234').fill('4242424242424242');
  await page.getByPlaceholder('MM / YY').fill('12/34');
  await page.getByPlaceholder('CVC').fill('123');
  await page.getByPlaceholder('Full name on card').fill('QA Automation Test');
  await page.getByRole('button', { name: /Subscribe|Suscribirse/i }).click();
  await expect(page.locator('body')).toContainText(/success|successful|suscripci[oó]n|Professional|Gracias|completed/i, { timeout: 20_000 });
  await page.waitForTimeout(10_000);
  await page.goto('/OrganizationSubscription/ViewPlan');
  await expect(page.locator('body')).toContainText(/Professional/i, { timeout: 20_000 });
  await page.screenshot({ path: 'test-results/m16-07-upgrade-plan.png', fullPage: true });
});
