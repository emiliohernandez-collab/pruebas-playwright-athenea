import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M13-25-6 — Administrador Organización — Eliminar notificación propia', async ({ page }) => {
  test.setTimeout(45_000);
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
  await expect(page.locator('body')).toContainText(/Centro de Notificaciones|Notificaciones/i);
  const allFilter = page.getByText('Todos', { exact: true }).filter({ visible: true }).first();
  if (await allFilter.count()) await allFilter.click();
  const menu = page.locator('button.dropdown-toggle').filter({ has: page.locator('i.mdi-dots-horizontal') }).first();
  await menu.click();
  const remove = page.locator('.dropdown-menu.show a').filter({ hasText: /Eliminar/i }).first();
  await expect(remove).toBeVisible();
  page.once('dialog', async dialog => { await dialog.accept(); });
  await remove.click();
  const confirm = page.getByRole('button', { name: /Sí|Eliminar|Confirmar/i }).last();
  if (await confirm.isVisible().catch(() => false)) await confirm.click();
  await expect(page.locator('.dropdown-menu.show')).toHaveCount(0);
});
