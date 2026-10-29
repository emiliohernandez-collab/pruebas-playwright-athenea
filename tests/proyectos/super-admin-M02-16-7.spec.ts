import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';
import { ProjectsPage } from '../pages/ProjectsPage';

test('M02-16-7 — Super Administrador — Crear proyecto', async ({ page }) => {
  test.skip(!process.env.ATHENA_USER && !process.env.ATHENEA_USER, 'Faltan credenciales');
  const login = new LoginPage(page); const org = new OrganizationPage(page); const dashboard = new DashboardPage(page); const projects = new ProjectsPage(page);
  await login.open(); await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) { await org.select(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe'); await org.continue(); }
  await login.expectAuthenticated(); await dashboard.expectLoaded(); await projects.open();
  const name = `QA M02-16 Proyecto ${Date.now()}`;
  await page.getByRole('button', { name: /Crear/ }).first().click();
  await page.getByText('Nuevo Proyecto', { exact: true }).click();
  await page.locator('#projectName').fill(name);
  await page.locator('#projectDescription').fill('Fixture temporal para M02-16-7.');
  await page.getByText('Siguiente', { exact: true }).click();
  const portfolio = page.locator('#projectPortfolio');
  const options = await portfolio.locator('option').evaluateAll(opts => opts.map(o => ({ text: o.textContent?.trim(), value: (o as HTMLOptionElement).value })));
  const valid = options.find(o => o.value && !/no.?portfolio/i.test(o.text ?? ''));
  if (!valid) throw new Error('No hay portafolios válidos disponibles');
  await portfolio.selectOption(valid.value);
  await page.getByText('Siguiente', { exact: true }).click();
  await page.getByText('Siguiente', { exact: true }).click();
  await page.getByText('Básico', { exact: true }).click();
  await page.getByText('Crear Proyecto', { exact: true }).last().click();
  await expect(page).toHaveURL(/Projects\/Details/i, { timeout: 20_000 });
  await expect(page.locator('body')).toContainText(name, { timeout: 20_000 });
});
