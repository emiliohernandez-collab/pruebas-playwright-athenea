import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M05-18-7 — Super Administrador — Comentar ticket', async ({ page }) => {
  test.setTimeout(40_000);
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
  await page.goto('/Tickets/Index');
  const row = page.getByRole('row').filter({ hasText: /QA M05-12/ }).last();
  await expect(row).toBeVisible({ timeout: 15_000 });
  await row.click();
  await expect(page).toHaveURL(/\/Tickets\/Details\//);
  const marker = `QA Super Admin comentario ${Date.now()}`;
  const editor = page.locator('textarea').first();
  await expect(editor).toBeVisible({ timeout: 10_000 });
  await editor.fill(marker);
  const send = page.getByRole('button', { name: /Enviar/i }).first();
  await expect(send).toBeVisible();
  await send.click();
  await expect(page.locator('body')).toContainText(marker, { timeout: 15_000 });
});
