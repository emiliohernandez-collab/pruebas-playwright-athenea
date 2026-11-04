import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M20-01-7 — Super Administrador — Consultar configuración de organización', async ({ page }) => {
  const login = new LoginPage(page);
  const org = new OrganizationPage(page);
  const dashboard = new DashboardPage(page);

  await login.open();
  await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) {
    await org.select(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe');
    await org.continue();
  }
  await login.expectAuthenticated();
  await dashboard.expectLoaded();

  await page.goto('/OrganizationSettings/Index');
  await expect(page.locator('body')).toContainText('QA Checkout Stripe');
  await expect(page.locator('body')).toContainText(/Español|English/i);
  await expect(page.locator('body')).toContainText(/Identificador|Plan y suscripción/i);
  await expect(page.getByRole('button', { name: /Editar/ })).toBeVisible();
});
