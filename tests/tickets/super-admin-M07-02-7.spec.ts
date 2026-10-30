import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M07-02-7 — Super Administrador — Configurar buzón de correo a ticket', async ({ page }) => {
  test.setTimeout(60_000);
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
  await page.goto('/EmailToTicket');
  const form = page.locator('form').filter({ has: page.locator('#ImapHost') }).first();
  await expect(form).toBeVisible();
  await form.locator('#Enabled').check();
  await expect(form.locator('#ImapHost')).toHaveValue(/.+/);
  await expect(form.locator('#ImapPort')).toHaveValue('993');
  await expect(form.locator('#Email')).toHaveValue(/.+@.+/);
  await expect(form.locator('#UseSsl')).toBeChecked();
  await form.getByRole('button', { name: /Guardar/i }).click();
  await page.reload();
  const reloaded = page.locator('form').filter({ has: page.locator('#ImapHost') }).first();
  await expect(reloaded.locator('#Enabled')).toBeChecked();
  await expect(reloaded.locator('#ImapHost')).toHaveValue(/.+/);
  await expect(reloaded.locator('#ImapPort')).toHaveValue('993');
  await expect(reloaded.locator('#Email')).toHaveValue(/.+@.+/);
  await expect(reloaded.locator('#UseSsl')).toBeChecked();
});
