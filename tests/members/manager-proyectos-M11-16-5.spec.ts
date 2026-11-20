import { expect, test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

test('M11-16-5 — Manager Proyectos — Acceso denegado al vaciado de rol', async ({ page }, testInfo) => {
  test.setTimeout(60000);
  const login = new LoginPage(page); const dashboard = new DashboardPage(page);
  await login.open(); await login.signIn('demo.manager@athenea.local', 'Abcd.1234');
  if (/SelectOrganizationAtLogin/i.test(page.url())) {
    await page.getByText('QA Checkout Stripe', { exact: false }).last().click();
    await page.getByRole('button', { name: /Continuar/i, exact: true }).click();
  }
  await login.expectAuthenticated(); await dashboard.expectLoaded();
  await page.goto('/Roles/ManageUsers/67517db4-a8ef-4bd9-8ef0-ad55e8752d35');
  await expect(page.locator('body')).toContainText(/Acceso Restringido|No tienes permiso/i);
  const evidence = 'test-results/manager-proyectos-M11-16-acceso-denegado.png';
  await page.screenshot({ path: evidence, fullPage: true });
  await testInfo.attach('manager-proyectos-vaciado-rol-denegado', { path: evidence, contentType: 'image/png' });
});
