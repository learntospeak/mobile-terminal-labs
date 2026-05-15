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
    name: "Beginner Windows",
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

function parseLimit() {
  const raw = process.env.TERMINAL_JOURNEY_LIMIT;
  if (!raw) return 10;
  if (raw.toLowerCase() === "all") return Infinity;
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : Infinity;
}

function words(value) {
  return String(value || "").trim().split(/\s+/).filter(Boolean).length;
}

async function startLoadedScenario(page) {
  const onboarding = page.locator("#beginnerOnboardingStartBtn");
  if (await onboarding.isVisible().catch(() => false)) {
    await onboarding.click();
    await page.waitForTimeout(150);
  }

  const ticketStart = page.locator("#ticketBriefingStartBtn");
  if (await ticketStart.isVisible().catch(() => false)) {
    await ticketStart.click();
    await page.waitForTimeout(150);
  }

  const startButton = page.locator("#startScenarioBtn");
  if (await startButton.isVisible().catch(() => false)) {
    await startButton.click();
    await page.waitForTimeout(180);
  }

  if (await ticketStart.isVisible().catch(() => false)) {
    await ticketStart.click();
    await page.waitForTimeout(150);
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

    const tryCommandFromText = (value) => {
      const text = String(value || "");
      const tryBacktick = text.match(/\bTry\s+`([^`]+)`/i);
      if (tryBacktick) return tryBacktick[1].trim();
      if (/^Try:/i.test(text)) {
        const backtick = text.match(/`([^`]+)`/);
        if (backtick) return backtick[1].trim();
        return text.replace(/^Try:\s*/i, "").trim();
      }
      return "";
    };

    const commandForStep = (step) => {
      if (!step) return "";
      if (step.demoCommand) return String(step.demoCommand).trim();
      if (Array.isArray(step.walkthrough) && step.walkthrough[0]?.command) {
        return String(step.walkthrough[0].command).trim();
      }
      const hinted = (step.hints || []).map(tryCommandFromText).find(isRunnableCommand);
      if (hinted) return hinted;
      const acceptRule = (step.accepts || []).find((rule) => rule && (rule.command || rule.finalCwd));
      if (acceptRule?.finalCwd) {
        const path = String(acceptRule.finalCwd);
        return path.includes("\\") || /^[A-Z]:/i.test(path) ? `cd ${path}` : `cd ${path}`;
      }
      if (acceptRule?.command) return String(acceptRule.command).trim();
      const generatedHint = tryCommandFromText(step.commandHint);
      if (isRunnableCommand(generatedHint)) return generatedHint;
      return "";
    };

    return (window.TerminalEngine?.getScenarios?.() || [])
      .filter((scenario) => !onlyBeginner || beginnerIds.has(scenario.id))
      .map((scenario) => ({
        id: scenario.id,
        title: scenario.title,
        shell: scenario.shell,
        mode: scenario.mode,
        steps: (scenario.steps || []).map((step, index) => ({
          index,
          objective: step.objective || "",
          command: commandForStep(step),
          hints: step.hints || [],
          acceptsCount: Array.isArray(step.accepts) ? step.accepts.length : 0,
          partialsCount: Array.isArray(step.partials) ? step.partials.length : 0,
          explorationCount: Array.isArray(step.exploration) ? step.exploration.length : 0,
          successFeedback: step.successFeedback || "",
          failureHint: step.failureHint || ""
        }))
      }));
  }, beginnerOnly);
}

function auditScenarioData(report, track, scenarios) {
  const missing = [];
  const noCommand = [];
  const noAlternates = [];
  const thinMistakeFeedback = [];

  scenarios.forEach((scenario) => {
    if (!scenario.id || !scenario.title || !scenario.steps.length) {
      missing.push(`${track.name}: ${scenario.id || scenario.title || "unknown"}`);
    }

    scenario.steps.forEach((step) => {
      const label = `${track.name}: ${scenario.id} step ${step.index + 1}`;
      if (!step.command) noCommand.push(label);
      if (step.acceptsCount <= 1 && step.partialsCount === 0 && step.explorationCount === 0) noAlternates.push(label);
      if (words(step.failureHint) < 5) thinMistakeFeedback.push(label);
    });
  });

  pushCheck(report, `${track.name}: scenario metadata complete`, missing.length === 0, missing.slice(0, 10).join(" | "));
  pushCheck(report, `${track.name}: every step has a runnable smoke command`, noCommand.length === 0, noCommand.slice(0, 10).join(" | "));
  pushCheck(report, `${track.name}: most steps have alternate/partial/exploration support`, noAlternates.length / Math.max(1, scenarios.flatMap((item) => item.steps).length) <= 0.35, `${noAlternates.length} strict steps`);
  pushCheck(report, `${track.name}: mistake feedback has substance`, thinMistakeFeedback.length === 0, thinMistakeFeedback.slice(0, 10).join(" | "));

  noCommand.slice(0, 12).forEach((item) => pushWarning(report, `No runnable smoke command found for ${item}`));
  noAlternates.slice(0, 12).forEach((item) => pushWarning(report, `Strict learner path: ${item}`));
}

async function runScenarioJourney(page, report, track, scenario) {
  await page.evaluate((id) => window.TerminalEngine?.loadScenarioById?.(id), scenario.id);
  await page.waitForTimeout(180);
  await startLoadedScenario(page);

  const beforeStart = await page.evaluate(() => window.TerminalEngine?.getRuntimeSnapshot?.());
  if (!beforeStart?.scenarioStarted) {
    return {
      ok: false,
      label: `${track.name}: ${scenario.id}`,
      reason: "Scenario did not start after pressing available start buttons."
    };
  }

  for (let index = 0; index < scenario.steps.length; index += 1) {
    const step = scenario.steps[index];
    if (!step.command) {
      return {
        ok: false,
        label: `${track.name}: ${scenario.id} step ${index + 1}`,
        reason: "No runnable command could be derived from hints, demo, walkthrough, or accept rules."
      };
    }

    const before = await page.evaluate(() => window.TerminalEngine?.getRuntimeSnapshot?.());
    const result = await runTerminalCommand(page, step.command);
    report.commandResults.push({
      ...result,
      command: `${track.name}/${scenario.id}: ${result.command}`
    });
    const after = await page.evaluate(() => window.TerminalEngine?.getRuntimeSnapshot?.());
    const moved = Boolean(after?.scenarioCompleted || after?.stepIndex > before?.stepIndex);

    if (!moved) {
      const wrongFeedbackWords = words(result.notes);
      return {
        ok: false,
        label: `${track.name}: ${scenario.id} step ${index + 1}`,
        reason: `"${step.command}" did not advance. Feedback words=${wrongFeedbackWords}. Output: ${result.notes}`
      };
    }

    if (after?.scenarioCompleted) {
      return {
        ok: true,
        label: `${track.name}: ${scenario.id}`,
        reason: `Completed at step ${index + 1}/${scenario.steps.length}.`
      };
    }
  }

  const finalState = await page.evaluate(() => window.TerminalEngine?.getRuntimeSnapshot?.());
  return {
    ok: Boolean(finalState?.scenarioCompleted),
    label: `${track.name}: ${scenario.id}`,
    reason: finalState?.scenarioCompleted ? "Completed." : `Ended without completion at step ${finalState?.stepIndex}/${finalState?.stepCount}.`
  };
}

test("Terminal comprehensive journey smoke: scenario data and full command paths", async ({ browser }, testInfo) => {
  const limit = parseLimit();
  test.setTimeout(limit === Infinity ? 1800000 : 600000);
  const report = createSmokeReport("Terminal Comprehensive Journey Smoke", "multi-track terminal labs");
  const journeyFailures = [];
  const journeyPasses = [];

  for (const track of TRACKS) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 860 } });
    observePage(page, report);
    await gotoAndStabilize(page, track.url);

    const scenarios = await scenarioInventory(page, Boolean(track.beginnerOnly));
    auditScenarioData(report, track, scenarios);

    const runnableScenarios = scenarios
      .filter((scenario) => scenario.steps.length && scenario.steps.every((step) => step.command))
      .slice(0, limit);

    pushCheck(report, `${track.name}: journey scenarios selected`, runnableScenarios.length > 0, `${runnableScenarios.length}/${scenarios.length}`);

    for (const scenario of runnableScenarios) {
      const outcome = await runScenarioJourney(page, report, track, scenario);
      if (outcome.ok) {
        journeyPasses.push(outcome.label);
      } else {
        journeyFailures.push(`${outcome.label}: ${outcome.reason}`);
        pushWarning(report, `${outcome.label}: ${outcome.reason}`);
      }
    }

    await page.close();
  }

  pushCheck(report, "full journeys complete without blockers", journeyFailures.length === 0, journeyFailures.slice(0, 20).join(" | "));
  pushCheck(report, "request failures absent", report.requestFailures.length === 0, report.requestFailures.join(" | "));
  pushCheck(report, "console errors absent", report.consoleErrors.length === 0, report.consoleErrors.join(" | "));
  pushCheck(report, "page errors absent", report.pageErrors.length === 0, report.pageErrors.join(" | "));

  addLabHealth(report, {
    pagesTested: TRACKS.map((track) => track.name),
    commandsTested: report.commandResults.map((item) => item.command),
    rejectedReasonableAlternatives: journeyFailures,
    acceptedVariations: journeyPasses.slice(0, 30)
  });

  await attachSmokeData(testInfo, report);
  expect.soft(report.consoleErrors).toEqual([]);
  expect.soft(report.pageErrors).toEqual([]);
  expect(journeyFailures, journeyFailures.slice(0, 20).join("\n")).toEqual([]);
});
