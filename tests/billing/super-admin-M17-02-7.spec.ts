import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test.use({ ignoreHTTPSErrors: true });

test('M17-02-7 — Super Administrador — Editar mi perfil de facturación', async ({ page }) => {
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

  const originalName = 'QA Athenea Cliente Editado';
  const testName = 'QA Athenea Cliente Editado M17-02';
  await page.goto('/BillingProfile/Edit');
  await page.locator('input[name="BillingName"]').fill(testName);
  await page.locator('button[type="submit"]').filter({ hasText: /Guardar|Actualizar|Salvar/i }).click();
  await expect(page.locator('body')).toContainText(/Datos fiscales actualizados exitosamente/i);
  await expect(page.locator('body')).toContainText(testName);

  await page.goto('/BillingProfile/Edit');
  await page.locator('input[name="BillingName"]').fill(originalName);
  await page.locator('button[type="submit"]').filter({ hasText: /Guardar|Actualizar|Salvar/i }).click();
  await expect(page.locator('body')).toContainText(/Datos fiscales actualizados exitosamente/i);
  await expect(page.locator('body')).toContainText(originalName);
});
