import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M03-01-6 — Administrador Organización — Consultar lecturas del módulo', async ({ page }) => {
  test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan credenciales');
  const login=new LoginPage(page); const org=new OrganizationPage(page); const dashboard=new DashboardPage(page);
  await login.open(); await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) { await org.select(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe'); await org.continue(); }
  await login.expectAuthenticated(); await dashboard.expectLoaded();
  await page.getByRole('link', { name: /Mis Tareas/i }).first().click(); await expect(page).toHaveURL(/Tasks\/MyTasks/i);
  await page.getByRole('button', { name: /Sin fecha/i }).click();
  const task = page.locator('[data-task-id]:visible, .task-card:visible, .task-item:visible').first(); await expect(task).toBeVisible({timeout:20_000}); await task.click();
  await expect(page.locator('body')).toContainText(/Comentarios|Adjuntos|Dependencias|Tiempo/i, {timeout:20_000});
});
