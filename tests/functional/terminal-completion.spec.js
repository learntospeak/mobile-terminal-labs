const { test, expect } = require("@playwright/test");
const {
  addLabHealth,
  attachSmokeData,
  createSmokeReport,
  gotoAndStabilize,
  observePage,
  pushCheck,
  pushWarning,
  runTerminalCommand
} = require("./smoke-helpers");

const TRACKS = [
  {
    name: "Windows Beginner",
    url: "/terminal-coach.html?track=windows&mode=beginner&skipIntro=1",
    beginnerOnly: true
  },
  {
    name: "Linux",
    url: "/terminal-coach.html?track=linux"
  },
  {
    name: "Cisco",
    url: "/cisco-cli-lab.html"
  }
];

test.describe.configure({ timeout: 1_200_000 });
test.use({ screenshot: "off", trace: "off", video: "off" });

function parseLimit() {
  const raw = process.env.TERMINAL_COMPLETION_LIMIT;
  if (!raw || raw.toLowerCase() === "all") return Infinity;
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : Infinity;
}

async function startLoadedScenario(page) {
  for (const selector of ["#beginnerOnboardingStartBtn", "#ticketBriefingStartBtn", "#startScenarioBtn"]) {
    const button = page.locator(selector).first();
    if (await button.isVisible().catch(() => false)) {
      await button.evaluate((node) => node.click()).catch(() => {});
      await page.waitForTimeout(150);
    }
  }
}

async function scenarioInventory(page, beginnerOnly = false) {
  return page.evaluate((onlyBeginner) => {
    const beginnerIds = new Set(
      (window.ScenarioEngine?.beginnerLabLevels?.windows || [])
        .flatMap((level) => level.scenarioIds || [])
    );

    const isRunnableCommand = (value) => {
      const command = String(value || "").trim();
      return Boolean(command)
        && !/^Use\b/i.test(command)
        && !/^(?:>|#|\(config[^)]*\)#|[A-Za-z0-9_-]+[>#])$/.test(command);
    };

    const extractBacktickCommand = (value) => {
      const match = String(value || "").match(/`([^`]+)`/);
      return match ? match[1].trim() : "";
    };

    const extractBacktickCommands = (value) => Array.from(String(value || "").matchAll(/`([^`]+)`/g))
      .map((match) => match[1].trim())
      .filter(Boolean);

    const extractPreferredHintCommand = (hints = []) => {
      const tryCommands = hints
        .map((hint) => String(hint || ""))
        .filter((hint) => /\btry\b/i.test(hint))
        .flatMap(extractBacktickCommands)
        .filter(isRunnableCommand);
      const tryHint = tryCommands[tryCommands.length - 1];
      return tryHint || hints.map(extractBacktickCommand).find(isRunnableCommand) || "";
    };

    const commandForStep = (step, scenario) => {
      if (!step) return "";
      const fileCreationRule = (step.accepts || []).find((rule) => rule?.command === "echo" && rule.fileExists);
      if (fileCreationRule) return `echo checked > ${fileCreationRule.fileExists}`;
      const verifyFileMatch = String(step.objective || "").match(/^Verify\s+([^\s]+)\s+opens\.?$/i);
      if (verifyFileMatch) {
        const fileName = verifyFileMatch[1];
        return scenario?.shell === "cmd" || scenario?.environmentCategory === "windows"
          ? `type C:\\Lab\\Reports\\${fileName}`
          : `cat /home/student/reports/${fileName}`;
      }
      const hinted = extractPreferredHintCommand(step.hints || []);
      if (hinted) return hinted;
      const commandHint = extractBacktickCommand(step.commandHint);
      if (isRunnableCommand(commandHint)) return commandHint;
      if (Array.isArray(step.walkthrough) && step.walkthrough[0]?.command) {
        return String(step.walkthrough[0].command).trim();
      }
      if (step.demoCommand) return String(step.demoCommand).trim();
      const acceptRule = (step.accepts || []).find((rule) => rule && (rule.command || rule.finalCwd));
      if (acceptRule?.finalCwd) return `cd ${acceptRule.finalCwd}`;
      if (acceptRule?.command) return String(acceptRule.command).trim();
      const objective = String(step.objective || "").toLowerCase();
      if (objective.includes("full tcp port scan")) return "nmap -p- custom-app";
      if (objective.includes("real smtp service")) return "nc metasploitable2 25";
      if (objective.includes("port 443")) return "nc web-lab 443";
      return "";
    };

    return (window.TerminalEngine?.getScenarios?.() || [])
      .filter((scenario) => !onlyBeginner || beginnerIds.has(scenario.id))
      .map((scenario) => ({
        id: scenario.id,
        title: scenario.title,
        shell: scenario.shell,
        steps: (scenario.steps || []).map((step, index) => ({
          index,
          objective: step.objective || "",
          command: commandForStep(step, scenario)
        }))
      }));
  }, beginnerOnly);
}

async function loadScenario(page, id) {
  const loaded = await page.evaluate((scenarioId) => window.TerminalEngine?.loadScenarioById?.(scenarioId), id);
  await page.waitForTimeout(180);
  await startLoadedScenario(page);
  return Boolean(loaded);
}

async function mobileChoices(page) {
  return page.locator("[data-mobile-command-choice]").evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute("data-mobile-command-choice") || "")
  );
}

async function clickMobileChoice(page, command) {
  return page.evaluate((target) => {
    const button = Array.from(document.querySelectorAll("[data-mobile-command-choice]"))
      .find((node) => (node.getAttribute("data-mobile-command-choice") || "").trim().toLowerCase() === target.trim().toLowerCase());
    if (!button) return false;
    button.click();
    return true;
  }, command);
}

async function waitForProgress(page, before) {
  await page.waitForFunction((snapshot) => {
    const after = window.TerminalEngine?.getRuntimeSnapshot?.();
    return Boolean(after?.scenarioCompleted || after?.stepIndex > snapshot.stepIndex);
  }, before, { timeout: 5_000 });
}

async function replayMobilePath(page, scenarioId, commands) {
  await loadScenario(page, scenarioId);
  for (const command of commands) {
    const before = await page.evaluate(() => window.TerminalEngine?.getRuntimeSnapshot?.());
    await clickMobileChoice(page, command);
    await waitForProgress(page, before).catch(() => {});
  }
}

async function runDesktopScenario(page, report, track, scenario) {
  const failures = [];
  const loaded = await loadScenario(page, scenario.id);
  if (!loaded) return [`${track.name}/${scenario.id}: scenario did not load`];

  for (const step of scenario.steps) {
    if (!step.command) {
      failures.push(`${track.name}/${scenario.id} step ${step.index + 1}: no runnable command found`);
      break;
    }

    const before = await page.evaluate(() => window.TerminalEngine?.getRuntimeSnapshot?.());
    const result = await runTerminalCommand(page, step.command);
    report.commandResults.push({ ...result, command: `${track.name}/${scenario.id}: ${result.command}` });
    const after = await page.evaluate(() => window.TerminalEngine?.getRuntimeSnapshot?.());
    const moved = Boolean(after?.scenarioCompleted || after?.stepIndex > before?.stepIndex);

    if (!moved) {
      failures.push(`${track.name}/${scenario.id} step ${step.index + 1}: desktop command "${step.command}" did not progress`);
      break;
    }

    if (after?.scenarioCompleted) break;
  }

  return failures;
}

async function runMobileScenario(page, report, track, scenario) {
  const failures = [];
  const loaded = await loadScenario(page, scenario.id);
  if (!loaded) return [`${track.name}/${scenario.id}: scenario did not load`];
  const completedPath = [];

  for (const step of scenario.steps) {
    const choices = await mobileChoices(page);
    const hasExpectedCommand = step.command
      ? choices.some((choice) => choice.trim().toLowerCase() === step.command.trim().toLowerCase())
      : false;
    pushCheck(report, `${track.name}/${scenario.id} step ${step.index + 1}: mobile choice includes expected command`, hasExpectedCommand, `${step.command || "unknown"} in [${choices.join(" | ")}]`);
    if (!hasExpectedCommand) {
      failures.push(`${track.name}/${scenario.id} step ${step.index + 1}: expected mobile command "${step.command || "unknown"}" was not visible. Choices: ${choices.join(" | ")}`);
      break;
    }

    if (!choices.length) {
      failures.push(`${track.name}/${scenario.id} step ${step.index + 1}: no mobile choices shown for "${step.objective}"`);
      break;
    }

    const before = await page.evaluate(() => window.TerminalEngine?.getRuntimeSnapshot?.());
    await clickMobileChoice(page, step.command);
    await waitForProgress(page, before).catch(() => {});
    const after = await page.evaluate(() => window.TerminalEngine?.getRuntimeSnapshot?.());
    const moved = Boolean(after?.scenarioCompleted || after?.stepIndex > before?.stepIndex);
    report.commandResults.push({
      command: `${track.name}/${scenario.id}: ${step.command}`,
      accepted: moved,
      progressed: moved,
      notes: step.objective
    });

    if (!moved) {
      failures.push(`${track.name}/${scenario.id} step ${step.index + 1}: visible expected mobile command "${step.command}" did not progress "${step.objective}". Choices: ${choices.join(" | ")}`);
      break;
    }

    completedPath.push(step.command);
    if (after?.scenarioCompleted) break;
  }

  return failures;
}

async function runCompletionSuite(browser, report, mode) {
  const limit = parseLimit();
  const failures = [];
  const viewport = mode === "mobile" ? { width: 390, height: 844 } : { width: 1280, height: 860 };

  for (const track of TRACKS) {
    const page = await browser.newPage({ viewport });
    observePage(page, report);
    await gotoAndStabilize(page, track.url);
    await page.evaluate(() => localStorage.setItem("networkingGame.explainerSeen.ping", "1")).catch(() => {});

    const scenarios = (await scenarioInventory(page, Boolean(track.beginnerOnly))).slice(0, limit);
    pushCheck(report, `${mode}: ${track.name} scenarios discovered`, scenarios.length > 0, String(scenarios.length));
    addLabHealth(report, { pagesTested: [`${mode} ${track.name}`] });

    for (const scenario of scenarios) {
      const scenarioFailures = mode === "mobile"
        ? await runMobileScenario(page, report, track, scenario)
        : await runDesktopScenario(page, report, track, scenario);
      failures.push(...scenarioFailures);
      scenarioFailures.forEach((failure) => pushWarning(report, failure));
    }

    await page.close();
  }

  return failures;
}

test("Mobile terminal completion: every lab step has a visible working command choice", async ({ browser }, testInfo) => {
  test.setTimeout(1_200_000);
  const report = createSmokeReport("Mobile Terminal Completion", "mobile terminal labs");
  const failures = await runCompletionSuite(browser, report, "mobile");

  pushCheck(report, "mobile users can complete every tested terminal lab", failures.length === 0, failures.slice(0, 30).join(" | "));
  addLabHealth(report, {
    commandsTested: report.commandResults.map((item) => item.command),
    rejectedReasonableAlternatives: failures
  });
  await attachSmokeData(testInfo, report);
  expect(failures, failures.slice(0, 30).join("\n")).toEqual([]);
});

test("Desktop terminal completion: every lab step accepts its expected command path", async ({ browser }, testInfo) => {
  test.setTimeout(1_200_000);
  const report = createSmokeReport("Desktop Terminal Completion", "desktop terminal labs");
  const failures = await runCompletionSuite(browser, report, "desktop");

  pushCheck(report, "desktop users can complete every tested terminal lab", failures.length === 0, failures.slice(0, 30).join(" | "));
  addLabHealth(report, {
    commandsTested: report.commandResults.map((item) => item.command),
    rejectedReasonableAlternatives: failures
  });
  await attachSmokeData(testInfo, report);
  expect(failures, failures.slice(0, 30).join("\n")).toEqual([]);
});
