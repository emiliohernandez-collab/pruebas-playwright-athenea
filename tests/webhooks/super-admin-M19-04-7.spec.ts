import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M19-04-7 — Super Administrador — Eliminar webhook', async ({ page }) => {
  const login = new LoginPage(page);
  const org = new OrganizationPage(page);
  const dashboard = new DashboardPage(page);
  page.on('dialog', dialog => dialog.accept());

  await login.open();
  await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) {
    await org.select(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe');
    await org.continue();
  }
  await login.expectAuthenticated();
  await dashboard.expectLoaded();

  await page.goto('/OrganizationIntegrations/Index');
  await page.locator('#btnNewWebhook').click();
  const name = `QA M19-04-7 ${Date.now()}`;
  await page.locator('#whName').fill(name);
  await page.locator('#whUrl').fill('https://httpbin.org/post');
  await page.locator('#ev-TaskCreated').check();
  await page.getByRole('button', { name: /Probar/ }).click();
  await expect(page.locator('body')).toContainText(/destino respondió correctamente \(200\)/i, { timeout: 20_000 });
  await page.getByRole('button', { name: /Guardar/ }).click();
  await expect(page.locator('body')).toContainText(name, { timeout: 20_000 });

  const row = page.locator('tr').filter({ hasText: name });
  await row.locator('button.js-del').click();
  await expect(page.locator('body')).not.toContainText(name, { timeout: 20_000 });
});
