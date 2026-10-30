import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M05-20-7 — Super Administrador — Eliminar adjunto de ticket', async ({ page }) => {
  test.setTimeout(60_000);
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
  const subject = `QA M05-20 eliminar adjunto ${Date.now()}`;
  await page.getByLabel(/Asunto/i).fill(subject);
  await page.locator('[contenteditable="true"]').first().fill('Ticket creado para validar eliminación de adjuntos.');
  await page.getByRole('combobox', { name: /Categoria/i }).selectOption({ index: 1 });
  await page.getByRole('button', { name: /Crear Ticket/i }).last().click();
  await expect(page).toHaveURL(/\/Tickets\/Details\//);
  await expect(page.locator('body')).toContainText(subject);
  const filename = 'qa-ticket-attachment-m05-20.txt';
  const fileInput = page.locator('input[type="file"]').first();
  await expect(fileInput).toBeAttached({ timeout: 10_000 });
  await fileInput.setInputFiles({ name: filename, mimeType: 'text/plain', buffer: Buffer.from('QA attachment M05-20-7') });
  const attachmentsTab = page.getByRole('tab', { name: /Adjuntos/i }).first();
  await attachmentsTab.click();
  await expect(page.locator('body')).toContainText(filename, { timeout: 20_000 });
  const attachment = page.getByText(filename, { exact: true }).first();
  const container = attachment.locator('xpath=ancestor::div[contains(@class,"attachment-card")]').first();
  const remove = container.locator('button[title="Eliminar"]').first();
  await expect(remove).toBeVisible();
  await remove.click();
  const confirm = page.getByRole('button', { name: /Eliminar|Confirmar|Sí/i }).last();
  if (await confirm.isVisible().catch(() => false)) await confirm.click();
  await page.reload();
  await page.getByRole('tab', { name: /Adjuntos/i }).first().click();
  await expect(page.locator('.attachment-card').filter({ hasText: filename })).toHaveCount(0);
  await expect(page.getByRole('tabpanel')).toContainText(/No hay archivos adjuntos/i);
});
