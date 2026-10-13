import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M13-09-6 — Administrador Organización — Enviar notificación desde plantilla', async ({ page }) => {
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
  const template = page.locator('select:visible').filter({ has: page.locator('option') }).first();
  await expect(template).toBeVisible();
  const options = await template.locator('option').evaluateAll(opts => opts.map(o => ({ value: (o as HTMLOptionElement).value, text: o.textContent || '' })).filter(o => o.value));
  expect(options.length).toBeGreaterThan(0);
  await template.selectOption(options[0].value);
  const send = page.getByRole('button', { name: /Enviar|Send/i }).last();
  await expect(send).toBeVisible();
  await send.click();
  await expect(page.locator('body')).toContainText(/enviad|cola|programad|Notificaci[oó]n/i);
});
