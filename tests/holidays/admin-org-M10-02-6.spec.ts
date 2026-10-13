import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M10-02-6 — Administrador Organización — Configurar días festivos', async ({ page }) => {
  test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan credenciales');
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
  await page.goto('/Holidays');
  const config = page.locator('select').first();
  await expect(config).toBeVisible();
  const option = await config.locator('option').nth(1).getAttribute('value');
  if (option) await config.selectOption(option);
  const toggle = page.locator('input[type="checkbox"]').first();
  if (await toggle.isChecked()) await toggle.uncheck(); else await toggle.check();
  await page.getByRole('button', { name: /Guardar/i }).first().click();
  await page.reload();
  await expect(page.locator('body')).toContainText(/configuración|festivos|reglas/i);
  await expect(config).toHaveValue(option ?? '');
});
