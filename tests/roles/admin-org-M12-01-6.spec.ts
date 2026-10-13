import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M12-01-6 — Administrador Organización — Acceso denegado a roles', async ({ page }) => {
  test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan credenciales');
  const login = new LoginPage(page);
  const org = new OrganizationPage(page);
  const dashboard = new DashboardPage(page);
  await login.open();
  await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) {
    const expectedOrg = process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe';
    const expected = page.getByText(expectedOrg, { exact: true });
    if (await expected.count()) {
      await expected.click();
    } else {
      // Esta cuenta presenta Athenea Demo. en lugar de QA Checkout Stripe.
      await page.getByText('Athenea Demo.', { exact: true }).click();
    }
    await org.continue();
  }
  await login.expectAuthenticated();
  await dashboard.expectLoaded();
  await page.goto('/Roles');
  await expect(page.locator('body')).toContainText(/Sin permiso|Acceso denegado|Acceso Restringido|No autorizado|403/i);
});
