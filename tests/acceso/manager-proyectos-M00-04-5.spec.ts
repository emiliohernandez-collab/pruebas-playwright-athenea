import { expect, test } from '@playwright/test';
import path from 'node:path';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { MyDataPage } from '../pages/MyDataPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M00-04-5 — Manager Proyectos — Cambiar mi foto de perfil', async ({ page }, testInfo) => {
  test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan credenciales');
  const login = new LoginPage(page); const org = new OrganizationPage(page); const dashboard = new DashboardPage(page); const myData = new MyDataPage(page);
  await login.open(); await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) { await page.getByText(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe', { exact: true }).click(); await org.continue(); }
  await login.expectAuthenticated(); await dashboard.expectLoaded();
  await page.getByRole('button', { name: /Demo Manager Proyectos|Manager Proyectos/i }).first().click();
  await page.getByRole('link', { name: /Mi Cuenta/i }).click();
  await expect(page).toHaveURL(/Account\/MyData/i);
  const before = await myData.avatarSource();
  await myData.uploadAvatar(path.resolve('tests/fixtures/profile-test.png'));
  await myData.save();
  await page.reload();
  const after = await myData.avatarSource();
  expect(after).toBeTruthy(); expect(after).not.toBe(before);
  await testInfo.attach('manager-proyectos-foto-actualizada', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
});
