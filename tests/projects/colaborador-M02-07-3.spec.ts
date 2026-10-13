import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M02-07-3 — Colaborador — Editar meta de proyecto', async ({ page }) => {
  test.fixme(true, 'Bloqueado: el proyecto no tiene una meta persistida disponible para editar y Colaborador no debe crearla.');
  test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan credenciales');
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
  await page.goto('/Projects/Index');
  const project = page.getByText('Desarrollo App Móvil', { exact: true });
  if (!(await project.count())) await page.getByText(/QA-M02|Prueba/i).first().click();
  else await project.click();
  await page.getByText(/Metas|Goals/i).first().click();
  await expect(page.locator('body')).toContainText(/Meta|Goal/i);
  console.log((await page.locator('body').innerText()).slice(-4000));
});
