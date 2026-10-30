import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M05-19-7 — Super Administrador — Adjuntar archivo a ticket', async ({ page }) => {
  test.setTimeout(45_000);
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
  await page.goto('/Tickets/Create');
  await expect(page.locator('body')).toContainText(/Crear Ticket/i);
  const subject = `QA M05-19 adjunto ${Date.now()}`;
  await page.getByLabel(/Asunto/i).fill(subject);
  await page.locator('[contenteditable="true"]').first().fill('Ticket creado para validar adjuntos de Super Administrador.');
  await page.getByRole('combobox', { name: /Categoria/i }).selectOption({ index: 1 });
  await page.getByRole('button', { name: /Crear Ticket/i }).last().click();
  await expect(page).toHaveURL(/\/Tickets\/Details\//);
  await expect(page.locator('body')).toContainText(subject);
  const filename = 'qa-ticket-attachment-m05-19.txt';
  const fileInput = page.locator('input[type="file"]').first();
  await expect(fileInput).toBeAttached({ timeout: 10_000 });
  await fileInput.setInputFiles({ name: filename, mimeType: 'text/plain', buffer: Buffer.from('QA attachment M05-19-7') });
  const attachmentsTab = page.getByRole('tab', { name: /Adjuntos/i }).first();
  await expect(attachmentsTab).toBeVisible();
  await attachmentsTab.click();
  await expect(page.locator('body')).toContainText(filename, { timeout: 20_000 });
});
