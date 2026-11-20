import { expect, test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

test('M13-08-5 — Manager Proyectos — Enviar notificación manual', async ({ page }, testInfo) => {
  test.setTimeout(60000);
  const login = new LoginPage(page); const dashboard = new DashboardPage(page);
  await login.open(); await login.signIn('demo.manager@athenea.local', 'Abcd.1234');
  if (/SelectOrganizationAtLogin/i.test(page.url())) {
    await page.getByText('Athenea Demo.', { exact: true }).last().click();
    await page.getByRole('button', { name: /Continuar/i, exact: true }).click();
  }
  await login.expectAuthenticated(); await dashboard.expectLoaded();
  await page.goto('/Notifications/Send');
  await expect(page.locator('body')).toContainText(/Enviar.*notific|Notificaci[oó]n/i);
  const subject = `QA M13-08 Manager ${Date.now()}`;
  await page.locator('#subject').fill(subject);
  await page.locator('#body').fill('Prueba automatizada M13-08 para usuario QA Manager Proyectos.');
  await page.locator('#recipients').fill('demo.manager@athenea.local');
  await page.locator('#btnSend').click();
  await expect(page.locator('body')).toContainText(/enviada a la cola|cola correctamente|Pending/i);
  const evidence = 'test-results/manager-proyectos-M13-08-notificacion.png';
  await page.screenshot({ path: evidence, fullPage: true });
  await testInfo.attach('manager-proyectos-notificacion-manual', { path: evidence, contentType: 'image/png' });
});
