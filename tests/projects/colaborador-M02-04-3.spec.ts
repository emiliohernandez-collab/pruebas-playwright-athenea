import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M02-04-3 — Colaborador — Renombrar y describir archivo', async ({ page }) => {
  test.fixme(true, 'Bloqueado: no existe una fila de archivo persistida disponible para editar en Athenea Demo.');
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
  const orgSwitcher = page.getByText('QA Checkout Stripe', { exact: true }).first();
  if (await orgSwitcher.count()) {
    await orgSwitcher.click();
    await page.getByText('Athenea Demo.', { exact: true }).click();
    await page.waitForTimeout(500);
  }
  await page.goto('/Projects/Index');
  await page.getByText('Desarrollo App Móvil', { exact: true }).click();
  await page.getByText(/Archivos|Files/i).first().click();
  console.log('file matches', await page.locator('body').innerText());
  console.log('file elements', await page.locator('[title], [aria-label], [data-bs-toggle], button, a').evaluateAll(els => els.map((e: any) => ({tag:e.tagName,text:(e.innerText||'').trim(),title:e.title,aria:e.getAttribute('aria-label'),href:e.getAttribute('href'),toggle:e.getAttribute('data-bs-toggle')})).filter(x => /archivo|file|png|editar|edit/i.test(`${x.text} ${x.title} ${x.aria} ${x.href}`))));
  await expect(page.locator('body')).toContainText(/archivo|file/i);
});
