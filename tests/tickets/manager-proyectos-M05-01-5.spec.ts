import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M05-01-5 — Manager Proyectos — Consultar tickets', async ({ page }, testInfo) => {
  test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan credenciales');
  const login=new LoginPage(page); const org=new OrganizationPage(page); const dashboard=new DashboardPage(page);
  await login.open(); await login.signIn(process.env.ATHENEA_USER!,process.env.ATHENEA_PASSWORD!); if(/SelectOrganizationAtLogin/i.test(page.url())){await org.select(process.env.ATHENEA_ORGANIZATION??'QA Checkout Stripe');await org.continue();} await login.expectAuthenticated(); await dashboard.expectLoaded();
  await page.goto('/Tickets/Index',{waitUntil:'domcontentloaded'}); await expect(page.locator('body')).toContainText(/Tickets/i);
  if(await page.locator('a[href*="/Tickets/Details/"]').count()===0){ await page.getByRole('button',{name:/Crear Ticket/i}).first().click(); const subject=`QA M05-01 ${Date.now()}`; await page.getByLabel(/Asunto/i).fill(subject); await page.locator('[contenteditable="true"]').first().fill('Ticket de prueba para validar la consulta del módulo.'); await page.getByRole('combobox',{name:/Categoria/i}).selectOption({index:1}); await page.getByRole('button',{name:/Crear Ticket/i}).last().click(); await expect(page).toHaveURL(/\/Tickets\/Details\//); await expect(page.locator('body')).toContainText(subject); } else { const ticket=page.locator('a[href*="/Tickets/Details/"]').first(); await expect(ticket).toBeVisible(); await ticket.click(); await expect(page).toHaveURL(/\/Tickets\/Details\//); await expect(page.locator('body')).toContainText(/Detalle|Descripción|Estado/i); }
  const evidencePath='test-results/manager-proyectos-M05-01-consultar-ticket.png'; await page.screenshot({path:evidencePath,fullPage:true}); await testInfo.attach('manager-proyectos-consulta-ticket',{path:evidencePath,contentType:'image/png'});
});
