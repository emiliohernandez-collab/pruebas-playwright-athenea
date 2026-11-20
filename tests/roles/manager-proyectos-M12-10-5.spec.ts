import { expect, test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

test('M12-10-5 — Manager Proyectos — Acceso denegado a guardar matriz de permisos', async ({ page }, testInfo) => {
  test.setTimeout(60000);
  const login = new LoginPage(page); const dashboard = new DashboardPage(page);
  await login.open(); await login.signIn('demo.manager@athenea.local', 'Abcd.1234');
  if (/SelectOrganizationAtLogin/i.test(page.url())) {
    await page.getByText('QA Checkout Stripe', { exact: false }).last().click();
    await page.getByRole('button', { name: /Continuar/i, exact: true }).click();
  }
  await login.expectAuthenticated(); await dashboard.expectLoaded();
  await page.goto('/Permissions');
  await expect(page.locator('body')).toContainText(/Acceso Restringido|No tienes permiso/i);
  const evidence = 'test-results/manager-proyectos-M12-10-acceso-denegado.png';
  await page.screenshot({ path: evidence, fullPage: true });
  await testInfo.attach('manager-proyectos-guardar-matriz-denegado', { path: evidence, contentType: 'image/png' });
});
