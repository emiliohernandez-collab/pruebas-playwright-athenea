import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M13-06-6 — Administrador Organización — Solicitar verificación de WhatsApp', async ({ page }) => {
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
  await page.goto('/NotificationCenter/Channels');
  await expect(page.locator('body')).toContainText(/WhatsApp/i);
  await page.getByRole('button', { name: 'Enviar código', exact: true }).click();
  await page.waitForTimeout(1000);
  await expect(page.locator('body')).toContainText(/Enviado|c[oó]digo/i);
  // La confirmación requiere el código real recibido en el teléfono del perfil.
});
