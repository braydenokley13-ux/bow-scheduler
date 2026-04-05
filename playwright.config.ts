import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  use: {
    baseURL: "http://127.0.0.1:3001",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 3001",
    url: "http://127.0.0.1:3001",
    reuseExistingServer: !process.env.CI,
    env: {
      BOOKING_BACKEND_MODE: "mock",
      AUTH_SECRET: "playwright-secret-for-local-testing",
      ADMIN_PASSWORD: "preview-access",
      NEXT_PUBLIC_SITE_URL: "http://127.0.0.1:3001",
    },
  },
})
