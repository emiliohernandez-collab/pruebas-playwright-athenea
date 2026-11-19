import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M05-09-5 — Manager Proyectos — Crear política de SLA', async ({ page }, testInfo) => {
  test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan credenciales QA');
  const login=new LoginPage(page); const org=new OrganizationPage(page); const dashboard=new DashboardPage(page); await login.open(); await login.signIn(process.env.ATHENEA_USER!,process.env.ATHENEA_PASSWORD!); if(/SelectOrganizationAtLogin/i.test(page.url())){await org.select(process.env.ATHENEA_ORGANIZATION??'QA Checkout Stripe');await org.continue();} await login.expectAuthenticated(); await dashboard.expectLoaded();
  await page.goto('/Tickets/AdminSLAs',{waitUntil:'domcontentloaded'}); await expect(page.locator('body')).toContainText(/Pol[ií]ticas SLA|Acceso|autorizado|permiso|403/i); await expect(page.getByRole('button',{name:/Agregar|Crear pol[ií]tica|Nueva SLA/i})).toHaveCount(0); const evidencePath='test-results/manager-proyectos-M05-09-sla-creacion-denegada.png'; await page.screenshot({path:evidencePath,fullPage:true}); await testInfo.attach('manager-proyectos-sla-creacion-denegada',{path:evidencePath,contentType:'image/png'});
});
