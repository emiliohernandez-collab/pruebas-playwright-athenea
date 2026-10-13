import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M17-02-6 — Administrador Organización — Editar perfil de facturación', async ({ page }) => {
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
  await page.goto('/BillingProfile/Edit');
  await expect(page.locator('body')).toContainText(/Perfil de facturaci[oó]n|RFC|Raz[oó]n social/i);
  const inputs = page.locator('input:visible');
  await expect(inputs.first()).toBeVisible();
  await page.getByRole('button', { name: /Guardar|Actualizar|Save/i }).last().click();
  await expect(page.locator('body')).toContainText(/guardad|actualiz|correct/i);
  await page.reload();
  await expect(page.locator('body')).toContainText(/Perfil de facturaci[oó]n|RFC/i);
});
