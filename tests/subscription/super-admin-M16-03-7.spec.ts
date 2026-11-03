import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test.use({ ignoreHTTPSErrors: true });

test('M16-03-7 — Super Administrador — Editar precio/límites de un plan', async ({ page }) => {
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
  await page.goto('/AdminPlans');
  const limit = page.locator('#maxUsers-0');
  const original = await limit.inputValue();
  await limit.fill(String(Number(original) + 1));
  await page.locator('button').filter({ hasText: 'Guardar Cambios' }).first().click();
  await expect(page.locator('body')).toContainText(/Guardado|actualizado correctamente/i);
  await limit.fill(original);
  await page.locator('button').filter({ hasText: 'Guardar Cambios' }).first().click();
  await expect(page.locator('body')).toContainText(/Guardado|actualizado correctamente/i);
});
