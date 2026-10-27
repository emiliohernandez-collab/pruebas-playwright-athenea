import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M14-08-6 — Administrador Organización — Probar regla con escenario', async ({ page }) => {
  test.setTimeout(45_000);
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
  await page.goto('/Automation');
  const rule = page.locator('tr').filter({ has: page.locator('input.status-switch') }).first();
  await expect(rule).toBeVisible();
  await rule.locator('a[aria-label="Sandbox"]').click();
  await expect(page.locator('body')).toContainText(/Prueba Sandbox|Banco de pruebas|Simular|regla/i);
  const fields = page.getByRole('textbox');
  for (const field of await fields.all()) await field.fill('QA escenario');
  const run = page.getByRole('button', { name: /Probar|Ejecutar/i }).last();
  await expect(run).toBeVisible();
  await run.click();
  await expect(page.locator('body')).toContainText(/resultado|escenario|simulaci[oó]n|haría|sin aplicar/i);
});
