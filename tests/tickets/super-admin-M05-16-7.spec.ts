import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M05-16-7 — Super Administrador — Tomar ticket', async ({ page }) => {
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
  const subject = `QA M05-16 tomar ${Date.now()}`;
  await page.goto('/Tickets/Create');
  await expect(page.locator('body')).toContainText(/Crear Ticket/i);
  await page.getByLabel(/Asunto/i).fill(subject);
  await page.locator('[contenteditable="true"]').first().fill('Ticket sin asignar para validar tomar ticket.');
  await page.getByRole('combobox', { name: /Categoria/i }).selectOption({ index: 1 });
  await page.getByRole('button', { name: /Crear Ticket/i }).last().click();
  await expect(page).toHaveURL(/\/Tickets\/Details\//);
  await expect(page.locator('body')).toContainText(subject);
  const assignee = page.getByRole('combobox').filter({ has: page.locator('option') }).last();
  await expect(assignee).toBeVisible();
  await assignee.selectOption({ label: 'QA Admin Super Sistema' });
  await page.waitForTimeout(700);
  await expect(assignee).not.toHaveValue(/^(|null)$/i);
  await page.reload();
  await expect(page.getByRole('combobox').filter({ has: page.locator('option') }).last()).not.toHaveValue(/^(|null)$/i);
});
