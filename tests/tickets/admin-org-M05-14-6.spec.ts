import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M05-14-6 — Administrador Organización — Eliminar ticket', async ({ page }) => {
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
  const subject = /TICK-00002/;
  const row = page.getByRole('row').filter({ hasText: subject }).first();
  await expect(row).toBeVisible();
  await row.click();
  await expect(page).toHaveURL(/\/Tickets\/Details\//);
  const menu = page.locator('button').filter({ has: page.locator('i.mdi-dots-vertical') }).first();
  await menu.click();
  await page.getByRole('link', { name: /Eliminar Ticket/i }).click();
  const confirm = page.locator('button.swal2-confirm:visible');
  if (await confirm.count()) await confirm.click();
  await expect(page).toHaveURL(/\/Tickets\/Index/);
  await expect(page.getByRole('row').filter({ hasText: subject })).toHaveCount(0);
});
