import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test.describe('M00-06-7 — Super Administrador — Cerrar sesión', () => {
  test('cierra la sesión y regresa al login', async ({ page }) => {
    test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan credenciales');

    const login = new LoginPage(page);
    const organization = new OrganizationPage(page);
    const dashboard = new DashboardPage(page);

    await login.open();
    await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
    await organization.select(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe');
    await organization.continue();
    await login.expectAuthenticated();
    await dashboard.expectLoaded();
    await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => undefined);

    await page.getByRole('button', { name: /QA Admin Super Sistema/i }).click();
    await page.getByRole('link', { name: /Cerrar Sesión/i }).click();

    await expect(page).toHaveURL(/Account\/Login/i);
    await expect(page.locator('#Email')).toBeVisible();
    await expect(page.locator('#Password')).toBeVisible();
  });
});
