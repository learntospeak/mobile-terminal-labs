const { test, expect } = require("@playwright/test");
const {
  attachSmokeData,
  createSmokeReport,
  gotoAndStabilize,
  observePage,
  pushCheck,
  pushWarning
} = require("./smoke-helpers");

test.describe.configure({ timeout: 300_000 });
test.use({ screenshot: "off", trace: "off", video: "off" });

const TRACKS = [
  { name: "Windows Beginner", url: "/terminal-coach.html?track=windows&mode=beginner&skipIntro=1" },
  { name: "Linux", url: "/terminal-coach.html?track=linux" },
  { name: "Cisco", url: "/cisco-cli-lab.html" }
];

const PLACEHOLDER_PATTERNS = [
  /\bundefined\b/i,
  /\bnull\b/i,
  /\btodo\b/i,
  /\bfixme\b/i,
  /`{2}/
];

async function dismissEntryModals(page) {
  for (const selector of ["#beginnerOnboardingStartBtn", "#ticketBriefingStartBtn", "#startScenarioBtn"]) {
    const button = page.locator(selector).first();
    if (await button.isVisible().catch(() => false)) {
      await button.evaluate((node) => node.click()).catch(() => {});
      await page.waitForTimeout(100);
    }
  }
}

async function loadScenario(page, id) {
  const loaded = await page.evaluate((scenarioId) => window.TerminalEngine?.loadScenarioById?.(scenarioId), id);
  await page.waitForTimeout(150);
  await dismissEntryModals(page);
  return Boolean(loaded);
}

function badTextReason(text) {
  const value = String(text || "");
  const bad = PLACEHOLDER_PATTERNS.find((pattern) => pattern.test(value));
  return bad ? `contains ${bad}` : "";
}

async function collectScenarioContracts(page) {
  return page.evaluate(() => {
    const backtickCommands = (values = []) => values.flatMap((value) =>
      Array.from(String(value || "").matchAll(/`([^`]+)`/g)).map((match) => match[1].trim()).filter(Boolean)
    );

    const isRunnable = (value) => {
      const command = String(value || "").trim();
      return Boolean(command)
        && !/^use\b/i.test(command)
        && !/^(?:>|#|\(config[^)]*\)#|[A-Za-z0-9_-]+[>#])$/.test(command);
    };

    const commandCandidates = (step = {}) => {
      const candidates = [
        ...backtickCommands(step.hints || []),
        ...backtickCommands([step.commandHint, step.explanation, step.whyThisMatters]),
        step.demoCommand,
        ...(Array.isArray(step.walkthrough) ? step.walkthrough.map((entry) => entry?.command) : [])
      ].map((value) => String(value || "").trim()).filter(isRunnable);

      return [...new Set(candidates)];
    };

    return (window.TerminalEngine?.getScenarios?.() || []).map((scenario) => ({
      id: scenario.id,
      title: scenario.title,
      shell: scenario.shell || scenario.environment?.platform || "",
      commandFocus: scenario.commandFocus || [],
      steps: (scenario.steps || []).map((step, index) => ({
        index,
        objective: step.objective || "",
        commandFamily: step.commandFamily || "",
        hints: step.hints || [],
        demoCommand: step.demoCommand || "",
        candidates: commandCandidates(step),
        acceptsCount: Array.isArray(step.accepts) ? step.accepts.length : 0
      }))
    }));
  });
}

test("Static lab contract audit: scenarios expose coherent commands and text", async ({ browser }, testInfo) => {
  const report = createSmokeReport("Static Lab Contract Audit", "terminal scenario contracts");
  const failures = [];

  for (const track of TRACKS) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 860 } });
    observePage(page, report);
    await gotoAndStabilize(page, track.url);
    const scenarios = await collectScenarioContracts(page);

    pushCheck(report, `${track.name}: scenarios available`, scenarios.length > 0, String(scenarios.length));
    if (!scenarios.length) {
      failures.push(`${track.name}: no scenarios exposed`);
    }

    for (const scenario of scenarios) {
      if (!scenario.id || !scenario.title) failures.push(`${track.name}: scenario missing id/title`);
      if (!scenario.steps.length) failures.push(`${track.name}/${scenario.id}: no steps`);
      if (!Array.isArray(scenario.commandFocus) || !scenario.commandFocus.length) {
        pushWarning(report, `${track.name}/${scenario.id}: commandFocus is empty`);
      }

      for (const step of scenario.steps) {
        const label = `${track.name}/${scenario.id} step ${step.index + 1}`;
        if (!step.objective.trim()) failures.push(`${label}: missing objective`);
        for (const [field, value] of Object.entries({
          objective: step.objective,
          demoCommand: step.demoCommand,
          hints: step.hints.join(" | ")
        })) {
          const reason = badTextReason(value);
          if (reason) failures.push(`${label}: ${field} ${reason}`);
        }
        if (!step.candidates.length && !step.acceptsCount) {
          failures.push(`${label}: no command candidate or accept rule`);
        }
        if (step.demoCommand && badTextReason(step.demoCommand)) {
          failures.push(`${label}: demo command looks malformed: ${step.demoCommand}`);
        }
      }
    }

    await page.close();
  }

  failures.forEach((failure) => pushWarning(report, failure));
  pushCheck(report, "scenario contracts have no obvious impossible or placeholder steps", failures.length === 0, failures.slice(0, 40).join(" | "));
  await attachSmokeData(testInfo, report);
  expect(failures, failures.slice(0, 40).join("\n")).toEqual([]);
});

test("Mobile command controls: every scenario exposes clean command choices on first step", async ({ browser }, testInfo) => {
  const report = createSmokeReport("Mobile Command Control Audit", "mobile terminal command controls");
  const failures = [];

  for (const track of TRACKS) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    observePage(page, report);
    await gotoAndStabilize(page, track.url);
    const scenarios = await collectScenarioContracts(page);

    for (const scenario of scenarios) {
      const loaded = await loadScenario(page, scenario.id);
      if (!loaded) {
        failures.push(`${track.name}/${scenario.id}: scenario did not load on mobile`);
        continue;
      }

      const choices = await page.locator("[data-mobile-command-choice]").evaluateAll((nodes) =>
        nodes.map((node) => node.getAttribute("data-mobile-command-choice") || "").filter(Boolean)
      );
      const duplicateChoices = choices.filter((choice, index) => choices.indexOf(choice) !== index);
      const malformedChoices = choices.filter((choice) => badTextReason(choice) || /^use\b/i.test(choice));

      pushCheck(report, `${track.name}/${scenario.id}: mobile choices visible`, choices.length > 0, choices.join(" | "));
      if (!choices.length) failures.push(`${track.name}/${scenario.id}: no mobile command choices visible`);
      if (duplicateChoices.length) failures.push(`${track.name}/${scenario.id}: duplicate mobile choices: ${[...new Set(duplicateChoices)].join(", ")}`);
      if (malformedChoices.length) failures.push(`${track.name}/${scenario.id}: malformed mobile choices: ${malformedChoices.join(", ")}`);
    }

    await page.close();
  }

  failures.forEach((failure) => pushWarning(report, failure));
  pushCheck(report, "mobile command controls are present and clean", failures.length === 0, failures.slice(0, 40).join(" | "));
  await attachSmokeData(testInfo, report);
  expect(failures, failures.slice(0, 40).join("\n")).toEqual([]);
});

test("Virtual filesystem properties: Windows and Linux paths behave consistently", async ({ page }, testInfo) => {
  const report = createSmokeReport("Virtual Filesystem Properties", "/terminal-coach.html?track=windows&mode=beginner&skipIntro=1");
  observePage(page, report);
  await gotoAndStabilize(page, report.url);

  const results = await page.evaluate(() => {
    const checks = [];
    const check = (name, ok, details = "") => checks.push({ name, ok: Boolean(ok), details });

    const windows = window.StateManager.createState({
      platform: "cmd",
      cwd: "C:/Lab/Notes",
      directories: ["C:/Lab", "C:/Lab/Notes", "C:/Lab/Reports"],
      files: [
        { path: "C:/Lab/Notes/ticket-note.txt", content: "ticket\n" },
        { path: "C:/Lab/Notes/hidden-plan.txt", content: "hidden\n", hidden: true }
      ]
    });

    check("Windows full path normalizes backslashes", window.StateManager.normalizePath(windows, "C:\\Lab\\Reports") === "C:/Lab/Reports");
    check("Windows relative read uses cwd", window.StateManager.readFile(windows, "ticket-note.txt").ok);
    window.StateManager.copyPath(windows, "ticket-note.txt", "C:/Lab/Reports/");
    check("Windows copy into folder creates destination file", window.StateManager.readFile(windows, "C:/Lab/Reports/ticket-note.txt").ok);
    window.StateManager.changeDirectory(windows, "C:/Lab/Reports");
    check("Windows copied file opens relative from destination", window.StateManager.readFile(windows, "ticket-note.txt").ok);
    check("Windows copied file is not a directory", window.StateManager.getNode(windows, "ticket-note.txt")?.type === "file");
    check("Windows hidden files are excluded by default", !window.StateManager.listChildren(windows, "C:/Lab/Notes", false).some((node) => node.name === "hidden-plan.txt"));
    check("Windows hidden files appear when requested", window.StateManager.listChildren(windows, "C:/Lab/Notes", true).some((node) => node.name === "hidden-plan.txt"));

    const linux = window.StateManager.createState({
      platform: "linux",
      cwd: "/home/student/notes",
      home: "/home/student",
      directories: ["/home/student", "/home/student/notes", "/home/student/reports"],
      files: [{ path: "/home/student/notes/case-note.txt", content: "case\n" }]
    });

    check("Linux relative read uses cwd", window.StateManager.readFile(linux, "case-note.txt").ok);
    check("Linux tilde path normalizes to home", window.StateManager.normalizePath(linux, "~/reports") === "/home/student/reports");
    window.StateManager.copyPath(linux, "case-note.txt", "/home/student/reports/");
    check("Linux copy into folder creates destination file", window.StateManager.readFile(linux, "/home/student/reports/case-note.txt").ok);
    window.StateManager.movePath(linux, "/home/student/reports/case-note.txt", "/home/student/reports/final-note.txt");
    check("Linux move removes source", !window.StateManager.getNode(linux, "/home/student/reports/case-note.txt"));
    check("Linux move creates target", window.StateManager.readFile(linux, "/home/student/reports/final-note.txt").ok);

    return checks;
  });

  const failures = results.filter((item) => !item.ok).map((item) => `${item.name}: ${item.details}`);
  results.forEach((item) => pushCheck(report, item.name, item.ok, item.details));
  await attachSmokeData(testInfo, report);
  expect(failures, failures.join("\n")).toEqual([]);
});
