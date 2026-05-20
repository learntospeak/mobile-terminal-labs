(function () {
  function rawMatch(raw, extras = {}) { return { raw, ...extras }; }
  function explore(match, feedback) { return { match: typeof match === "string" ? { command: match } : { raw: match }, feedback }; }
  function mergeRules(existing, additions) {
    const list = Array.isArray(existing) ? existing.slice() : [];
    additions.forEach((addition) => {
      const key = JSON.stringify(addition.match || addition);
      if (!list.some((item) => JSON.stringify(item.match || item) === key)) list.push(addition);
    });
    return list;
  }
  function basename(path) {
    return String(path || "").replace(/\\/g, "/").replace(/\/+$/, "").split("/").filter(Boolean).pop() || "";
  }
  function parentPath(path) {
    const value = String(path || "").replace(/\\/g, "/").replace(/\/+$/, "");
    const index = value.lastIndexOf("/");
    if (/^[A-Za-z]:/.test(value) && index <= 2) return value.slice(0, 2) + "/";
    if (index <= 0) return "/";
    return value.slice(0, index);
  }
  function shellOf(scenario) {
    return scenario?.shell || scenario?.environment?.platform || "linux";
  }
  function stepText(step) {
    return [step?.objective, step?.context, step?.demoCommand, ...(Array.isArray(step?.hints) ? step.hints : [])].filter(Boolean).join(" ").toLowerCase();
  }
  function hasFinalCwd(step) {
    return (Array.isArray(step?.accepts) ? step.accepts : []).find((rule) => rule?.finalCwd)?.finalCwd || "";
  }
  function cmdRecovery(target) {
    const name = basename(target) || "the target folder";
    return [
      explore("dir", "Good exploration. dir shows what is in your current folder."),
      explore(/^cd\s+\.\.$/i, "You moved back one folder. Check the prompt, then continue toward the folder named by the task."),
      explore(/^cd\s*$/i, "CMD shows your current folder. Use dir to see what is here, then cd into the folder named by the task."),
      explore(/^cd\s+(logs|reports|temp|archive|archives|startup|shares|services)$/i, `That folder may exist, but this task needs ${name}. Use cd .. if you went the wrong way.`),
      explore(/^type\s+.+/i, "If CMD cannot find the file, check the prompt and list the folder with dir."),
      explore(/^(cls|ver|whoami|hostname)$/i, "That is a valid CMD command, but it does not complete this task. Return to the current objective after checking the output.")
    ];
  }
  function linuxRecovery(target) {
    const name = basename(target) || "the target directory";
    return [
      explore("pwd", "Good exploration. pwd shows where you are."),
      explore("ls", "Good exploration. ls shows what is in this directory."),
      explore(/^cd\s+\.\.$/i, "You moved up one directory. Use pwd or ls, then continue toward the target."),
      explore(/^cat\s+.+/i, "If the file is missing, check pwd and ls before trying again."),
      explore(/^cd\s+.+/i, `If that was the wrong directory, use cd .. or an absolute path to get back toward ${name}.`)
    ];
  }
  function ciscoRecovery() {
    return [
      explore(/^show\b/i, "Good exploration. show commands help you inspect state before changing anything."),
      explore(/^exit$/i, "You moved back one Cisco mode. Check the prompt before continuing."),
      explore(/^end$/i, "You returned to privileged EXEC mode. If the task needs config mode, re-enter configure terminal."),
      explore(/^enable$/i, "enable moves from > to #. That is often the first Cisco step."),
      explore(/^configure\s+terminal$/i, "configure terminal enters config mode. Check the prompt before the next command.")
    ];
  }
  function patchNavigation(scenario, step) {
    const target = hasFinalCwd(step);
    if (!target) return;
    const shell = shellOf(scenario);
    step.exploration = mergeRules(step.exploration, shell === "cmd" ? cmdRecovery(target) : shell === "cisco" ? ciscoRecovery() : linuxRecovery(target));
    const partials = [];
    const parent = parentPath(target);
    const name = basename(target);
    if (shell === "cmd") {
      partials.push({ match: { finalCwd: parent }, feedback: `You are close. The target folder is ${name}. Use dir if needed, then cd ${name}.` });
      ["Logs", "Reports", "Temp", "Archives", "Startup", "Shares", "Services"].forEach((folder) => partials.push({ match: { finalCwd: `C:/Lab/${folder}` }, feedback: `You are in ${folder}. That may be a real folder, but this task needs ${name}. Use cd .., then continue toward the folder named by the task.` }));
    } else if (shell !== "cisco") {
      partials.push({ match: { finalCwd: parent }, feedback: `You are close. The target directory is ${name}. Use ls if needed, then cd ${name}.` });
    }
    step.partials = mergeRules(step.partials, partials);
    if (!step.context) step.context = shell === "cmd" ? "You can use dir to look around, cd to move, and cd .. to go back if needed." : shell === "cisco" ? "Use the prompt to track your current Cisco mode." : "You can use pwd, ls, cd, and cd .. to orient yourself.";
  }
  function patchFileStep(scenario, step) {
    const shell = shellOf(scenario);
    const text = stepText(step);
    const fileStep = /\b(type|cat|read|open|file|note|log|summary)\b/i.test(text) || (Array.isArray(step?.accepts) && step.accepts.some((rule) => String(rule?.raw || rule?.command || "").match(/type|cat/i)));
    if (!fileStep) return;
    step.exploration = mergeRules(step.exploration, shell === "cmd" ? [
      explore("dir", "Good check. dir confirms the file name before you read it."),
      explore(/^cd\s+\.\.$/i, "You moved back one folder. If the file disappears, use dir and return to the folder that contains it."),
      explore(/^type\s+.+/i, "If CMD says the file cannot be found, check the prompt and use dir to confirm the exact file name.")
    ] : [
      explore("pwd", "Good check. pwd confirms where the next file command will run."),
      explore("ls", "Good check. ls confirms the exact file name before reading it."),
      explore(/^cat\s+.+/i, "If the file is missing, check pwd and ls before trying again.")
    ]);
  }
  function patchScenario(scenario) {
    if (!scenario || scenario.__recoveryPatched) return;
    scenario.__recoveryPatched = true;
    (Array.isArray(scenario.steps) ? scenario.steps : []).forEach((step) => {
      patchNavigation(scenario, step);
      patchFileStep(scenario, step);
      if (shellOf(scenario) === "cisco") step.exploration = mergeRules(step.exploration, ciscoRecovery());
    });
  }
  const engine = window.ScenarioEngine;
  if (engine && Array.isArray(engine.scenarios)) engine.scenarios.forEach(patchScenario);
})();
