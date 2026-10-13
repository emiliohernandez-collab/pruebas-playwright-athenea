import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M05-15-6 — Administrador Organización — Escalar ticket', async ({ page }) => {
  test.setTimeout(30_000);
  const login = new LoginPage(page);
  const org = new OrganizationPage(page);
  const dashboard = new DashboardPage(page);
  await login.open();
  await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) {
    await org.select(process.env.ATHENEA_ORGANIZATION ?? 'Athenea Demo');
    await org.continue();
  }
  await login.expectAuthenticated();
  await dashboard.expectLoaded();
  await page.goto('/Tickets/Index');
  const ticket = page.getByRole('row').filter({ hasText: /QA M05-12/ }).last();
  await expect(ticket).toBeVisible();
  await ticket.click();
  await expect(page).toHaveURL(/\/Tickets\/Details\//);
  await expect(page.locator('body')).toContainText(/QA M05-12|Ticket/i, { timeout: 20_000 });
  await page.waitForTimeout(1000);
  await page.locator('button').filter({ hasText: /^\s*Escalar\s*$/i }).click();
  const modal = page.locator('.modal.show').last();
  const modalSelect = modal.locator('select').first();
  await expect(modalSelect).toBeVisible();
  const target = modalSelect.locator('option').nth(1);
  await modalSelect.selectOption(await target.getAttribute('value') as string);
  const reason = modal.locator('textarea').first();
  if (await reason.count()) await reason.fill('Escalación QA M05-15-6');
  await page.getByRole('button', { name: /Escalar ticket/i }).last().click();
  await expect(page.locator('body')).toContainText(/escalad|historial/i, { timeout: 15_000 });
  await page.reload();
  await expect(page.locator('body')).toContainText(/Escalación QA M05-15-6|escalad/i, { timeout: 15_000 });
});
