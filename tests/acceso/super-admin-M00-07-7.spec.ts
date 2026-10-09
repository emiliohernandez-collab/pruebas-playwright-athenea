import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test.describe('M00-07-7 — Super Administrador — Cambiar idioma de la interfaz', () => {
  test('cambia de español a inglés y restaura español', async ({ page }) => {
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

    await page.getByRole('button', { name: /^ES/i }).click();
    await page.getByRole('link', { name: /EN English/i }).click();
    await expect(page).toHaveURL(/Account\/MyData|Dashboard/i);
    await expect(page.getByRole('button', { name: /^EN/i })).toBeVisible();
    await expect(page.locator('body')).toContainText(/My Profile|Personal Information|Dashboard/i);

    await page.getByRole('button', { name: /^EN/i }).click();
    await page.getByRole('link', { name: /ES Español/i }).click();
    await expect(page.getByRole('button', { name: /^ES/i })).toBeVisible();
  });
});
