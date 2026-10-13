import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M14-02-6 — Administrador Organización — Crear regla de automatización', async ({ page }) => {
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
  await page.goto('/Automation/Create');
  await expect(page.locator('body')).toContainText(/Crear|Nueva.*regla|Automatizaci[oó]n/i);
  const name = `QA M14-02 ${Date.now()}`;
  const textboxes = page.getByRole('textbox');
  await expect(textboxes.first()).toBeVisible();
  await textboxes.first().fill(name);
  for (const select of await page.locator('select:visible').all()) {
    const values = await select.locator('option').evaluateAll(opts => opts.map(o => (o as HTMLOptionElement).value).filter(Boolean));
    if (values.length) await select.selectOption(values[0]);
  }
  const save = page.getByRole('button', { name: /Guardar|Crear|Save/i }).last();
  await expect(save).toBeVisible();
  await save.click();
  await expect(page.locator('body')).toContainText(name, { timeout: 20_000 });
});
