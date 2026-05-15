const { spawnSync } = require("child_process");
const path = require("path");

const cliPath = path.join(__dirname, "..", "..", "node_modules", "@playwright", "test", "cli.js");
const result = spawnSync(
  process.execPath,
  [
    cliPath,
    "test",
    "tests/functional/terminal-journey-comprehensive.spec.js",
    "--config=playwright.config.js"
  ],
  {
    cwd: path.join(__dirname, "..", ".."),
    env: {
      ...process.env,
      TERMINAL_JOURNEY_LIMIT: "all"
    },
    stdio: "inherit"
  }
);

process.exit(result.status || 0);
