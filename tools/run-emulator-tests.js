#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const context = {
  console,
  setTimeout,
  clearTimeout,
  Date,
  Math,
  JSON,
  RegExp,
  String,
  Number,
  Boolean,
  Array,
  Object,
  Map,
  Set,
  Error,
  URLSearchParams,
  window: null,
  document: {
    readyState: "complete",
    body: { classList: { contains: () => false } },
    addEventListener: () => {},
    getElementById: () => null,
    querySelector: () => null,
    createElement: () => ({
      setAttribute: () => {},
      appendChild: () => {},
      addEventListener: () => {},
      classList: { add: () => {}, remove: () => {}, contains: () => false }
    }),
    head: { appendChild: () => {} },
    scripts: []
  },
  navigator: { userAgent: "node-test-runner" },
  localStorage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  }
};
context.window = context;
context.global = context;

const sandbox = vm.createContext(context);

function loadScript(file) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) {
    throw new Error(`Missing required file: ${file}`);
  }
  const code = fs.readFileSync(full, "utf8");
  vm.runInContext(code, sandbox, { filename: file });
}

function compactAudit(audit) {
  const checks = audit.checks || [];
  return {
    scenarios: audit.scenarios || 0,
    summary: audit.summary || {},
    errors: checks.filter((item) => item.severity === "error").slice(0, 30),
    warnings: checks.filter((item) => item.severity === "warning").slice(0, 30)
  };
}

function countSmokeFailures(smoke) {
  return Object.values(smoke || {}).reduce((sum, result) => sum + Number(result.failed || 0), 0);
}

function main() {
  [
    "stateManager.js",
    "scenarioEngine.js",
    "lesson-audit-core.js",
    "lesson-scenario-audit.js",
    "terminal-emulator-smoke.js"
  ].forEach(loadScript);

  if (!sandbox.StateManager) throw new Error("StateManager did not load.");
  if (!sandbox.ScenarioEngine) throw new Error("ScenarioEngine did not load.");
  if (!sandbox.NetlabEmulatorSmokeTest) throw new Error("NetlabEmulatorSmokeTest did not load.");
  if (!sandbox.NetlabLessonScenarioAudit) throw new Error("NetlabLessonScenarioAudit did not load.");

  const smoke = sandbox.NetlabEmulatorSmokeTest.run();
  const audit = sandbox.NetlabLessonScenarioAudit.run();
  const auditCompact = compactAudit(audit);

  const report = {
    generatedAt: new Date().toISOString(),
    smoke,
    audit: auditCompact
  };

  const outDir = path.join(root, "test-results");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "emulator-test-report.json"), JSON.stringify(report, null, 2));

  console.log("\n=== Emulator Smoke Summary ===");
  console.log(JSON.stringify(smoke, null, 2));
  console.log("\n=== Lesson Audit Summary ===");
  console.log(JSON.stringify(auditCompact.summary, null, 2));

  if (auditCompact.errors.length) {
    console.log("\n=== First Audit Errors ===");
    console.log(JSON.stringify(auditCompact.errors, null, 2));
  }

  if (auditCompact.warnings.length) {
    console.log("\n=== First Audit Warnings ===");
    console.log(JSON.stringify(auditCompact.warnings, null, 2));
  }

  const smokeFailures = countSmokeFailures(smoke);
  const auditErrors = Number(auditCompact.summary.error || 0);

  if (smokeFailures || auditErrors) {
    console.error(`\nTest run failed. Smoke failures: ${smokeFailures}. Audit errors: ${auditErrors}.`);
    process.exit(1);
  }

  console.log("\nAll emulator smoke tests passed and no audit errors were found.");
}

try {
  main();
} catch (error) {
  console.error(error.stack || error.message || String(error));
  process.exit(1);
}
