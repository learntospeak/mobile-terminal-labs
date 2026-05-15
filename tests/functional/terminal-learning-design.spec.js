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

function wordCount(value) {
  return String(value || "").trim().split(/\s+/).filter(Boolean).length;
}

function commandFromHint(value) {
  const text = String(value || "");
  const backtick = text.match(/`([^`]+)`/);
  if (backtick) return backtick[1].trim();
  return text.replace(/^Try:\s*/i, "").trim();
}

async function loadScenario(page, id) {
  await page.evaluate((scenarioId) => window.TerminalEngine?.loadScenarioById?.(scenarioId), id);
  await page.waitForTimeout(250);
}

async function terminalDesignSnapshot(page) {
  return page.evaluate(() => {
    const flattenSteps = (scenario) => {
      if (Array.isArray(scenario.stages) && scenario.stages.length) {
        return scenario.stages.flatMap((stage) => stage.steps || []);
      }
      return scenario.steps || [];
    };

    const beginnerIds = new Set(
      (window.ScenarioEngine?.beginnerLabLevels?.windows || [])
        .flatMap((level) => level.scenarioIds || [])
    );

    return (window.ScenarioEngine?.scenarios || [])
      .filter((scenario) => beginnerIds.has(scenario.id))
      .map((scenario) => ({
        id: scenario.id,
        title: scenario.title,
        steps: flattenSteps(scenario).map((step, index) => ({
          index,
          objective: step.objective || "",
          commandHint: step.commandHint || "",
          firstAction: step.firstAction || "",
          acceptsCount: Array.isArray(step.accepts) ? step.accepts.length : 0,
          partialsCount: Array.isArray(step.partials) ? step.partials.length : 0,
          explorationCount: Array.isArray(step.exploration) ? step.exploration.length : 0,
          hintsCount: Array.isArray(step.hints) ? step.hints.length : 0,
          successFeedback: step.successFeedback || "",
          failureHint: step.failureHint || "",
          explanation: step.explanation || ""
        }))
      }));
  });
}

test("Terminal learning-design smoke: beginner lab quality gates", async ({ page, browser }, testInfo) => {
  test.setTimeout(120000);
  const report = createSmokeReport("Terminal Learning Design Smoke", "/terminal-coach.html?track=windows&mode=beginner&skipIntro=1");
  observePage(page, report);
  await gotoAndStabilize(page, report.url);

  const scenarios = await terminalDesignSnapshot(page);
  const steps = scenarios.flatMap((scenario) => scenario.steps.map((step) => ({ ...step, scenarioId: scenario.id, scenarioTitle: scenario.title })));
  const flexibleSteps = steps.filter((step) => step.acceptsCount > 1 || step.explorationCount > 0 || step.partialsCount > 0);
  const strictSteps = steps.filter((step) => step.acceptsCount <= 1 && step.explorationCount === 0 && step.partialsCount === 0);
  const hintGaps = steps.filter((step) => step.hintsCount < 3);
  const longFeedback = steps.filter((step) => wordCount(step.successFeedback) > 34 || wordCount(step.explanation) > 74);
  const thinFeedback = steps.filter((step) => wordCount(step.successFeedback) < 5 || wordCount(step.failureHint) < 5);

  pushCheck(report, "beginner scenarios found", scenarios.length >= 10, `${scenarios.length} beginner scenarios`);
  pushCheck(report, "most steps support flexible learning paths", flexibleSteps.length / Math.max(steps.length, 1) >= 0.7, `${flexibleSteps.length}/${steps.length} steps have alternates, exploration, or partial feedback`);
  pushCheck(report, "all beginner steps have progressive hints", hintGaps.length === 0, hintGaps.slice(0, 8).map((step) => `${step.scenarioId} step ${step.index + 1}`).join(" | "));
  pushCheck(report, "feedback is concise enough for play", longFeedback.length === 0, longFeedback.slice(0, 8).map((step) => `${step.scenarioId} step ${step.index + 1}`).join(" | "));
  pushCheck(report, "feedback is not too thin", thinFeedback.length === 0, thinFeedback.slice(0, 8).map((step) => `${step.scenarioId} step ${step.index + 1}`).join(" | "));

  strictSteps.slice(0, 12).forEach((step) => {
    pushWarning(report, `Strict step may need another valid path: ${step.scenarioId} step ${step.index + 1} - ${step.objective}`);
  });
  longFeedback.slice(0, 8).forEach((step) => {
    pushWarning(report, `Feedback may be wordy: ${step.scenarioId} step ${step.index + 1}`);
  });

  const sampleScenarios = scenarios.filter((scenario) => scenario.steps.length >= 2).slice(0, 4);
  for (const scenario of sampleScenarios) {
    const futureCommand = commandFromHint(scenario.steps[1].commandHint);
    if (!futureCommand || /^Use\b/i.test(futureCommand)) continue;

    await loadScenario(page, scenario.id);
    const result = await runTerminalCommand(page, futureCommand);
    report.commandResults.push(result);
    pushCheck(
      report,
      `${scenario.id}: future command does not skip current task`,
      !result.progressed,
      `${futureCommand} -> ${result.notes}`
    );
    if (result.progressed) {
      pushWarning(report, `${scenario.id}: "${futureCommand}" progressed while it belonged to a later step.`);
    }
  }

  const mistakeSamples = sampleScenarios.slice(0, 3);
  for (const scenario of mistakeSamples) {
    await loadScenario(page, scenario.id);
    const result = await runTerminalCommand(page, "notarealcommand");
    report.commandResults.push(result);
    const words = wordCount(result.notes);
    pushCheck(report, `${scenario.id}: wrong command gives useful concise feedback`, !result.accepted && words >= 6 && words <= 80, `${words} words -> ${result.notes}`);
  }

  const mobilePage = await browser.newPage({ viewport: { width: 430, height: 840 }, isMobile: true });
  observePage(mobilePage, report);
  await gotoAndStabilize(mobilePage, "/terminal-coach.html?track=windows&mode=beginner&skipIntro=1");
  if (await mobilePage.locator("#beginnerOnboardingStartBtn").isVisible().catch(() => false)) {
    await mobilePage.locator("#beginnerOnboardingStartBtn").click();
    await mobilePage.waitForTimeout(150);
  }
  if (await mobilePage.locator("#ticketBriefingStartBtn").isVisible().catch(() => false)) {
    await mobilePage.locator("#ticketBriefingStartBtn").click();
    await mobilePage.waitForTimeout(150);
  }

  const mobileChoiceData = await mobilePage.evaluate(() => {
    const scenario = window.TerminalEngine?.getCurrentScenario?.();
    const firstStep = scenario?.steps?.[0] || scenario?.stages?.[0]?.steps?.[0] || {};
    const suggested = String(firstStep.commandHint || "").replace(/^Try:\s*/i, "").match(/`([^`]+)`/)?.[1]
      || String(firstStep.commandHint || "").replace(/^Try:\s*/i, "").trim();
    const choices = Array.from(document.querySelectorAll("[data-mobile-command-choice]")).map((node) => ({
      command: node.getAttribute("data-mobile-command-choice") || "",
      text: node.textContent || ""
    }));
    return { suggested, choices };
  });

  const firstChoice = mobileChoiceData.choices[0]?.command || "";
  const choiceCommands = mobileChoiceData.choices.map((choice) => choice.command);
  pushCheck(report, "mobile command choices exist", choiceCommands.length >= 4, choiceCommands.join(" | "));
  pushCheck(report, "mobile choices include plausible alternatives", new Set(choiceCommands).size >= 4, choiceCommands.join(" | "));
  pushCheck(report, "mobile answer is not always visibly first", firstChoice !== mobileChoiceData.suggested, `suggested=${mobileChoiceData.suggested}; choices=${choiceCommands.join(" | ")}`);
  if (firstChoice === mobileChoiceData.suggested) {
    pushWarning(report, `Mobile choice list may make the answer too obvious: first choice is "${firstChoice}".`);
  }
  await mobilePage.close();

  pushCheck(report, "request failures absent", report.requestFailures.length === 0, report.requestFailures.join(" | "));
  pushCheck(report, "console errors absent", report.consoleErrors.length === 0, report.consoleErrors.join(" | "));
  pushCheck(report, "page errors absent", report.pageErrors.length === 0, report.pageErrors.join(" | "));
  addLabHealth(report, {
    pagesTested: ["terminal learning design smoke"],
    commandsTested: report.commandResults.map((item) => item.command),
    rejectedReasonableAlternatives: strictSteps.slice(0, 8).map((step) => `${step.scenarioId} step ${step.index + 1}`),
    textNoiseFailures: longFeedback.slice(0, 8).map((step) => `${step.scenarioId} step ${step.index + 1}`),
    mobileFailures: firstChoice === mobileChoiceData.suggested ? [`First mobile choice is the suggested command: ${firstChoice}`] : []
  });

  await attachSmokeData(testInfo, report);
  expect(report.consoleErrors).toEqual([]);
  expect(report.pageErrors).toEqual([]);
});
