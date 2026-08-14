import { defineConfig, devices } from '@playwright/test';

// Deliberately not a popular dev-server port. `reuseExistingServer` cannot tell whose server
// is on the port, so a collision with an unrelated project would silently run the whole suite
// against the wrong site.
export const PORT = 8391;
export const BASE_URL = `http://localhost:${PORT}`;

/**
 * Supported viewports (research R7). The responsive, keyboard, and accessibility specs import
 * this list so a breakpoint is added in exactly one place.
 */
export const VIEWPORTS = [
  { name: 'mobile', width: 320, height: 640 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1024, height: 768 },
];

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? 'list' : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1024, height: 768 } },
    },
  ],
  webServer: {
    command: 'node tests/static-server.js',
    url: BASE_URL,
    // Always start our own: reusing whatever answers on the port is how a suite ends up
    // green against somebody else's application.
    reuseExistingServer: false,
    stdout: 'ignore',
  },
});
