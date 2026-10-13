import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M20-06-6 — Administrador Organización — Editar configuración y restaurar', async ({ page }) => {
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
  await page.goto('/OrganizationSettings');
  await page.getByRole('button', { name: /Editar/i }).click();
  const name = page.getByRole('textbox').first();
  const original = await name.inputValue();
  const probe = `${original} QA`;
  await name.fill(probe);
  await page.getByRole('button', { name: /Guardar|Actualizar/i }).last().click();
  await expect(page.locator('body')).toContainText(probe, { timeout: 20_000 });
  await page.getByRole('button', { name: /Editar/i }).click();
  await page.getByRole('textbox').first().fill(original);
  await page.getByRole('button', { name: /Guardar|Actualizar/i }).last().click();
  await expect(page.locator('body')).toContainText(original, { timeout: 20_000 });
});
