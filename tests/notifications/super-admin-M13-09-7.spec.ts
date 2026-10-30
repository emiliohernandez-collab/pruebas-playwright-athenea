import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M13-09-7 — Super Administrador — Enviar notificación desde plantilla', async ({ page }) => {
  test.setTimeout(60_000);
  const login = new LoginPage(page);
  const org = new OrganizationPage(page);
  const dashboard = new DashboardPage(page);
  const recipient = process.env.ATHENEA_NOTIFICATION_RECIPIENT ?? 'emilyhdzp@gmail.com';

  if (process.env.ATHENEA_STORAGE_STATE) {
    await page.goto('/Dashboard');
  } else {
    await login.open();
    await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
    if (/SelectOrganizationAtLogin/i.test(page.url())) {
      await org.select('Ribbit');
      await org.continue();
    }
  }
  await login.expectAuthenticated();
  await dashboard.expectLoaded();
  await page.goto('/Notifications/Send');

  await page.locator('#useTemplate').check();
  await page.locator('text=QA M13-09-7').click();
  await page.locator('input[name="variables.userName"]').fill('Emily QA');
  await page.locator('#recipients').fill(recipient);
  await page.locator('#btnSend').click();

  await expect(page.getByText('Notificación enviada a la cola correctamente')).toBeVisible();
  await expect(page.getByText('Plantilla QA M13-09-7', { exact: true }).first()).toBeVisible();
  await expect(page.locator('body')).toContainText('Hola Emily QA, mensaje de plantilla QA M13-09-7');
  await expect(page.locator('body')).toContainText(recipient);
  await expect(page.locator('body')).toContainText('Pending');
});
