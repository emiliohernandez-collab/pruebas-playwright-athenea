import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M14-07-6 — Administrador Organización — Simular regla', async ({ page }) => {
  test.setTimeout(60_000);
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
  await expect(page.locator('body')).toContainText(/Banco de pruebas|Simular|regla/i);
  const selects = page.locator('select:visible');
  await expect(selects.first()).toBeVisible();
  const ruleOptions = await selects.first().locator('option').evaluateAll(opts => opts.map(o => (o as HTMLOptionElement).value).filter(Boolean));
  expect(ruleOptions.length).toBeGreaterThan(0);
  await selects.first().selectOption(ruleOptions[0]);
  for (const field of await page.getByRole('textbox').all()) await field.fill('QA demo');
  await page.getByRole('button', { name: /Simular|Probar|Ejecutar/i }).last().click();
  await expect(page.locator('body')).toContainText(/resultado|haría|simulaci[oó]n|sin aplicar/i);
});
