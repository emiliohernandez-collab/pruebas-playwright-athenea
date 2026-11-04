import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M20-05-7 — Super Administrador — Eliminar organización desde panel administrativo', async ({ page }) => {
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

  const name = `QA M20-05-7 ${Date.now()}`;
  const currentOrg = process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe';
  await page.locator('a.nav-link').filter({ hasText: currentOrg }).click();
  await page.locator('#org-create-btn').click();
  await page.locator('#swal-org-name').fill(name);
  await page.locator('#swal-org-desc').fill('Organización temporal para validar M20-05-7');
  await page.getByRole('button', { name: 'Crear', exact: true }).click();
  await expect(page.locator('body')).toContainText('Organización creada', { timeout: 20_000 });
  await expect(page.locator('body')).toContainText(name, { timeout: 20_000 });

  await page.goto('/OrganizationSettings');
  await expect(page.locator('body')).toContainText(name, { timeout: 20_000 });
  const deleteButton = page.getByRole('button', { name: /Eliminar.*organizaci[oó]n|Eliminar mi organizaci[oó]n/i });
  await expect(deleteButton).toHaveCount(1);
  await deleteButton.click();
  await expect(page.locator('body')).toContainText('Para confirmar, escribe el nombre exacto', { timeout: 10_000 });
  await page.locator('#swal2-input').fill(name);
  await page.getByRole('button', { name: 'Eliminar organización', exact: true }).last().click();
  await expect(page.locator('body')).not.toContainText(name, { timeout: 20_000 });
});
