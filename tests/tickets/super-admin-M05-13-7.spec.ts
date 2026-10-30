import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M05-13-7 — Super Administrador — Editar ticket', async ({ page }) => {
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
  const ticket = page.getByRole('row').filter({ hasText: /QA M05-12/ }).first();
  await expect(ticket).toBeVisible();
  await ticket.click();
  await expect(page).toHaveURL(/\/Tickets\/Details\//);
  const priority = page.getByRole('combobox').nth(1);
  await priority.selectOption({ label: 'Alta' });
  await page.waitForTimeout(500);
  await expect(priority).toHaveValue(/Alta|High/i);
  await page.reload();
  await expect(page.getByRole('combobox').nth(1)).toHaveValue(/Alta|High/i);
});
