import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { MyDataPage } from '../pages/MyDataPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M00-03-5 — Manager Proyectos — Editar mis datos', async ({ page }, testInfo) => {
  test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan credenciales');
  const login = new LoginPage(page);
  const org = new OrganizationPage(page);
  const dashboard = new DashboardPage(page);
  const myData = new MyDataPage(page);
  await login.open();
  await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) { await page.getByText(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe', { exact: true }).click(); await org.continue(); }
  await login.expectAuthenticated();
  await dashboard.expectLoaded();
  await page.getByRole('button', { name: /Demo Manager Proyectos|Manager Proyectos/i }).first().click();
  await page.getByRole('link', { name: /Mi Cuenta/i }).click();
  await expect(page).toHaveURL(/Account\/MyData/i);
  const original = await myData.values();
  const marker = Date.now();
  try {
    await myData.fill(`QA Manager ${marker}`, original.lastName, '5555555555');
    await myData.save();
    await page.reload();
    expect((await myData.values()).firstName).toBe(`QA Manager ${marker}`);
    expect((await myData.values()).phone.replace(/\D/g, '')).toBe('5555555555');
    await testInfo.attach('manager-proyectos-datos-editados', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
  } finally {
    await myData.fill(original.firstName, original.lastName, original.phone);
    await myData.save();
  }
});
