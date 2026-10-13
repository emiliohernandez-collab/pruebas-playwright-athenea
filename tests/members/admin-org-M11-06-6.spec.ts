import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrganizationPage } from '../pages/OrganizationPage';

test('M11-06-6 — Administrador Organización — Editar perfil de miembro', async ({ page }) => {
  test.skip(!process.env.ATHENEA_USER || !process.env.ATHENEA_PASSWORD, 'Faltan credenciales');
  const login = new LoginPage(page);
  const org = new OrganizationPage(page);
  const dashboard = new DashboardPage(page);
  await login.open();
  await login.signIn(process.env.ATHENEA_USER!, process.env.ATHENEA_PASSWORD!);
  if (/SelectOrganizationAtLogin/i.test(page.url())) {
    await org.select(process.env.ATHENEA_ORGANIZATION ?? 'QA Checkout Stripe');
    await org.continue();
  }
  await login.expectAuthenticated();
  await dashboard.expectLoaded();
  await page.goto('/OrganizationMembers');
  const targetRow = page.locator('tr').filter({ hasText: /demo\.adminorg@athenea\.local/i }).first();
  console.log('M11-06 target:', await targetRow.innerText().catch(() => 'NO ROW'));
  console.log('M11-06 buttons:', await targetRow.locator('button').evaluateAll(bs => bs.map(b => ({text: b.textContent, title: b.getAttribute('title'), aria: b.getAttribute('aria-label')}))).catch(() => []));
  const removeMember = targetRow.getByRole('button', { name: 'Eliminar' });
  if (await removeMember.count()) {
    await removeMember.click();
    const confirm = page.getByRole('dialog').getByRole('button', { name: /Sí, Eliminar/i });
    if (await confirm.count()) await confirm.click();
    await page.reload();
    await expect(page.locator('tr').filter({ hasText: /demo\.adminorg@athenea\.local/i })).toHaveCount(0);
  }
  const memberRow = page.locator('tr').filter({ hasText: /Demo Administrador Org|Demo QA-M11/i }).first();
  await expect(memberRow).toBeVisible();
  await memberRow.scrollIntoViewIfNeeded();
  const edit = memberRow.locator('button').first();
  await expect(edit).toBeVisible();
  await edit.click();
  const dialog = page.getByRole('dialog');
  console.log('M11-06 selects:', await dialog.locator('select').evaluateAll(els => els.map(e => Array.from(e.options).map(o => o.text))));
  const roleSelect = dialog.locator('select').filter({ has: dialog.locator('option') }).first();
  if (await roleSelect.count()) {
    const adminRole = roleSelect.locator('option').filter({ hasText: /Administrador Organización/i }).first();
    if (await adminRole.count()) {
      await roleSelect.selectOption(await adminRole.getAttribute('value') as string);
      await dialog.getByRole('button', { name: /Guardar|Actualizar/i }).click();
      await expect(page.locator('body')).toContainText(/guardad|actualiz|perfil/i);
    }
  }
  const phone = dialog.locator('input[type="tel"]').first();
  if (await phone.count()) {
    const original = await phone.inputValue();
    await phone.fill('5550000000');
    await dialog.getByRole('button', { name: /Guardar|Actualizar/i }).click();
    await expect(page.locator('body')).toContainText(/guardad|actualiz|perfil/i);
    await memberRow.locator('button').first().click();
    const phoneAgain = page.getByRole('dialog').locator('input[type="tel"]').first();
    await phoneAgain.fill(original);
    await page.getByRole('dialog').getByRole('button', { name: /Guardar|Actualizar/i }).click();
  }
});
