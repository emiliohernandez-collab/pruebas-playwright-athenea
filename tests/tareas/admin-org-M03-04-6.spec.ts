import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M03-04-6 — Administrador Organización — Quitar responsable de una tarea', async ({ page }) => {
  test.setTimeout(20_000);
  test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan credenciales');
  const login = new LoginPage(page);
  const org = new OrganizationPage(page);
  const dashboard = new DashboardPage(page);
  await login.open();
  console.log('M03-04: login abierto');
  await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) {
    await org.select(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe');
    await org.continue();
  }
  await login.expectAuthenticated();
  await dashboard.expectLoaded();
  console.log('M03-04: autenticado');

  // Crear un fixture propio para no depender de una tarea eliminada o caducada.
  await page.goto('/Tasks/Create');
  console.log('M03-04: formulario de tarea');
  const title = `QA Fixture M03-04 ${Date.now()}`;
  await page.locator('#title').fill(title);
  await page.locator('#description').fill('Fixture para probar quitar responsable M03-04.');
  const project = page.locator('#projectId option').filter({ hasText: /QA-Athenea/i }).first();
  await expect(project).toBeAttached();
  await page.locator('#projectId').selectOption(await project.getAttribute('value') as string);
  console.log('M03-04: proyecto seleccionado');
  await page.waitForFunction(() => document.querySelectorAll('#sectionId option').length > 1);
  const section = page.locator('#sectionId option').nth(1);
  await page.locator('#sectionId').selectOption(await section.getAttribute('value') as string);
  console.log('M03-04: sección seleccionada');
  await page.locator('#priority').selectOption('High');
  const assignee = page.locator('#assigneeId option').nth(1);
  await expect(assignee).toBeAttached();
  const assigneeName = (await assignee.textContent())?.trim() ?? '';
  const assigneeValue = await assignee.getAttribute('value') as string;
  await page.locator('#assigneeId').selectOption({ label: 'Sin asignar' });
  await page.locator('#btnSubmit').click();
  console.log('M03-04: tarea creada');
  await expect(page).toHaveURL(/Tasks\/Details\//i);
  const assignees = page.locator('#taskExtraAssignees');
  await page.locator('#extraAssigneeSelect').selectOption(assigneeValue);
  await page.locator('#btnAddExtraAssignee').click();
  await expect(assignees).toContainText(assigneeName);
  await assignees.locator('button').first().click();
  await page.getByRole('button', { name: 'Eliminar', exact: true }).last().click();
  await expect(assignees).not.toContainText(assigneeName);
});
