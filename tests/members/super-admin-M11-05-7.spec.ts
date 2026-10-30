import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M11-05-7 — Super Administrador — Eliminar miembro', async ({ page }) => {
  test.setTimeout(45_000);
  test.skip(!process.env.ATHENEA_MEMBER_EMAIL, 'Falta ATHENEA_MEMBER_EMAIL con el fixture QA');
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
  await page.goto('/OrganizationMembers');
  const email = process.env.ATHENEA_MEMBER_EMAIL!;
  const row = page.getByRole('row').filter({ hasText: email }).first();
  await expect(row).toBeVisible();
  await expect(row).toContainText(/Activo/i);
  const remove = row.getByRole('button', { name: /Eliminar/i }).last();
  await remove.click();
  const modal = page.locator('#confirmRemoveModal');
  await expect(modal).toBeVisible();
  await modal.getByRole('button', { name: /Sí,\s*Eliminar/i }).click();
  await expect(modal).toBeHidden({ timeout: 10_000 });
  await expect(page.getByText(/Miembro removido de la organización exitosamente/i)).toBeVisible();
  await page.reload();
  await expect(page.getByRole('row').filter({ hasText: email })).toHaveCount(0);
});
