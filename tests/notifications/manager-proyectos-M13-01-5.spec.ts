import { expect, test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

test('M13-01-5 — Manager Proyectos — Consultar notificaciones propias', async ({ page }, testInfo) => {
  test.setTimeout(60000);
  const login = new LoginPage(page); const dashboard = new DashboardPage(page);
  await login.open(); await login.signIn('demo.manager@athenea.local', 'Abcd.1234');
  if (/SelectOrganizationAtLogin/i.test(page.url())) {
    await page.getByText('QA Checkout Stripe', { exact: false }).last().click();
    await page.getByRole('button', { name: /Continuar/i, exact: true }).click();
  }
  await login.expectAuthenticated(); await dashboard.expectLoaded();
  await page.goto('/NotificationCenter');
  await expect(page).toHaveURL(/NotificationCenter/i);
  await expect(page.locator('body')).not.toContainText(/Acceso Restringido|No tienes permiso|403/i);
  await expect(page.locator('body')).toContainText(/notificaci|leíd|leer/i);
  const evidence = 'test-results/manager-proyectos-M13-01-notificaciones.png';
  await page.screenshot({ path: evidence, fullPage: true });
  await testInfo.attach('manager-proyectos-notificaciones', { path: evidence, contentType: 'image/png' });
});
