import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M02-03-3 — Colaborador — Subir archivo al proyecto', async ({ page }) => {
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
  await page.goto('/Projects/Index');
  await page.getByText('Desarrollo App Móvil', { exact: true }).click();
  await page.getByText(/Archivos|Files/i).first().click();
  const file = 'C:/Users/emily/AppData/Local/Temp/codex-clipboard-7e6059df-5e5a-4023-aafd-ed27e69fbfde.png';
  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: /Subir Archivo/i }).click();
  await (await chooser).setFiles(file);
  await expect(page.locator('body')).toContainText(/subido|archivo|uploaded|file/i);
});
