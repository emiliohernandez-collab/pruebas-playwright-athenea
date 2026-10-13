import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M19-03-6 — Administrador Organización — Editar webhook', async ({ page }) => {
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
  await page.goto('/OrganizationIntegrations');
  const row = page.locator('tr').filter({ hasText: /QA M19-02/ }).first();
  await expect(row).toBeVisible();
  const edit = row.getByRole('button').first();
  await expect(edit).toBeVisible();
  await edit.click();
  const newName = `QA M19-03 ${Date.now()}`;
  await page.getByRole('textbox').first().fill(newName);
  await page.getByRole('button', { name: /Guardar|Actualizar/i }).last().click();
  await expect(page).toHaveURL(/OrganizationIntegrations/i, { timeout: 20_000 });
  await expect(page.locator('body')).toContainText(newName, { timeout: 20_000 });
});
