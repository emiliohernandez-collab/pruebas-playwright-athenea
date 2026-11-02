const fs = require('node:fs/promises');
const path = require('node:path');
require('dotenv').config();
const { chromium } = require('@playwright/test');

(async () => {
  const user = process.env.ATHENEA_USER;
  const password = process.env.ATHENEA_PASSWORD;
  if (!user || !password) throw new Error('Faltan credenciales.');
  const baseURL = process.env.ATHENEA_BASE_URL || 'https://ribbit.com.mx:8089';
  const authDir = path.resolve('auth');
  await fs.mkdir(authDir, { recursive: true });
  const context = await chromium.launchPersistentContext(path.join(authDir, 'qa-checkout-stripe-profile-fresh'), {
    channel: process.env.ATHENEA_BROWSER_CHANNEL || 'chrome',
    headless: false,
    ignoreHTTPSErrors: true,
    viewport: { width: 1440, height: 900 },
  });
  const page = context.pages()[0] || await context.newPage();
  try {
    await page.goto(`${baseURL}${process.env.ATHENEA_LOGIN_PATH || '/Account/Login'}`, { waitUntil: 'commit', timeout: 30000 }).catch((e) => {
      if (!String(e).includes('ERR_ABORTED')) throw e;
    });
    await page.getByLabel(/correo electrónico/i).waitFor({ state: 'visible', timeout: 30000 });
    await page.getByLabel(/correo electrónico/i).fill(user);
    await page.getByLabel(/contraseña/i).fill(password);
    await page.getByRole('button', { name: /iniciar sesión|entrar|login/i, exact: true }).click();
    await page.waitForTimeout(8000);
    if (await page.getByText(/error interno del servidor|invalid credentials|credenciales inválidas/i).isVisible().catch(() => false)) {
      throw new Error('El login QA no fue aceptado; no se guardó el estado de sesión.');
    }
    if (/SelectOrganizationAtLogin/i.test(page.url()) || await page.getByRole('heading', { name: /seleccionar organización/i }).isVisible().catch(() => false)) {
      const organization = process.env.ATHENEA_ORGANIZATION || 'QA Checkout Stripe';
      await page.getByText(organization, { exact: true }).click();
      await page.getByRole('button', { name: /continuar/i, exact: true }).click();
      await page.waitForTimeout(1500);
    }
    await page.goto(`${baseURL}/Tasks/MyTasks`, { waitUntil: 'commit', timeout: 30000 }).catch((e) => {
      if (!String(e).includes('ERR_ABORTED')) throw e;
    });
    if (/Account\/Login/i.test(page.url())) throw new Error('La sesión QA no quedó autenticada; no se guardó el estado.');
    const organization = process.env.ATHENEA_ORGANIZATION || 'QA Checkout Stripe';
    const switcher = page.locator('button').filter({ hasText: /Ribbit|QA Checkout Stripe/ }).first();
    if (await switcher.isVisible().catch(() => false)) {
      await switcher.click();
      const option = page.getByText(organization, { exact: true }).last();
      if (await option.isVisible().catch(() => false)) await option.click();
      await page.waitForTimeout(1500);
    }
    await page.context().storageState({ path: path.join(authDir, 'qa-checkout-stripe.json') });
    console.log('QA session saved');
  } finally {
    await context.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
