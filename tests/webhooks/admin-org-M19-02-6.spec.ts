import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M19-02-6 — Administrador Organización — Crear webhook', async ({ page }) => {
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
  await expect(page.locator('body')).toContainText(/webhook|integración/i);
  const create = page.locator('#btnNewWebhook');
  await expect(create).toBeVisible();
  await create.click();
  await expect(page.locator('body')).toContainText(/webhook|integración/i);
  const name = `QA M19-02 ${Date.now()}`;
  const textboxes = page.getByRole('textbox');
  await textboxes.first().fill(name);
  if (await textboxes.nth(1).count()) await textboxes.nth(1).fill('https://httpbin.org/post');
  await page.getByRole('button', { name: /Probar/i }).click();
  await expect(page.locator('body')).toContainText(/éxito|exitos|válida|validada|correct/i, { timeout: 20_000 });
  const save = page.getByRole('button', { name: /Guardar/i }).last();
  await expect(save).toBeVisible();
  await save.click();
  await expect(page).toHaveURL(/OrganizationIntegrations/i, { timeout: 20_000 });
  await expect(page.locator('body')).toContainText(name, { timeout: 20_000 });
});
