import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test.use({ ignoreHTTPSErrors: true });

test('M16-08-7 — Super Administrador — Cancelar suscripción', async ({ page }) => {
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
  await page.locator('input[name="Email"]').fill(`qa.m16.08.${stamp}@example.com`);
  await page.locator('input[name="FirstName"]').fill('QA');
  await page.locator('input[name="LastName"]').fill('M16-08');
  await page.locator('input[name="OrganizationName"]').fill(`QA M16-08 ${stamp}`);
  await page.getByRole('button', { name: /^Starter\s*5 usuarios/i }).click();
  await page.locator('button[type="submit"]').filter({ hasText: 'Crear usuario y suscripcion' }).click();
  await expect(page).toHaveURL(/\/Subscriptions\/Details\//);

  await page.locator('button').filter({ hasText: 'Cancelar suscripción' }).click();
  await page.getByRole('button', { name: /Sí, Cancelar/i }).click();

  await expect(page.locator('body')).toContainText(/Suscripción cancelada exitosamente/i);
  await expect(page.locator('body')).toContainText(/Cancelada, activa hasta/i);
  await expect(page.getByRole('button', { name: /Reactivar suscripción/i })).toBeVisible();
});
