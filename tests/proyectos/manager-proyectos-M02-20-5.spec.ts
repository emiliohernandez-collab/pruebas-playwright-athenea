import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';
import { ProjectsPage } from '../pages/ProjectsPage';

test('M02-20-5 — Manager Proyectos — Cambiar rol de miembro', async ({ page }, testInfo) => {
  test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan credenciales');
  const login = new LoginPage(page); const org = new OrganizationPage(page); const dashboard = new DashboardPage(page); const projects = new ProjectsPage(page);
  await login.open(); await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) { await org.select(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe'); await org.continue(); }
  await login.expectAuthenticated(); await dashboard.expectLoaded(); await projects.open();
  const cards = page.locator('.project-card'); const count = await cards.count(); let roleControls = page.locator('select').filter({ hasText: /Editor/i }); let found = false;
  for (let i = 0; i < count; i++) {
    await page.goto('/Projects/Index'); await expect(page).toHaveURL(/Projects\/Index/i); const card = page.locator('.project-card').nth(i); await card.click(); await expect(page).toHaveURL(/Projects\/Details/i);
    await page.getByText('Lista', { exact: true }).click().catch(() => undefined); roleControls = page.locator('select').filter({ hasText: /Editor/i });
    if (await roleControls.count()) { found = true; break; }
  }
  // El caso debe localizar un proyecto con control de rol; si no existe, el fallo es funcional del rol.
  await expect(found).toBeTruthy();
  const role = roleControls.first(); await role.selectOption({ label: 'Editor' }); await expect(role.locator('option:checked')).toHaveText('Editor'); await page.waitForTimeout(1000); await page.reload({ waitUntil: 'domcontentloaded' }); await expect(page.locator('select').filter({ hasText: /Editor/i }).first().locator('option:checked')).toHaveText('Editor');
  await testInfo.attach('manager-proyectos-rol-miembro-editado', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
});
