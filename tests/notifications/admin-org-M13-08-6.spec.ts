import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M13-08-6 — Administrador Organización — Enviar notificación manual', async ({ page }) => {
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
  await page.goto('/Notifications/Send');
  await expect(page.locator('body')).toContainText(/Enviar.*notific|Notificaci[oó]n/i);
  const fields = page.getByRole('textbox');
  await expect(fields.first()).toBeVisible();
  await fields.last().fill(`QA Admin Org notification ${Date.now()}`);
  const send = page.getByRole('button', { name: /Enviar|Send/i }).last();
  await expect(send).toBeVisible();
  await send.click();
  await expect(page.locator('body')).toContainText(/enviad|cola|programad|Notificaci[oó]n/i);
});
