import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M05-12-5 — Manager Proyectos — Crear ticket', async ({ page }, testInfo) => {
  test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan credenciales QA');
  const login=new LoginPage(page); const org=new OrganizationPage(page); const dashboard=new DashboardPage(page); await login.open(); await login.signIn(process.env.ATHENEA_USER!,process.env.ATHENEA_PASSWORD!); if(/SelectOrganizationAtLogin/i.test(page.url())){await org.select(process.env.ATHENEA_ORGANIZATION??'QA Checkout Stripe');await org.continue();} await login.expectAuthenticated(); await dashboard.expectLoaded();
  await page.goto('/Tickets/Create',{waitUntil:'domcontentloaded'}); await expect(page.locator('body')).toContainText(/Crear Ticket/i); const subject=`QA M05-12 ${Date.now()}`; await page.getByLabel(/Asunto/i).fill(subject); await page.locator('[contenteditable="true"]').first().fill('Ticket creado para validar el flujo automatizado de alta.'); await page.getByRole('combobox',{name:/Categoria/i}).selectOption({index:1}); await page.getByRole('button',{name:/Crear Ticket/i}).last().click(); await expect(page).toHaveURL(/\/Tickets\/Details\//); await expect(page.locator('body')).toContainText(subject); await expect(page.locator('body')).toContainText(/Nuevo|Abierto/i); const evidencePath='test-results/manager-proyectos-M05-12-ticket-creado.png'; await page.screenshot({path:evidencePath,fullPage:true}); await testInfo.attach('manager-proyectos-ticket-creado',{path:evidencePath,contentType:'image/png'});
});
