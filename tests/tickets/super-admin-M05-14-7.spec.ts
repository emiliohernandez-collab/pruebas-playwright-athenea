import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M05-14-7 — Super Administrador — Eliminar ticket', async ({ page }) => {
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
  const subject = `QA M05-14 eliminar ${Date.now()}`;
  await page.goto('/Tickets/Create');
  await expect(page.locator('body')).toContainText(/Crear Ticket/i);
  await page.getByLabel(/Asunto/i).fill(subject);
  await page.locator('[contenteditable="true"]').first().fill('Ticket temporal para validar eliminación.');
  await page.getByRole('combobox', { name: /Categoria/i }).selectOption({ index: 1 });
  await page.getByRole('button', { name: /Crear Ticket/i }).last().click();
  await expect(page).toHaveURL(/\/Tickets\/Details\//);
  await expect(page.locator('body')).toContainText(subject);
  const menu = page.locator('button').filter({ has: page.locator('i.mdi-dots-vertical') }).first();
  await menu.click();
  await page.getByRole('link', { name: /Eliminar Ticket/i }).click();
  const confirm = page.locator('button.swal2-confirm:visible');
  if (await confirm.count()) await confirm.click();
  await expect(page).toHaveURL(/\/Tickets\/Index/);
  await expect(page.getByRole('row').filter({ hasText: subject })).toHaveCount(0);
});
