import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

const taskId = '8b947d76-1b0b-49e4-a946-15dae541bd9e';
const originalTitle = 'QA Fixture M03 Tareas 05';
const originalDescription = 'Fixture persistente para probar responsables con Administrador Organización.';

test('M03-19-7 — Super Administrador — Editar tarea', async ({ page }) => {
  test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan credenciales');
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
  await page.goto(`/Tasks/Details/${taskId}`);
  await page.locator('#btnEditTaskSidebar').click();
  const editedTitle = `QA Fixture M03-19 editado ${Date.now()}`;
  let dialog = page.locator('[role="dialog"]:visible');
  await dialog.locator('#editTitle').fill(editedTitle);
  await dialog.locator('#editDescription').fill('Descripción editada por M03-19.');
  await dialog.getByRole('combobox').nth(1).selectOption({ label: 'Urgente' });
  await page.locator('#btnSaveTask').click();
  await expect(page).toHaveURL(new RegExp(`/Tasks/Details/${taskId}`));
  await expect(page.locator('#taskTitle')).toContainText(editedTitle);
  await page.reload();
  await expect(page.locator('#taskTitle')).toContainText(editedTitle, { timeout: 20_000 });
  await page.locator('#btnEditTaskSidebar').click();
  dialog = page.locator('[role="dialog"]:visible');
  await dialog.locator('#editTitle').fill(originalTitle);
  await dialog.locator('#editDescription').fill(originalDescription);
  await page.locator('#btnSaveTask').click();
  await page.waitForTimeout(3_000);
  await page.reload();
  await expect(page.locator('#taskTitle')).toContainText(originalTitle, { timeout: 20_000 });
});
