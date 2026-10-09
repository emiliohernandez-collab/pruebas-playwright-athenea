import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';
import { OrganizationSwitcherPage } from '../pages/OrganizationSwitcherPage';

test.describe('M00-02-7 — Super Administrador — Cambiar de organización', () => {
  test('cambia a otra organización desde el selector superior', async ({ page }) => {
    test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan credenciales');

    const login = new LoginPage(page);
    const organizationAtLogin = new OrganizationPage(page);
    const switcher = new OrganizationSwitcherPage(page);
    const dashboard = new DashboardPage(page);

    await login.open();
    await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
    await organizationAtLogin.select(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe');
    await organizationAtLogin.continue();
    await login.expectAuthenticated();
    await dashboard.expectLoaded();
    await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => undefined);
    await page.waitForTimeout(500);

    await switcher.open();
    await switcher.switchTo(process.env.ATHENEA_OTHER_ORGANIZATION ?? 'Ribbit');
    await expect(page).toHaveURL(/Dashboard/i);
    await dashboard.expectLoaded();
  });
});
