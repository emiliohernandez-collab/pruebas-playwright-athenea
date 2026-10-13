import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M13-16-6 — Administrador Organización — Crear plantilla de notificación', async ({ page }) => {
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
  await page.goto('/NotificationTemplates/Create');
  await expect(page.locator('body')).toContainText(/Plantilla|Notificación|Crear/i);
  await expect(page.locator('input, textarea, select').first()).toBeVisible();
  const name = `QA Playwright plantilla ${Date.now()}`;
  await page.locator('#name').fill(name);
  await page.locator('#description').fill('Plantilla creada por prueba automatizada y validada para persistencia.');
  await page.locator('#notificationType').selectOption({ label: 'Email' });
  await page.locator('#category').fill('QA');
  await page.locator('#language').selectOption({ label: 'Español' });
  await page.locator('#defaultPriority').selectOption({ label: 'Normal' });
  await page.locator('#subject').fill('Prueba automatizada {{userName}}');
  await page.locator('#body').fill('Contenido de prueba para {{userName}}.');
  await page.getByRole('button', { name: /Crear plantilla/i }).click();
  await expect(page.locator('body')).toContainText(/creada|éxito|correctamente|Plantilla/i);
  await page.reload();
  await expect(page.locator('body')).toContainText(name);
});
