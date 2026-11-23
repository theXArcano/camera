import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30_000,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    permissions: ['camera', 'microphone'],
    launchOptions: {
      args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
    },
  },
  projects: [{ name: 'iphone-chromium', use: { ...devices['iPhone 14 Plus'], browserName: 'chromium' } }],
  webServer: {
    command: 'npx --yes http-server -p 4173 -c-1 -s .',
    port: 4173,
    reuseExistingServer: !process.env.CI,
  },
});
