import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';
import { ProjectsPage } from '../pages/ProjectsPage';

test('M02-20-6 — Administrador Organización — Cambiar rol de miembro', async ({ page }) => {
  test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan credenciales');
  const login = new LoginPage(page); const org = new OrganizationPage(page); const dashboard = new DashboardPage(page); const projects = new ProjectsPage(page);
  await login.open(); await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) { await org.select(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe'); await org.continue(); }
  await login.expectAuthenticated(); await dashboard.expectLoaded(); await projects.open(); await projects.openFirstProject();
  const add = page.getByRole('button', { name: /Buscar y Agregar Miembros/i }); await add.click();
  const dialog = page.getByRole('dialog'); await expect(dialog).toBeVisible(); await dialog.locator('button').nth(1).click();
  const memberSelect = page.locator('select:visible').last(); await expect(memberSelect).toBeVisible();
  const values = await memberSelect.locator('option').evaluateAll(opts => opts.map(o => (o as HTMLOptionElement).value).filter(Boolean));
  if (values.length < 2) throw new Error('El proyecto no ofrece un segundo rol para validar el cambio');
  await memberSelect.selectOption(values[1]);
  await expect(memberSelect).toHaveValue(values[1]);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('select:visible').last()).toHaveValue(values[1], { timeout: 20_000 });
});
