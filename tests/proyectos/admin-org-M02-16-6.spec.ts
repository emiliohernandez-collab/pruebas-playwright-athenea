import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';
import { ProjectsPage } from '../pages/ProjectsPage';

test('M02-16-6 — Administrador Organización — Crear proyecto', async ({ page }) => {
  test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan credenciales');
  const login = new LoginPage(page); const org = new OrganizationPage(page); const dashboard = new DashboardPage(page); const projects = new ProjectsPage(page);
  await login.open(); await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) { await org.select(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe'); await org.continue(); }
  await login.expectAuthenticated(); await dashboard.expectLoaded(); await projects.open();
  const name = `QA-M02-16-${Date.now()}`;
  await page.getByRole('button', { name: /Crear Proyecto/i }).click();
  const form = page.locator('form').filter({ has: page.getByRole('textbox') }).last();
  await expect(form).toBeVisible();
  await form.getByRole('textbox').first().fill(name);
  await page.getByRole('button', { name: /Siguiente|Continuar/i }).click();
  const portfolio = page.locator('select').first();
  const options = await portfolio.locator('option').evaluateAll(opts => opts.map(o => ({ text: o.textContent?.trim(), value: (o as HTMLOptionElement).value })));
  const valid = options.find(o => o.value && !/no.?portfolio/i.test(o.text ?? ''));
  if (!valid) throw new Error(`No hay portafolios válidos disponibles: ${JSON.stringify(options)}`);
  await portfolio.selectOption(valid.value);
  await page.getByRole('button', { name: /Siguiente|Continuar/i }).click();
  await page.getByRole('button', { name: /Siguiente|Continuar|Crear Proyecto|Finalizar/i }).last().click();
  await page.getByText('Básico', { exact: true }).click();
  await page.getByRole('button', { name: /Crear Proyecto|Finalizar|Guardar/i }).last().click();
  await expect(page).toHaveURL(/Projects\/Details/i, { timeout: 20_000 });
  await expect(page.locator('body')).toContainText(name, { timeout: 20_000 });
  await projects.open();
  await expect(page.locator('body')).toContainText(name, { timeout: 20_000 });
});
