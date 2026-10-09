import path from 'node:path';
import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { MyDataPage } from '../pages/MyDataPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test.describe('M00-04-7 — Super Administrador — Cambiar mi foto de perfil', () => {
  test('sube una imagen de perfil y la muestra en Mi Cuenta', async ({ page }) => {
    test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan credenciales');

    const login = new LoginPage(page);
    const organization = new OrganizationPage(page);
    const dashboard = new DashboardPage(page);
    const myData = new MyDataPage(page);

    await login.open();
    await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
    await organization.select(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe');
    await organization.continue();
    await login.expectAuthenticated();
    await dashboard.expectLoaded();
    await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => undefined);

    await myData.openFromUserMenu();
    const previousAvatar = await myData.avatarSource();
    const fixture = path.resolve('tests/fixtures/profile-test.png');
    await myData.uploadAvatar(fixture);
    await myData.save();

    await expect.poll(() => myData.avatarSource(), { timeout: 15_000 }).not.toBe(previousAvatar);
    await expect(page.locator('#avatarPreview')).toBeVisible();
  });
});
