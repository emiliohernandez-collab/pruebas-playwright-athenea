import dotenv from 'dotenv';
import { defineConfig, devices } from '@playwright/test';

// Las variables del proceso (por ejemplo, otro rol durante una ejecución) deben
// tener prioridad sobre el archivo local .env. Nunca se guardan credenciales en el repo.
dotenv.config();

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: process.env.ATHENEA_BASE_URL ?? 'https://ribbit.com.mx:8089',
    channel: process.env.ATHENEA_BROWSER_CHANNEL ?? 'chrome',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    ...devices['Desktop Chrome'],
  },
});
