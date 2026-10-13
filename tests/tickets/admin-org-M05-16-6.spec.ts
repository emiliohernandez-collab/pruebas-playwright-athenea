import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M05-16-6 — Administrador Organización — Tomar ticket', async ({ page }) => {
  test.setTimeout(40_000);
  const login = new LoginPage(page);
  const org = new OrganizationPage(page);
  const dashboard = new DashboardPage(page);
  const setupUser = process.env.ATHENEA_SETUP_USER;
  const setupPassword = process.env.ATHENEA_SETUP_PASSWORD;
  await login.open();
  await login.signIn(setupUser ?? process.env.ATHENEA_USER!, setupPassword ?? process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) {
    await org.select(process.env.ATHENEA_ORGANIZATION ?? 'Athenea Demo');
    await org.continue();
  }
  await login.expectAuthenticated();
  await dashboard.expectLoaded();
  await page.goto('/Tickets/Create');
  const subject = `QA M05-16 ${Date.now()}`;
  await page.getByLabel(/Asunto/i).fill(subject);
  await page.locator('[contenteditable="true"]').first().fill('Ticket QA sin asignar para validar Tomar ticket.');
  await page.getByRole('combobox', { name: /Categoria/i }).selectOption({ index: 1 });
  await page.getByRole('button', { name: /Crear Ticket/i }).last().click();
  await expect(page).toHaveURL(/\/Tickets\/Details\//);
  await expect(page.locator('body')).toContainText(subject);
  const ticketUrl = page.url();
  if (setupUser) {
    await login.open();
    await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
    if (/SelectOrganizationAtLogin/i.test(page.url())) {
      await org.select(process.env.ATHENEA_ORGANIZATION ?? 'Athenea Demo');
      await org.continue();
    }
    await login.expectAuthenticated();
    await dashboard.expectLoaded();
    await page.goto(ticketUrl);
  }
  const assignee = page.getByRole('combobox').filter({ has: page.locator('option') }).last();
  if (await assignee.locator('option', { hasText: 'Sin asignar' }).count()) {
    await assignee.selectOption({ label: 'Sin asignar' });
  }
  const take = page.locator('button').filter({ hasText: /Tomar/i }).first();
  await expect(take).toBeVisible();
  await take.click();
  await expect(page.locator('body')).toContainText(/Demo Administrador Org|asignado/i, { timeout: 15_000 });
});
