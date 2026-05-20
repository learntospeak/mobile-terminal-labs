// Automated scenario contradiction audit.
// Requires: StateManager, ScenarioEngine, lesson-audit-core.js

(function () {
  function C() {
    if (!window.NetlabLessonAuditCore) throw new Error("NetlabLessonAuditCore is not loaded.");
    return window.NetlabLessonAuditCore;
  }

  function stateForScenario(scenario) {
    return window.StateManager.createState(scenario.environment || { platform: scenario.shell || "linux" });
  }

  function commandFromRule(rule) {
    if (!rule) return "";
    if (rule.rawEquals) return rule.rawEquals;
    if (rule.command) return rule.command;
    if (rule.finalCwd) return "cd";
    if (rule.fileExists) return "path-check";
    return "";
  }

  function stepText(step) {
    return [
      step?.objective,
      step?.commandHint,
      step?.demoCommand,
      ...(Array.isArray(step?.hints) ? step.hints : []),
      ...(Array.isArray(step?.walkthrough) ? step.walkthrough.map((entry) => [entry?.command, entry?.objective, entry?.goal, entry?.explanation].filter(Boolean).join(" ")) : [])
    ].filter(Boolean).join(" ").toLowerCase();
  }

  function scenarioTextUpToStep(scenario, stepIndex) {
    return (Array.isArray(scenario?.steps) ? scenario.steps.slice(0, stepIndex + 1) : []).map(stepText).join(" ");
  }

  function targetCanBeCreatedDuringLesson(scenario, step, stepIndex, targetPath) {
    const targetName = C().basename(targetPath).toLowerCase();
    const text = `${scenarioTextUpToStep(scenario, stepIndex)} ${targetName}`;
    return /\b(mkdir|md|touch|copy|xcopy|cp|move|mv|ren|rename|tar|unzip|extract|download|wget|create|created|new|backup|quarantine|bundle|staging|scratch)\b/.test(text);
  }

  function pathSeverity(node, expectedType, scenario, step, stepIndex, targetPath) {
    if (expectedType === "dir" && node?.type === "dir") return "pass";
    if (expectedType === "path" && node) return "pass";
    if (targetCanBeCreatedDuringLesson(scenario, step, stepIndex, targetPath)) return "info";
    return "error";
  }

  function pathOk(severity) {
    return severity === "pass" || severity === "info";
  }

  function pathDetail(baseDetail, severity) {
    return severity === "info"
      ? `${baseDetail} (created/extracted/moved during lesson)`
      : baseDetail;
  }

  function auditAcceptRules(scenario, step, stepIndex, state) {
    const core = C();
    const S = window.StateManager;
    const checks = [];
    const accepts = Array.isArray(step.accepts) ? step.accepts : [];

    checks.push(core.check({
      ok: accepts.length > 0,
      severity: accepts.length ? "pass" : "error",
      scenario,
      stepIndex,
      name: "Step has success rule",
      detail: accepts.length ? `${accepts.length} accept rule(s)` : "No accept rules; the step may not be completable."
    }));

    accepts.forEach((rule, ruleIndex) => {
      const label = `Accept rule ${ruleIndex + 1}`;

      if (rule.finalCwd) {
        const target = S.normalizePath(state, rule.finalCwd);
        const node = S.getNode(state, target);
        const severity = pathSeverity(node, "dir", scenario, step, stepIndex, rule.finalCwd);
        checks.push(core.check({
          ok: pathOk(severity),
          severity,
          scenario,
          stepIndex,
          name: `${label}: target folder exists or is created during lesson`,
          detail: pathDetail(`${rule.finalCwd} -> ${target}`, severity)
        }));

        const objective = String(step.objective || "").toLowerCase();
        const targetName = core.basename(rule.finalCwd).toLowerCase();
        if (/folder|directory|move|enter|navigate|location|cd|go into/.test(objective) && targetName) {
          const mentioned = objective.includes(targetName) || objective.includes(targetName.replace(/s$/, ""));
          checks.push(core.check({
            ok: mentioned,
            severity: mentioned ? "pass" : "warning",
            scenario,
            stepIndex,
            name: `${label}: objective mentions target folder`,
            detail: `Objective="${step.objective}" Target="${rule.finalCwd}"`
          }));
        }
      }

      if (rule.fileExists) {
        const target = S.normalizePath(state, rule.fileExists);
        const node = S.getNode(state, target);
        const severity = pathSeverity(node, "path", scenario, step, stepIndex, rule.fileExists);
        checks.push(core.check({
          ok: pathOk(severity),
          severity,
          scenario,
          stepIndex,
          name: `${label}: target path exists or is created during lesson`,
          detail: pathDetail(`${rule.fileExists} -> ${target}`, severity)
        }));
      }

      const command = commandFromRule(rule);
      if (command && !["cd", "path-check"].includes(command)) {
        const valid = core.commandValidForScenario(command, scenario, state);
        checks.push(core.check({
          ok: valid,
          severity: valid ? "pass" : "error",
          scenario,
          stepIndex,
          name: `${label}: command belongs to platform or session context`,
          detail: command
        }));
      }
    });

    return checks;
  }

  function auditGuidance(scenario, step, stepIndex, state) {
    const core = C();
    const checks = [];
    const commands = core.stepGuidanceCommands(step);

    checks.push(core.check({
      ok: Boolean(step.objective),
      severity: step.objective ? "pass" : "error",
      scenario,
      stepIndex,
      name: "Step has clear objective",
      detail: step.objective || "Missing objective."
    }));

    if (!commands.length) {
      checks.push(core.check({
        ok: false,
        severity: "warning",
        scenario,
        stepIndex,
        name: "Step has command guidance",
        detail: "No demoCommand, backtick hint, or walkthrough command found."
      }));
    }

    commands.forEach((command) => {
      const valid = core.commandValidForScenario(command, scenario, state);
      checks.push(core.check({
        ok: valid,
        severity: valid ? "pass" : "error",
        scenario,
        stepIndex,
        name: "Guidance command belongs to platform or session context",
        detail: command
      }));
    });

    if (step.commandFamily && step.demoCommand) {
      const family = String(step.commandFamily || "").toLowerCase();
      const word = core.commandWord(step.demoCommand);
      const matches = word === family || String(step.demoCommand || "").toLowerCase().includes(family);
      checks.push(core.check({
        ok: matches,
        severity: matches ? "pass" : "warning",
        scenario,
        stepIndex,
        name: "demoCommand matches commandFamily",
        detail: `family=${family}; demo=${step.demoCommand}`
      }));
    }

    return checks;
  }

  function auditExplorationRecovery(scenario, step, stepIndex) {
    const core = C();
    const checks = [];
    const exploration = Array.isArray(step.exploration) ? step.exploration : [];
    const objective = String(step.objective || "").toLowerCase();
    const navigation = /\b(cd|folder|directory|navigate|move|enter|location|where you are)\b/.test(objective);
    const fileRead = /\b(type|cat|read|open|file|note|log)\b/.test(objective);

    if (navigation && scenario.shell === "cmd") {
      const hasDir = exploration.some((entry) => /\bdir\b/i.test(String(entry?.match?.command || entry?.match?.raw || "")));
      checks.push(core.check({ ok: hasDir, severity: hasDir ? "pass" : "warning", scenario, stepIndex, name: "Windows navigation allows dir exploration", detail: hasDir ? "dir exploration present" : "Add exploration for dir and recovery commands." }));
    }

    if (navigation && scenario.shell !== "cmd" && scenario.shell !== "cisco") {
      const hasLsPwd = exploration.some((entry) => /\b(ls|pwd)\b/i.test(String(entry?.match?.command || entry?.match?.raw || "")));
      checks.push(core.check({ ok: hasLsPwd, severity: hasLsPwd ? "pass" : "warning", scenario, stepIndex, name: "Linux navigation allows ls/pwd exploration", detail: hasLsPwd ? "ls/pwd exploration present" : "Add exploration for ls, pwd, and cd .. recovery." }));
    }

    if (fileRead) {
      checks.push(core.check({ ok: true, severity: "info", scenario, stepIndex, name: "File-read task needs wrong-folder recovery test", detail: "Full-flow runner should try reading from the wrong cwd." }));
    }

    return checks;
  }

  function auditScenario(scenario) {
    const core = C();
    const checks = [];
    let state;

    try {
      state = stateForScenario(scenario);
      checks.push(core.check({ ok: true, severity: "pass", scenario, name: "Scenario environment creates state", detail: state.cwd || state.router?.mode || "ok" }));
    } catch (error) {
      checks.push(core.check({ ok: false, severity: "error", scenario, name: "Scenario environment creates state", detail: error.message }));
      return checks;
    }

    const steps = Array.isArray(scenario.steps) ? scenario.steps : [];
    checks.push(core.check({ ok: steps.length > 0, severity: steps.length ? "pass" : "error", scenario, name: "Scenario has steps", detail: `${steps.length} step(s)` }));

    steps.forEach((step, index) => {
      checks.push(...auditAcceptRules(scenario, step, index, state));
      checks.push(...auditGuidance(scenario, step, index, state));
      checks.push(...auditExplorationRecovery(scenario, step, index));
    });

    return checks;
  }

  function filterScenarios(scenarios, platform) {
    const target = String(platform || "").toLowerCase();
    if (!target) return scenarios;
    return scenarios.filter((scenario) => {
      if (target === "windows") return scenario.shell === "cmd" || scenario.environmentCategory === "windows";
      if (target === "linux") return scenario.shell !== "cmd" && scenario.shell !== "cisco" && scenario.environmentCategory !== "windows" && scenario.environmentCategory !== "cisco";
      if (target === "cisco") return scenario.shell === "cisco" || scenario.environmentCategory === "cisco";
      return true;
    });
  }

  function run(options = {}) {
    const core = C();
    core.requireDeps();
    const scenarios = filterScenarios(core.scenarioList(), options.platform);
    const checks = scenarios.flatMap(auditScenario);
    const summary = core.summarize(checks);
    const important = checks.filter((item) => item.severity === "error" || item.severity === "warning");
    if (console.table) console.table(important);
    console.log("Lesson scenario audit", summary, `scenarios=${scenarios.length}`);
    return { name: "Lesson Scenario Audit", scenarios: scenarios.length, summary, checks };
  }

  window.NetlabLessonScenarioAudit = {
    run,
    runWindows: () => run({ platform: "windows" }),
    runLinux: () => run({ platform: "linux" }),
    runCisco: () => run({ platform: "cisco" })
  };
})();
