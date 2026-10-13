import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M05-18-6 — Administrador Organización — Comentar ticket', async ({ page }) => {
  test.setTimeout(40_000);
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
  await page.goto('/Tickets/Index');
  const row = page.getByRole('row').filter({ hasText: /TICK-00005/ }).first();
  await expect(row).toBeVisible({ timeout: 15000 });
  await row.click();
  await expect(page).toHaveURL(/\/Tickets\/Details\//);

  const marker = `QA Admin Org comentario ${Date.now()}`;
  const editor = page.locator('textarea').first();
  await expect(editor).toBeVisible({ timeout: 10000 });
  await editor.fill(marker);

  const send = page.getByRole('button', { name: /Enviar/i }).first();
  await expect(send).toBeVisible();
  await send.click();

  await expect(page.locator('body')).toContainText(marker, { timeout: 15000 });
});
