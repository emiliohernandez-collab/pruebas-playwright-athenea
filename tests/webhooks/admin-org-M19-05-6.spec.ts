import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M19-05-6 — Administrador Organización — Probar webhook', async ({ page }) => {
  const login = new LoginPage(page); const org = new OrganizationPage(page); const dashboard = new DashboardPage(page);
  await login.open(); await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) { await org.select(process.env.ATHENEA_ORGANIZATION ?? 'Athenea Demo'); await org.continue(); }
  await login.expectAuthenticated(); await dashboard.expectLoaded(); await page.goto('/OrganizationIntegrations');
  await page.locator('#btnNewWebhook').click();
  const name = `QA M19-05 ${Date.now()}`;
  const textboxes = page.getByRole('textbox'); await textboxes.first().fill(name); await textboxes.nth(1).fill('https://httpbin.org/post');
  await page.getByRole('button', { name: /Probar/i }).click();
  await expect(page.locator('body')).toContainText(/éxito|exitos|válida|validada|correct/i, { timeout: 20_000 });
  await page.getByRole('button', { name: /Guardar/i }).last().click();
  await expect(page.locator('body')).toContainText(name, { timeout: 20_000 });
  const row = page.locator('tr').filter({ hasText: name }).first();
  await row.locator('button.js-edit').click();
  await expect(page.getByRole('button', { name: /Probar/i })).toBeVisible();
  await page.getByRole('button', { name: /Probar/i }).click();
  await expect(page.locator('body')).toContainText(/éxito|exitos|válida|validada|correct/i, { timeout: 20_000 });
});
