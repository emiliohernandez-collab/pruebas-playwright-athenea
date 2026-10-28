import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M15-10-6 — Administrador Organización — Eliminar reunión', async ({ page }) => {
  test.setTimeout(45_000);
  const login = new LoginPage(page);
  const org = new OrganizationPage(page);
  const dashboard = new DashboardPage(page);

  await login.open();
  await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) {
    const expected = page.getByText(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe', { exact: true });
    if (await expected.count()) await expected.click(); else await page.getByText('Athenea Demo.', { exact: true }).click();
    await org.continue();
  }
  await login.expectAuthenticated();
  await dashboard.expectLoaded();
  await page.goto('/Meetings');

  const fixtureName = 'QA ERROR ABORT M15-05-6';
  const row = page.locator('tr').filter({ hasText: fixtureName }).first();
  await expect(row).toBeVisible({ timeout: 15_000 });
  const deleteButton = row.locator('button.btn-soft-danger').first();
  await expect(deleteButton).toBeVisible({ timeout: 15_000 });
  await deleteButton.click();

  const confirm = page.getByRole('button', { name: /Confirmar|Sí, eliminar|Eliminar/i }).last();
  await expect(confirm).toBeVisible({ timeout: 8_000 });
  await confirm.click();

  await page.goto('/Meetings');
  await expect(page.locator('tr').filter({ hasText: fixtureName })).toHaveCount(0, { timeout: 15_000 });
});
