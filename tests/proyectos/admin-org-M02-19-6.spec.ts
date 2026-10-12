import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';
import { ProjectsPage } from '../pages/ProjectsPage';

test('M02-19-6 — Administrador Organización — Quitar miembro del proyecto', async ({ page }) => {
  test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan credenciales');
  const login = new LoginPage(page); const org = new OrganizationPage(page); const dashboard = new DashboardPage(page); const projects = new ProjectsPage(page);
  await login.open(); await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) { await org.select(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe'); await org.continue(); }
  await login.expectAuthenticated(); await dashboard.expectLoaded(); await projects.open(); await projects.openFirstProject();
  const remove = page.locator('button[title="Eliminar miembro"][data-user-name="Demo Invitado"]').first().or(page.locator('button[title="Eliminar miembro"]').first()); await expect(remove).toBeVisible();
  const removedName = await remove.getAttribute('data-user-name');
  const memberRow = remove.locator('xpath=ancestor::*[.//img or .//select][1]');
  await remove.click({ force: true });
  const confirm = page.getByRole('button', { name: /Sí, eliminar|Confirmar|Eliminar/i }).last();
  if (await confirm.isVisible().catch(() => false)) await confirm.click();
  await expect(remove).toHaveCount(0, { timeout: 20_000 });
  await page.reload({ waitUntil: 'domcontentloaded' });
  if (removedName) await expect(page.locator('body')).not.toContainText(removedName, { timeout: 20_000 });
});
