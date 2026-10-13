import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M05-20-6 — Administrador Organización — Eliminar adjunto de ticket', async ({ page }) => {
  test.setTimeout(45_000);
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

  await page.goto('/Tickets/Details/55df4835-a49d-44bb-9caa-49e356d6a957');
  await expect(page).toHaveURL(/\/Tickets\/Details\//);
  const filename = 'qa-ticket-attachment-m05-19.txt';
  const attachmentsTab = page.getByRole('tab', { name: /Adjuntos/i }).first();
  await attachmentsTab.click();
  await expect(page.locator('body')).toContainText(filename, { timeout: 20_000 });

  const attachment = page.locator('body').getByText(filename, { exact: true }).first();
  const container = attachment.locator('xpath=ancestor::div[contains(@class,"attachment-card")]').first();
  const remove = container.locator('button[title="Eliminar"]').first();
  await expect(remove).toBeVisible();
  await remove.click();
  const confirm = page.getByRole('button', { name: /Eliminar|Confirmar|Sí/i }).last();
  if (await confirm.isVisible().catch(() => false)) await confirm.click();
  await expect(page.locator('body')).not.toContainText(filename, { timeout: 20_000 });
});
