import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M10-06-6 — Administrador Organización — Cargar festivos oficiales de México', async ({ page }) => {
  test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan credenciales');
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
  await page.goto('/Holidays');
  const load = page.getByRole('button', { name: /Cargar festivos de México/i });
  await expect(load).toBeVisible();
  await load.click();
  if (await page.getByRole('button', { name: /Sí|Confirmar|Cargar/i }).count()) {
    const confirm = page.getByRole('button', { name: /Sí|Confirmar|Cargar/i }).last();
    if (await confirm.isVisible()) await confirm.click();
  }
  await page.waitForTimeout(500);
  await expect(page.locator('body')).toContainText(/Año Nuevo|Día del Trabajo|Navidad/i);
});
