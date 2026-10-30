import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M08-11-7 — Super Administrador — Vincular artículo a ticket', async ({ page }) => {
  test.setTimeout(75_000);
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
  const articleTitle = `QA M08-11 ${Date.now()}`;
  await page.goto('/KnowledgeBase/Admin');
  await page.getByRole('button', { name: /Nuevo artículo|Agregar artículo|Crear artículo/i }).first().click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('textbox').first().fill(articleTitle);
  if (await dialog.locator('textarea').count()) await dialog.locator('textarea').first().fill('Artículo QA para vincular a ticket.');
  if (await dialog.locator('select').count()) await dialog.locator('select').first().selectOption({ index: 1 });
  await dialog.getByRole('button', { name: /Guardar|Crear/i }).click();
  const articleRow = page.locator('tr').filter({ hasText: articleTitle }).first();
  await expect(articleRow).toBeVisible();
  await articleRow.getByRole('button').nth(1).click();
  await page.waitForTimeout(500);

  await page.goto('/Tickets/Create');
  const subject = `QA M08-11 ticket ${Date.now()}`;
  await page.getByLabel(/Asunto/i).fill(subject);
  await page.locator('[contenteditable="true"]').first().fill('Ticket QA para validar artículos relacionados.');
  const category = page.getByRole('combobox', { name: /Categoria/i });
  if (await category.count() && await category.locator('option').count() > 1) await category.selectOption({ index: 1 });
  await page.getByRole('button', { name: /Crear Ticket/i }).last().click();
  await expect(page).toHaveURL(/\/Tickets\/Details\//);
  await expect(page.locator('#ticketSubject')).toContainText(subject);
  const kb = page.locator('#kbCard');
  await expect(kb).toBeVisible();
  const search = kb.getByPlaceholder(/Buscar artículos/i);
  await search.fill(articleTitle);
  const option = page.getByText(articleTitle, { exact: true }).last();
  await expect(option).toBeVisible({ timeout: 20_000 });
  await option.click();
  await expect(kb.getByRole('link', { name: articleTitle })).toBeVisible();
});
