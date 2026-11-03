import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test.use({ ignoreHTTPSErrors: true });

test('M16-10-7 — Super Administrador — Aprovisionar suscripción manual', async ({ page }) => {
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

  const stamp = Date.now();
  await page.goto('/Subscriptions/Create');
  await page.locator('input[name="Email"]').fill(`qa.m16.10.${stamp}@example.com`);
  await page.locator('input[name="FirstName"]').fill('QA');
  await page.locator('input[name="LastName"]').fill('M16-10');
  await page.locator('input[name="OrganizationName"]').fill(`QA M16-10 ${stamp}`);
  await page.getByRole('button', { name: /^Starter\s*5 usuarios/i }).click();
  await page.locator('select#Status').selectOption({ label: 'Activo' });
  await page.locator('button[type="submit"]').filter({ hasText: 'Crear usuario y suscripcion' }).click();

  await expect(page).toHaveURL(/\/Subscriptions\/Details\//);
  await expect(page.locator('body')).toContainText(/Usuario .* creado exitosamente/i);
  await expect(page.locator('body')).toContainText(/Activo/);
  await expect(page.locator('body')).toContainText(/Plan\s+Starter/i);
});
