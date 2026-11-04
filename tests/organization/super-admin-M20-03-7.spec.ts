import { expect, test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M20-03-7 — Super Administrador — Crear organización desde panel administrativo', async ({ page }) => {
  const login = new LoginPage(page);
  const org = new OrganizationPage(page);
  await login.open();
  await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) {
    await org.select(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe');
    await org.continue();
  }
  await login.expectAuthenticated();

  await page.goto('/AdminOrganizationMembers');
  await expect(page.locator('body')).toContainText('Organizaciones disponibles', { timeout: 20_000 });
  await expect(page.locator('body')).not.toContainText(/Acceso restringido|No autorizado|403/i);

  const name = `QA M20-03-7 ${Date.now()}`;
  const currentOrg = process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe';
  await page.locator('a.nav-link').filter({ hasText: currentOrg }).click();
  await page.locator('#org-create-btn').click();
  await page.locator('#swal-org-name').fill(name);
  await page.locator('#swal-org-desc').fill('Organización temporal para validar M20-03-7');
  await page.getByRole('button', { name: 'Crear', exact: true }).click();
  await expect(page.locator('body')).toContainText('Organización creada', { timeout: 20_000 });

  await page.goto('/AdminOrganizationMembers');
  await expect(page.locator('body')).toContainText(name, { timeout: 20_000 });
});
