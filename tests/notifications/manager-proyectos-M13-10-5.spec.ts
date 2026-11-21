import { expect, test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

test('M13-10-5 — Manager Proyectos — Reenviar notificación de la cola', async ({ page }, testInfo) => {
  test.setTimeout(60000);
  const login = new LoginPage(page); const dashboard = new DashboardPage(page);
  await login.open(); await login.signIn('demo.manager@athenea.local', 'Abcd.1234');
  if (/SelectOrganizationAtLogin/i.test(page.url())) {
    await page.getByText('Athenea Demo.', { exact: true }).last().click();
    await page.getByRole('button', { name: /Continuar/i, exact: true }).click();
  }
  await login.expectAuthenticated(); await dashboard.expectLoaded();
  await page.goto('/Notifications');
  await expect(page.locator('body')).toContainText(/notificaci[oó]n/i);
  const retry = page.getByRole('button', { name: /Reintentar/i }).first();
  await expect(retry).toBeVisible();
  page.once('dialog', dialog => dialog.accept());
  await retry.click({ noWaitAfter: true });
  await page.waitForTimeout(2500);
  await expect(page.locator('body')).toContainText(/reintent|cola|enviad|proces/i);
  const evidence = 'test-results/manager-proyectos-M13-10-reintento.png';
  await page.screenshot({ path: evidence, fullPage: true });
  await testInfo.attach('manager-proyectos-reintento-notificacion', { path: evidence, contentType: 'image/png' });
});
