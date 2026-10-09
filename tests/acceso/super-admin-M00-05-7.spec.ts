import { test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';
import { PasswordPage } from '../pages/PasswordPage';

test.describe('M00-05-7 — Super Administrador — Cambiar mi contraseña', () => {
  test('cambia la contraseña y valida el nuevo acceso', async ({ page }) => {
    test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD || !process.env.ATHENEA_NEW_PASSWORD, 'Faltan credenciales');

    const currentPassword = process.env.ATHENEA_PASSWORD!;
    const newPassword = process.env.ATHENEA_NEW_PASSWORD!;
    const login = new LoginPage(page);
    const organization = new OrganizationPage(page);
    const dashboard = new DashboardPage(page);
    const password = new PasswordPage(page);

    await login.open();
    await login.signIn(process.env.ATHENEA_USER!, currentPassword);
    await organization.select(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe');
    await organization.continue();
    await login.expectAuthenticated();
    await dashboard.expectLoaded();
    await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => undefined);

    await page.getByRole('button', { name: /QA Admin Super Sistema/i }).click();
    await page.getByRole('link', { name: /Mi Cuenta/i }).click();
    await password.openDialog();
    await password.change(currentPassword, newPassword);

    await page.getByRole('button', { name: /QA Admin Super Sistema/i }).click();
    await page.getByRole('link', { name: /Cerrar Sesión/i }).click();
    await login.signIn(process.env.ATHENEA_USER!, newPassword);
    await organization.select(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe');
    await organization.continue();
    await login.expectAuthenticated();
  });
});
