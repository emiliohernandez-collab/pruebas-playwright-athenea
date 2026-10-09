import dotenv from 'dotenv';
import { defineConfig, devices } from '@playwright/test';

dotenv.config({ override: true });

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: process.env.ATHENEA_BASE_URL ?? 'https://ribbit.com.mx:8089',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    ...devices['Desktop Chrome'],
  },
});
