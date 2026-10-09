import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { MyDataPage } from '../pages/MyDataPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test.describe('M00-03-7 — Super Administrador — Editar mis datos', () => {
  test('actualiza nombre y teléfono y conserva los cambios', async ({ page }) => {
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
    const original = await myData.values();
    const testName = `QA Prueba ${Date.now()}`;
    const testPhone = '5555555555';
    const formattedTestPhone = '(55) 5555-5555';

    try {
      await myData.fill(testName, original.lastName, testPhone);
      await myData.save();
      await page.reload({ waitUntil: 'domcontentloaded' });
      await expect(page.getByPlaceholder('Nombre')).toHaveValue(testName);
      await expect(page.getByPlaceholder('(55) 1234-5678')).toHaveValue(formattedTestPhone);
    } finally {
      await myData.fill(original.firstName, original.lastName, original.phone);
      await myData.save();
    }
  });
});
