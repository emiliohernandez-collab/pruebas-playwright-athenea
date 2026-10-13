import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M07-03-6 — Administrador Organización — Probar conexión del buzón', async ({ page }) => {
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
  await form.locator('#ImapHost').fill('imap.gmail.com');
  await form.locator('#ImapPort').fill('993');
  await form.locator('#Email').fill('qa-email-to-ticket@gmail.com');
  await form.locator('#UseSsl').check();
  await form.locator('#Password').fill('QA-Only-Password-2026');
  await form.locator('#btnTestConnection').click();
  await expect(page.locator('body')).toContainText(/conexión|conect|error|éxito|servidor/i);
  await expect(page.locator('body')).not.toContainText(/red interna|IP interna|dirección.*interna/i);
});
