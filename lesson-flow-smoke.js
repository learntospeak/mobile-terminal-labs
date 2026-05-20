// Lesson flow smoke tests.
// Goal: catch runtime-style beginner flow problems that static scenario audit cannot detect.
// Requires: StateManager, ScenarioEngine, lesson-audit-core.js

(function () {
  function core() {
    if (!window.NetlabLessonAuditCore) throw new Error("NetlabLessonAuditCore is not loaded.");
    return window.NetlabLessonAuditCore;
  }

  function requireDeps() {
    const missing = [];
    if (!window.StateManager) missing.push("StateManager");
    if (!window.ScenarioEngine) missing.push("ScenarioEngine");
    if (!window.NetlabLessonAuditCore) missing.push("NetlabLessonAuditCore");
    if (missing.length) throw new Error(`Missing dependency: ${missing.join(", ")}`);
  }

  function check({ ok, severity, scenario, stepIndex = null, name, detail = "" }) {
    return core().check({ ok, severity, scenario, stepIndex, name, detail });
  }

  function scenarioList() {
    return core().scenarioList();
  }

  function stateForScenario(scenario) {
    return window.StateManager.createState(scenario.environment || { platform: scenario.shell || "linux" });
  }

  function normalize(state, path, basePath) {
    return window.StateManager.normalizePath(state, path, basePath);
  }

  function parentPath(path) {
    const normalized = String(path || "").replace(/\\/g, "/").replace(/\/+$/, "");
    const index = normalized.lastIndexOf("/");
    if (index <= 2 && /^[A-Za-z]:/.test(normalized)) return `${normalized.slice(0, 2)}/`;
    if (index <= 0) return "/";
    return normalized.slice(0, index);
  }

  function basename(path) {
    return core().basename(path);
  }

  function pathParts(path) {
    return String(path || "").replace(/\\/g, "/").split("/").filter(Boolean);
  }

  function relativePath(fromPath, toPath) {
    const from = pathParts(fromPath);
    const to = pathParts(toPath);
    while (from.length && to.length && from[0].toLowerCase() === to[0].toLowerCase()) {
      from.shift();
      to.shift();
    }
    return [...from.map(() => ".."), ...to].join("/") || ".";
  }

  function firstTargetFromAccepts(step) {
    const accepts = Array.isArray(step?.accepts) ? step.accepts : [];
    return accepts.find((rule) => rule?.finalCwd || rule?.fileExists) || null;
  }

  function firstFinalCwd(step) {
    return (Array.isArray(step?.accepts) ? step.accepts : []).find((rule) => rule?.finalCwd)?.finalCwd || "";
  }

  function firstFileTarget(step) {
    return (Array.isArray(step?.accepts) ? step.accepts : []).find((rule) => rule?.fileExists)?.fileExists || "";
  }

  function commandGuidanceText(step) {
    return [
      step?.objective,
      step?.commandHint,
      step?.demoCommand,
      ...(Array.isArray(step?.hints) ? step.hints : []),
      ...(Array.isArray(step?.walkthrough) ? step.walkthrough.map((entry) => [entry?.command, entry?.objective, entry?.goal, entry?.explanation, entry?.nowTry].filter(Boolean).join(" ")) : [])
    ].filter(Boolean).join(" ").toLowerCase();
  }

  function explorationText(step) {
    return (Array.isArray(step?.exploration) ? step.exploration : [])
      .map((entry) => [entry?.match?.command, entry?.match?.raw, entry?.feedback, entry?.coach, entry?.hint].filter(Boolean).join(" "))
      .join(" ")
      .toLowerCase();
  }

  function applyPreviousSimpleState(scenario, state, stepIndex) {
    const steps = Array.isArray(scenario?.steps) ? scenario.steps : [];
    for (let index = 0; index < stepIndex; index += 1) {
      const step = steps[index];
      const finalCwd = firstFinalCwd(step);
      if (finalCwd) {
        const target = normalize(state, finalCwd);
        if (window.StateManager.getNode(state, target)?.type === "dir") {
          window.StateManager.changeDirectory(state, target);
        }
      }
    }
    return state;
  }

  function siblingDirectories(state, currentPath, targetPath) {
    const parent = parentPath(targetPath);
    const parentNode = window.StateManager.getNode(state, parent);
    if (!parentNode || parentNode.type !== "dir") return [];
    return window.StateManager.listChildren(state, parent, true)
      .filter((node) => node.type === "dir" && normalize(state, node.path) !== normalize(state, targetPath));
  }

  function isNavigationStep(step) {
    const objective = String(step?.objective || "").toLowerCase();
    return Boolean(firstFinalCwd(step)) || /\b(cd|folder|directory|navigate|move|enter|location|where you are)\b/.test(objective);
  }

  function isFileReadStep(step) {
    const objective = String(step?.objective || "").toLowerCase();
    return Boolean(firstFileTarget(step)) || /\b(type|cat|read|open|file|note|log)\b/.test(objective);
  }

  function auditNavigationFlow(scenario, step, stepIndex) {
    const checks = [];
    if (!isNavigationStep(step)) return checks;

    const S = window.StateManager;
    const state = applyPreviousSimpleState(scenario, stateForScenario(scenario), stepIndex);
    const targetRaw = firstFinalCwd(step);
    if (!targetRaw) return checks;

    const target = normalize(state, targetRaw);
    const targetNode = S.getNode(state, target);
    if (!targetNode || targetNode.type !== "dir") {
      checks.push(check({
        ok: true,
        severity: "info",
        scenario,
        stepIndex,
        name: "Navigation target not available at simulated start",
        detail: `${targetRaw} may be created/extracted earlier; full runner should execute prior commands.`
      }));
      return checks;
    }

    const cwd = normalize(state, state.cwd);
    const rel = relativePath(cwd, target);
    const guidance = commandGuidanceText(step);
    const exploration = explorationText(step);
    const targetName = basename(target).toLowerCase();
    const relLower = rel.toLowerCase();

    const mentionsTarget = guidance.includes(targetName) || guidance.includes(relLower) || guidance.includes(target.toLowerCase());
    checks.push(check({
      ok: mentionsTarget,
      severity: mentionsTarget ? "pass" : "warning",
      scenario,
      stepIndex,
      name: "Navigation guidance points to target path",
      detail: `cwd=${cwd}; target=${target}; relative=${rel}`
    }));

    const wrongSiblings = siblingDirectories(state, cwd, target);
    if (wrongSiblings.length) {
      const wrong = wrongSiblings[0];
      const wrongState = window.StateManager.clone(state);
      const moveWrong = S.changeDirectory(wrongState, wrong.path);
      checks.push(check({
        ok: moveWrong.ok && normalize(wrongState, wrongState.cwd) === normalize(wrongState, wrong.path),
        severity: moveWrong.ok ? "pass" : "warning",
        scenario,
        stepIndex,
        name: "Wrong-folder movement changes state realistically",
        detail: `wrong=${wrong.path}; cwdAfter=${wrongState.cwd}`
      }));

      const recoveryRel = relativePath(wrongState.cwd, target);
      const hasRecovery = exploration.includes("cd ..") || exploration.includes(recoveryRel.toLowerCase()) || guidance.includes("cd ..") || guidance.includes(recoveryRel.toLowerCase());
      checks.push(check({
        ok: hasRecovery,
        severity: hasRecovery ? "pass" : "warning",
        scenario,
        stepIndex,
        name: "Wrong-folder recovery guidance exists",
        detail: `If user enters ${wrong.path}, suggest cd .. or ${recoveryRel}`
      }));
    }

    const backState = window.StateManager.clone(state);
    const canEnterTarget = S.changeDirectory(backState, target).ok;
    const afterEnter = backState.cwd;
    const back = S.changeDirectory(backState, "..");
    checks.push(check({
      ok: canEnterTarget && back.ok && normalize(backState, backState.cwd) === normalize(backState, parentPath(afterEnter)),
      severity: canEnterTarget && back.ok ? "pass" : "warning",
      scenario,
      stepIndex,
      name: "Backtracking with cd .. remains recoverable",
      detail: `target=${target}; afterBack=${backState.cwd}`
    }));

    return checks;
  }

  function auditFileReadFlow(scenario, step, stepIndex) {
    const checks = [];
    if (!isFileReadStep(step)) return checks;

    const S = window.StateManager;
    const state = applyPreviousSimpleState(scenario, stateForScenario(scenario), stepIndex);
    const fileRaw = firstFileTarget(step);
    if (!fileRaw) return checks;

    const filePath = normalize(state, fileRaw);
    const node = S.getNode(state, filePath);
    if (!node || node.type !== "file") {
      checks.push(check({
        ok: true,
        severity: "info",
        scenario,
        stepIndex,
        name: "File target not available at simulated start",
        detail: `${fileRaw} may be created/extracted earlier; full runner should execute prior commands.`
      }));
      return checks;
    }

    const correctFolder = parentPath(filePath);
    const wrongFolder = parentPath(correctFolder);
    const fileName = basename(filePath);
    const wrongState = window.StateManager.clone(state);
    S.changeDirectory(wrongState, wrongFolder);
    const wrongRead = S.readFile(wrongState, fileName);

    checks.push(check({
      ok: !wrongRead.ok,
      severity: !wrongRead.ok ? "pass" : "error",
      scenario,
      stepIndex,
      name: "Reading target file from wrong folder fails",
      detail: `wrongCwd=${wrongState.cwd}; file=${fileName}; result=${wrongRead.error || "read succeeded"}`
    }));

    const guidance = commandGuidanceText(step);
    const recoveryRel = relativePath(wrongState.cwd, correctFolder);
    const hasRecovery = guidance.includes(recoveryRel.toLowerCase()) || guidance.includes(basename(correctFolder).toLowerCase()) || explorationText(step).includes(recoveryRel.toLowerCase());
    checks.push(check({
      ok: hasRecovery,
      severity: hasRecovery ? "pass" : "warning",
      scenario,
      stepIndex,
      name: "Wrong-folder file-read recovery guidance exists",
      detail: `If user is in ${wrongState.cwd}, suggest moving to ${correctFolder}`
    }));

    return checks;
  }

  function auditMobileChoiceRisk(scenario, step, stepIndex) {
    const checks = [];
    if (!isNavigationStep(step)) return checks;
    if (scenario.shell === "cisco") return checks;

    const state = applyPreviousSimpleState(scenario, stateForScenario(scenario), stepIndex);
    const targetRaw = firstFinalCwd(step);
    if (!targetRaw) return checks;
    const target = normalize(state, targetRaw);
    const targetNode = window.StateManager.getNode(state, target);
    if (!targetNode || targetNode.type !== "dir") return checks;

    const cwd = normalize(state, state.cwd);
    const children = window.StateManager.listChildren(state, cwd, true).filter((node) => node.type === "dir");
    if (children.length <= 1) return checks;

    const directChildOnTargetPath = children.find((node) => target.toLowerCase() === node.path.toLowerCase() || target.toLowerCase().startsWith(`${node.path.toLowerCase()}/`));
    checks.push(check({
      ok: Boolean(directChildOnTargetPath),
      severity: directChildOnTargetPath ? "pass" : "warning",
      scenario,
      stepIndex,
      name: "Mobile choices can identify target child folder",
      detail: `cwd=${cwd}; target=${target}; child=${directChildOnTargetPath?.name || "none"}`
    }));

    if (directChildOnTargetPath) {
      const firstTwo = children.slice(0, 2).map((node) => node.name.toLowerCase());
      const likelyVisible = firstTwo.includes(directChildOnTargetPath.name.toLowerCase());
      checks.push(check({
        ok: likelyVisible,
        severity: likelyVisible ? "pass" : "warning",
        scenario,
        stepIndex,
        name: "Naive mobile folder choices may hide correct target",
        detail: `first two folders=${firstTwo.join(", ")}; expected=${directChildOnTargetPath.name}`
      }));
    }

    return checks;
  }

  function auditScenario(scenario) {
    const checks = [];
    const steps = Array.isArray(scenario?.steps) ? scenario.steps : [];
    steps.forEach((step, index) => {
      checks.push(...auditNavigationFlow(scenario, step, index));
      checks.push(...auditFileReadFlow(scenario, step, index));
      checks.push(...auditMobileChoiceRisk(scenario, step, index));
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
    requireDeps();
    const scenarios = filterScenarios(scenarioList(), options.platform);
    const checks = scenarios.flatMap(auditScenario);
    const summary = core().summarize(checks);
    const important = checks.filter((item) => item.severity === "error" || item.severity === "warning");
    if (console.table) console.table(important);
    console.log("Lesson flow smoke", summary, `scenarios=${scenarios.length}`);
    return { name: "Lesson Flow Smoke", scenarios: scenarios.length, summary, checks };
  }

  window.NetlabLessonFlowSmoke = {
    run,
    runWindows: () => run({ platform: "windows" }),
    runLinux: () => run({ platform: "linux" }),
    runCisco: () => run({ platform: "cisco" })
  };
})();
