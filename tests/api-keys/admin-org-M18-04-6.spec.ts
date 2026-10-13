import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M18-04-6 — Administrador Organización — Editar llave API', async ({ page }) => {
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
  await page.goto('/ApiKeys');
  await expect(page.locator('body')).toContainText(/Llaves|Claves|API/i);
  const row = page.locator('tr').filter({ hasText: /QA M18-03/ }).first();
  await expect(row).toBeVisible();
  const edit = row.getByRole('link', { name: 'Editar' });
  await expect(edit).toBeVisible();
  await edit.click();
  const name = `QA M18-04 edit ${Date.now()}`;
  const input = page.getByRole('textbox').first();
  await input.fill(name);
  await page.getByRole('button', { name: /Guardar|Actualizar|Save/i }).last().click();
  await expect(page).toHaveURL(/ApiKeys/i, { timeout: 20_000 });
  await expect(page.locator('body')).toContainText(name, { timeout: 20_000 });
});
