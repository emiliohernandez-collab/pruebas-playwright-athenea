import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M13-17-6 — Administrador Organización — Editar plantilla de notificación', async ({ page }) => {
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

  // Crea una plantilla QA controlada para que la edición sea reproducible y no dependa de fixtures frágiles.
  const name = `QA Playwright editar ${Date.now()}`;
  await page.goto('/NotificationTemplates/Create');
  await page.locator('#name').fill(name);
  await page.locator('#description').fill('Descripción inicial de prueba.');
  await page.locator('#notificationType').selectOption({ label: 'Email' });
  await page.locator('#category').fill('QA');
  await page.locator('#language').selectOption({ label: 'Español' });
  await page.locator('#defaultPriority').selectOption({ label: 'Normal' });
  await page.locator('#subject').fill('Asunto inicial {{userName}}');
  await page.locator('#body').fill('Contenido inicial para {{userName}}.');
  await page.getByRole('button', { name: /Crear plantilla/i }).click();

  await expect(page.locator('body')).toContainText(/creada|éxito|correctamente|Plantilla/i);
  await page.goto('/NotificationTemplates');
  const card = page.getByText(name, { exact: true }).locator('xpath=ancestor::div[contains(@class, "card")][1]');
  await expect(card).toBeVisible();
  await card.getByText('Editar', { exact: true }).click();

  const updated = 'Descripción editada y persistida por Playwright.';
  await page.locator('#description').fill(updated);
  await page.getByRole('button', { name: /Guardar|Actualizar|Editar/i }).click();
  await expect(page.locator('body')).toContainText(/actualizada|éxito|correctamente|guardad/i);
  await page.reload();
  await expect(page.getByText(updated, { exact: true }).first()).toBeVisible();
});
