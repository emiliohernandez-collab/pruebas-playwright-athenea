import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M00-03-3 — Colaborador — Editar mis datos y restaurar', async ({ page }) => {
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
  await page.goto('/Account/MyData');
  await expect(page.locator('body')).toContainText(/Mis datos|Mi cuenta|Perfil/i);
  const original = {
    nombre: await page.locator('#Nombre').inputValue(),
    apellido1: await page.locator('#Apellido1').inputValue(),
    apellido2: await page.locator('#Apellido2').inputValue(),
    phone: await page.locator('#PhoneNumber').inputValue(),
  };
  const marker = `QA${Date.now()}`;
  await page.locator('#Nombre').fill(`${original.nombre}-${marker}`);
  await page.locator('#PhoneNumber').fill('5512345678');
  await page.locator('button').filter({ hasText: 'Guardar Cambios' }).first().click({ force: true });
  await expect(page.locator('body')).toContainText(/éxito|correctamente|actualizado|guardad/i);
  await page.reload();
  await expect(page.locator('#Nombre')).toHaveValue(`${original.nombre}-${marker}`);
  await expect(page.locator('#PhoneNumber')).toHaveValue('(55) 1234-5678');
  await page.locator('#Nombre').fill(original.nombre);
  await page.locator('#Apellido1').fill(original.apellido1);
  await page.locator('#Apellido2').fill(original.apellido2);
  await page.locator('#PhoneNumber').fill(original.phone);
  await page.locator('button').filter({ hasText: 'Guardar Cambios' }).first().click({ force: true });
  await page.reload();
  await expect(page.locator('#Nombre')).toHaveValue(original.nombre);
  await expect(page.locator('#PhoneNumber')).toHaveValue(original.phone);
});
