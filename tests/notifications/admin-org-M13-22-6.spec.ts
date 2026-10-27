import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M13-22-6 — Administrador Organización — Actualizar notificación propia', async ({ page }) => {
  test.setTimeout(45_000);
  test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan credenciales');
  const login = new LoginPage(page);
  const org = new OrganizationPage(page);
  const dashboard = new DashboardPage(page);
  await login.open();
  await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) {
    const expected = page.getByText(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe', { exact: true });
    if (await expected.count()) await expected.click();
    else await page.getByText('Athenea Demo.', { exact: true }).click();
    await org.continue();
  }
  await login.expectAuthenticated();
  await dashboard.expectLoaded();
  await page.goto('/NotificationCenter');
  await expect(page.locator('body')).toContainText(/Notificaciones|notification/i);
  const menuButtons = page.locator('button.dropdown-toggle').filter({ has: page.locator('i.mdi-dots-horizontal') }).first();
  await expect(menuButtons).toBeVisible({ timeout: 20_000 });
  await menuButtons.click();
  const stateAction = page.locator('.dropdown-menu.show a.mark-read-btn').first();
  await expect(stateAction).toBeVisible();
  await stateAction.click();
  await page.reload();
  await expect(page.locator('body')).toContainText(/Centro de Notificaciones|Notificaciones/i);
});
