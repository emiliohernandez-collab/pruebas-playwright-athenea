import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M05-17-7 — Super Administrador — Liberar ticket', async ({ page }) => {
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
  const subject = `QA M05-17 liberar ${Date.now()}`;
  await page.goto('/Tickets/Create');
  await expect(page.locator('body')).toContainText(/Crear Ticket/i);
  await page.getByLabel(/Asunto/i).fill(subject);
  await page.locator('[contenteditable="true"]').first().fill('Ticket temporal para validar liberar ticket.');
  await page.getByRole('combobox', { name: /Categoria/i }).selectOption({ index: 1 });
  await page.getByRole('button', { name: /Crear Ticket/i }).last().click();
  await expect(page).toHaveURL(/\/Tickets\/Details\//);
  await expect(page.locator('body')).toContainText(subject);
  const assignee = page.getByRole('combobox').filter({ has: page.locator('option') }).last();
  const options = await assignee.locator('option').allTextContents();
  const other = options.find(label => !/Sin asignar|QA Admin Super Sistema/i.test(label.trim()));
  if (!other) throw new Error('No hay otro usuario QA disponible para validar liberar ticket');
  await assignee.selectOption({ label: other.trim() });
  await page.waitForTimeout(700);
  const status = page.getByRole('combobox').filter({ has: page.locator('option') }).first();
  await status.selectOption({ label: 'En Progreso' });
  await page.waitForTimeout(700);
  const release = page.locator('#btnReleaseTicket');
  await expect(release).toHaveCount(1);
  await release.evaluate((element: HTMLElement) => element.click());
  const confirm = page.getByRole('button', { name: /Liberar|Confirmar|Sí/i }).last();
  if (await confirm.count() && await confirm.isVisible().catch(() => false)) await confirm.click();
  await page.waitForTimeout(700);
  await page.reload();
  await expect(page.getByRole('combobox').filter({ has: page.locator('option') }).last()).toHaveValue(/^(|null)$/i);
});
