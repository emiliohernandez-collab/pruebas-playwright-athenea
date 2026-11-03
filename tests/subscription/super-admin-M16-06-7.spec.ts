import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test.use({ ignoreHTTPSErrors: true });
test.use({ storageState: 'auth/qa-checkout-stripe.json' });

test('M16-06-7 — Super Administrador — Crear suscripción', async ({ page }) => {
  const login = new LoginPage(page);
  const org = new OrganizationPage(page);
  const dashboard = new DashboardPage(page);

  await page.goto('/Subscriptions/Dashboard');
  if (/Account\/Login/i.test(page.url())) {
    await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
    if (/SelectOrganizationAtLogin/i.test(page.url())) {
      await org.select(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe');
      await org.continue();
    }
  }
  await login.expectAuthenticated();
  await dashboard.expectLoaded();
  await page.goto('/Subscriptions/Create');

  const stamp = Date.now();
  await page.locator('input[name="Email"]').fill(`qa.m16.06.${stamp}@example.com`);
  await page.locator('input[name="FirstName"]').fill('QA');
  await page.locator('input[name="LastName"]').fill('M16-06');
  await page.locator('input[name="OrganizationName"]').fill(`QA M16-06 ${stamp}`);
  await page.getByRole('button', { name: /^Starter\s*5 usuarios/i }).click();
  await page.locator('button[type="submit"]').filter({ hasText: 'Crear usuario y suscripcion' }).click();

  await expect(page).toHaveURL(/\/Subscriptions\/Details\//);
  await expect(page.locator('body')).toContainText(/Usuario .* creado exitosamente/i);
  await expect(page.locator('body')).toContainText(/Detalle de suscripción/i);
  await expect(page.locator('body')).toContainText(/Prueba/);
});
