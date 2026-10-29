import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';
import { ProjectsPage } from '../pages/ProjectsPage';

test('M02-26-7 — Super Administrador — Eliminar sección', async ({ page }) => {
  test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan credenciales');
  const login = new LoginPage(page); const org = new OrganizationPage(page); const dashboard = new DashboardPage(page); const projects = new ProjectsPage(page);
  await login.open(); await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) { await org.select(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe'); await org.continue(); }
  await login.expectAuthenticated(); await dashboard.expectLoaded(); await projects.open(); await projects.openFirstProject(); await page.getByRole('tab', {name:/Lista/i}).click();
  const name=`QA-Athenea-M02-26-${Date.now()}`; await page.getByText(/Agregar Sección/i,{exact:true}).click(); const d=page.getByRole('dialog'); await d.getByRole('textbox').first().fill(name); await d.getByRole('button',{name:/Crear|Guardar|Agregar/i}).last().click(); await expect(page.locator('body')).toContainText(name);
  const row=page.getByText(name,{exact:true}).locator('xpath=ancestor::*[.//button][1]'); await row.locator('button').last().click(); const confirm=page.getByRole('button',{name:/Sí, eliminar|Eliminar|Confirmar/i}).last(); await expect(confirm).toBeVisible(); await confirm.click(); await expect(page.getByText(name,{exact:true})).toHaveCount(0,{timeout:20_000}); await page.reload({waitUntil:'domcontentloaded'}); await expect(page.locator('body')).not.toContainText(name,{timeout:20_000});
});
