import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';
import { ProjectsPage } from '../pages/ProjectsPage';

test('M02-22-6 — Administrador Organización — Archivar y restaurar proyecto', async ({ page }) => {
  test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan credenciales');
  const login = new LoginPage(page); const org = new OrganizationPage(page); const dashboard = new DashboardPage(page); const projects = new ProjectsPage(page);
  await login.open(); await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) { await org.select(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe'); await org.continue(); }
  await login.expectAuthenticated(); await dashboard.expectLoaded(); await projects.open();
  const name = `QA-Athenea-M02-22-${Date.now()}`;
  await page.getByRole('button', { name: /Crear Proyecto/i }).click();
  const form = page.locator('form').filter({ has: page.getByRole('textbox') }).last(); await form.getByRole('textbox').first().fill(name);
  await page.getByRole('button', { name: /Siguiente|Continuar/i }).last().click();
  const portfolio = page.locator('select:visible').first(); await page.waitForTimeout(1000); const options = await portfolio.locator('option').evaluateAll(opts => opts.map(o => ({ text:o.textContent?.trim(), value:(o as HTMLOptionElement).value })));
  const valid = options.find(o => o.value && !/no.?portafolio|no.?portfolio/i.test(o.text ?? '')); if (!valid) throw new Error('No hay portafolio válido'); await portfolio.selectOption(valid.value);
  await page.getByRole('button', { name: /Siguiente|Continuar/i }).last().click(); await page.getByRole('button', { name: /Siguiente|Continuar|Crear Proyecto|Finalizar/i }).last().click();
  await page.getByText('Básico', { exact: true }).click(); await page.getByRole('button', { name: /Crear Proyecto|Finalizar|Guardar/i }).last().click();
  await expect(page).toHaveURL(/Projects\/Details/i, { timeout: 20_000 }); await expect(page.locator('body')).toContainText(name);
  await page.locator('button.btn.btn-outline-secondary.btn-sm.dropdown-toggle-no-caret').click();
  await page.getByText(/Archivar proyecto|Archivar/i).last().click();
  const confirm = page.getByRole('button', { name: /Sí, archivar|Archivar|Confirmar/i }).last(); await expect(confirm).toBeVisible(); await confirm.click();
  await page.goto('/Projects/Index', { waitUntil: 'domcontentloaded' });
  const archivedCard = page.locator('.project-card').filter({ hasText: name });
  await expect(archivedCard).toContainText(/Archivado|Archived/i, { timeout: 20_000 });
  await archivedCard.click();
  await page.locator('button.btn.btn-outline-secondary.btn-sm.dropdown-toggle-no-caret').click();
  await page.getByText(/Restaurar proyecto|Restaurar/i).last().click();
  const restore = page.getByRole('button', { name: /Sí, restaurar|Restaurar|Confirmar/i }).last();
  if (await restore.isVisible().catch(() => false)) await restore.click();
  await page.goto('/Projects/Index', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.project-card').filter({ hasText: name })).toContainText(/Activo|Active/i, { timeout: 20_000 });
});
