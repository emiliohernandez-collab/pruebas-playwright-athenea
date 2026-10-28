import { expect, test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test('M20-02-6 — Administrador Organización — Crear mi propia organización', async ({ page }) => {
  const login = new LoginPage(page);
  await login.open(); await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  await expect(page).toHaveURL(/SelectOrganizationAtLogin|Dashboard/i, { timeout: 20_000 });
  if (!/SelectOrganizationAtLogin/i.test(page.url())) throw new Error('No apareció el selector de organización.');
  await page.getByText('Athenea Demo.', { exact: true }).click();
  await page.getByRole('button', { name: /Continuar/i }).click();
  await expect(page).toHaveURL(/Dashboard/i, { timeout: 20_000 });
  await page.getByText('Athenea Demo.', { exact: true }).first().click();
  await expect(page.locator('body')).toContainText(/Crear Nueva Organización/i, { timeout: 10_000 });
  await page.getByText(/Crear Nueva Organización/i).click();
  const name = `QA Org M20-02 ${Date.now()}`;
  await page.getByRole('textbox').first().fill(name);
  await page.getByRole('button', { name: /Crear|Guardar|Continuar/i }).last().click();
  await expect(page.locator('body')).toContainText(name, { timeout: 20_000 });
});
