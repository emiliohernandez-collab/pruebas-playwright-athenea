import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M05-17-6 — Administrador Organización — Liberar ticket', async ({ page }) => {
  test.setTimeout(30_000);
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
  const ticket = page.getByRole('row').filter({ hasText: /TICK-00005/ }).first();
  await expect(ticket).toBeVisible();
  await ticket.click();
  await expect(page).toHaveURL(/\/Tickets\/Details\//);
  const release = page.locator('button').filter({ hasText: /Liberar/i }).first();
  await expect(release).toBeVisible();
  await release.click();
  const confirm = page.getByRole('button', { name: /Liberar|Confirmar|Sí/i }).last();
  if (await confirm.count() && await confirm.isVisible().catch(() => false)) await confirm.click();
  await expect(page.locator('body')).toContainText(/Sin asignar|liberad/i, { timeout: 15_000 });
});
