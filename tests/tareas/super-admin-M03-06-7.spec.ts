import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M03-06-7 — Super Administrador — Editar adjunto de tarea', async ({ page }) => {
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
  await page.goto('/Tasks/Details/8b947d76-1b0b-49e4-a946-15dae541bd9e');
  await page.getByRole('tab', { name: /Archivos/i }).click();
  const file = page.locator('.file-item').filter({ hasText: 'qa-attachment.txt' }).first();
  await file.locator('button[title="Editar"]').click();
  const dialog = page.getByRole('dialog');
  await dialog.locator('#swal-file-desc').fill('Descripción QA M03-06');
  await dialog.getByRole('button', { name: 'Guardar' }).click();
  await expect(page.getByText('Archivo actualizado')).toBeVisible();
  await page.reload();
  await page.getByRole('tab', { name: /Archivos/i }).click();
  const reloadedFile = page.locator('.file-item').filter({ hasText: 'qa-attachment.txt' }).first();
  await reloadedFile.locator('button[title="Editar"]').click();
  await expect(page.getByRole('dialog').locator('#swal-file-desc')).toHaveAttribute('value', 'Descripción QA M03-06');
});
