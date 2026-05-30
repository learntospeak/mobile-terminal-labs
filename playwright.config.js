const { defineConfig } = require("@playwright/test");

const webServerCommand = process.platform === "win32"
  ? "node tests/functional/static-server.js"
  : "command -v node >/dev/null 2>&1 && node tests/functional/static-server.js || python3 -m http.server 4173 --bind 127.0.0.1";

module.exports = defineConfig({
  testDir: "./tests/functional",
  timeout: 60_000,
  expect: {
    timeout: 10_000
  },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [
    ["list"],
    ["./tests/functional/smoke-reporter.js"]
  ],
  use: {
    baseURL: "http://127.0.0.1:4173",
    headless: true,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure"
  },
  webServer: {
    command: webServerCommand,
    url: "http://127.0.0.1:4173/index.html",
    reuseExistingServer: true,
    timeout: 30_000
  }
});
