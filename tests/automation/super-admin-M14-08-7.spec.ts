import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M14-08-7 — Super Administrador — Probar regla con escenario', async ({ page }) => {
  test.setTimeout(60_000);
  const login = new LoginPage(page);
  const org = new OrganizationPage(page);
  const dashboard = new DashboardPage(page);
  await login.open();
  await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) {
    const orgName = process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe';
    const radio = page.locator('label').filter({ hasText: orgName }).last();
    if (await radio.count()) await radio.click(); else await page.getByText(orgName, { exact: true }).last().click();
    await org.continue();
  }
  await login.expectAuthenticated();
  await dashboard.expectLoaded();
  const name = `QA M14-08-7 ${Date.now()}`;
  await page.goto('/Automation/Create');
  await page.getByRole('textbox').first().fill(name);
  await page.getByRole('button', { name: /Siguiente/i }).click();
  await page.getByText('Tarea creada', { exact: true }).locator('..').locator('..').click({ force: true });
  await page.getByRole('button', { name: /Siguiente/i }).click();
  await page.getByRole('button', { name: /Siguiente/i }).click();
  const actionSelect = page.locator('select:visible').first();
  const values = await actionSelect.locator('option').evaluateAll(opts => opts.map(o => (o as HTMLOptionElement).value).filter(Boolean));
  await actionSelect.selectOption(values[0]);
  await page.getByRole('button', { name: /Agregar/i }).click();
  await page.getByRole('button', { name: /Siguiente/i }).click();
  await page.getByRole('button', { name: /Crear regla|Crear automatización|Finalizar|Guardar|Save/i }).last().click();
  await expect(page.locator('body')).toContainText(name, { timeout: 20_000 });

  await page.goto('/Automation');
  const rule = page.locator('tr, .card, .list-group-item').filter({ hasText: name }).first();
  await expect(rule).toBeVisible();
  await rule.locator('a[aria-label="Sandbox"], a[title*="Sandbox"], a[href*="Sandbox"]').first().click();
  await expect(page.locator('body')).toContainText(/Prueba Sandbox|Banco de pruebas|Simular|regla/i);
  for (const field of await page.getByRole('textbox').all()) await field.fill('QA escenario');
  const run = page.getByRole('button', { name: /Probar|Ejecutar|Simular/i }).last();
  await expect(run).toBeVisible();
  await run.click();
  await expect(page.locator('body')).toContainText(/resultado|escenario|simulaci[oó]n|haría|sin aplicar/i);

  await page.goto('/Automation');
  const finalRule = page.locator('tr, .card, .list-group-item').filter({ hasText: name }).first();
  const remove = finalRule.locator('a[href*="Delete"], button[title*="Eliminar"], button[aria-label*="Eliminar"]').first();
  page.once('dialog', dialog => dialog.accept());
  await remove.click();
  const confirm = page.locator('#deleteModal button.btn-danger');
  await expect(confirm).toBeVisible();
  await confirm.click();
  await expect(page.getByText(name, { exact: true })).toHaveCount(0);
});
