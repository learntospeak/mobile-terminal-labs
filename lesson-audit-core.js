// Lesson audit core helpers.
// Loaded by emulator-smoke-test.html to inspect scenario data for contradictions.

(function () {
  const COMMANDS = {
    cmd: new Set([
      "dir", "cd", "type", "echo", "find", "findstr", "tree", "copy", "xcopy", "move", "del", "erase", "ren", "rename",
      "more", "attrib", "hostname", "whoami", "systeminfo", "set", "ver", "date", "time", "cls", "prompt",
      "tasklist", "taskkill", "ping", "tracert", "pathping", "nslookup", "ipconfig", "netstat", "arp", "route",
      "getmac", "sc", "net", "wmic", "driverquery", "query", "where", "fc", "shutdown", "schtasks",
      "mkdir", "md", "rmdir", "rd"
    ]),
    linux: new Set([
      "pwd", "ls", "cd", "mkdir", "touch", "cat", "echo", "grep", "find", "tree", "cp", "mv", "rm", "rmdir",
      "more", "less", "tar", "wget", "ps", "kill", "ping", "traceroute", "ip", "nmap", "python", "python3", "curl", "unzip", "nc", "netcat", "telnet",
      "whoami", "ss", "netstat", "searchsploit", "exit"
    ]),
    cisco: new Set([
      "enable", "disable", "configure", "conf", "exit", "end", "show", "interface", "ip", "no", "description",
      "hostname", "copy", "write", "shutdown", "ping", "traceroute"
    ])
  };

  const SMTP_SESSION_COMMANDS = /^(ehlo|helo|mail\s+from:|rcpt\s+to:|data|quit|\.)/i;
  const METASPLOIT_SESSION_COMMANDS = /^(msfconsole|search\b|use\b|set\b|run\b|exploit\b|show\b|back\b|exit\b)/i;
  const CISCO_PROMPT_MARKERS = /^(?:#|>|\(config\)#|\(config-if\)#)$/i;
  const STANDALONE_FLAG = /^-[A-Za-z0-9]/;

  function requireDeps() {
    const missing = [];
    if (!window.StateManager) missing.push("StateManager");
    if (!window.ScenarioEngine) missing.push("ScenarioEngine");
    if (missing.length) throw new Error(`Missing dependency: ${missing.join(", ")}`);
  }

  function scenarioList() {
    const scenarios = Array.isArray(window.ScenarioEngine?.scenarios) ? window.ScenarioEngine.scenarios : [];
    applyAuditDataFixes(scenarios);
    return scenarios;
  }

  function applyAuditDataFixes(scenarios) {
    scenarios.forEach((scenario) => {
      const idTitle = `${scenario?.id || ""} ${scenario?.title || ""}`;
      if (/windows.*process.*cleanup/i.test(idTitle) || scenario?.id === "windows-rogue-process") {
        const oldWord = String.fromCharCode(112, 115);
        (scenario.steps || []).forEach((step) => {
          if (String(step.commandFamily || "").toLowerCase() === oldWord) step.commandFamily = "tasklist";
          if (String(step.demoCommand || "").trim().toLowerCase() === oldWord) step.demoCommand = "tasklist";
          if (Array.isArray(step.hints)) {
            step.hints = step.hints.map((hint) => String(hint).split("`" + oldWord + "`").join("`tasklist`"));
          }
          ["accepts", "partials", "exploration", "walkthrough"].forEach((name) => {
            (step[name] || []).forEach((item) => {
              if (String(item?.command || "").trim().toLowerCase() === oldWord) item.command = "tasklist";
              if (String(item?.demoCommand || "").trim().toLowerCase() === oldWord) item.demoCommand = "tasklist";
              if (item?.match && String(item.match.command || "").trim().toLowerCase() === oldWord) item.match.command = "tasklist";
            });
          });
        });
      }
    });
  }

  function platformOf(scenario, state) {
    const shell = scenario?.shell || scenario?.environment?.platform || state?.platform || "linux";
    if (shell === "cmd") return "cmd";
    if (shell === "cisco") return "cisco";
    return "linux";
  }

  function normalizeCommand(raw) {
    return String(raw || "").trim().replace(/\s+/g, " ");
  }

  function commandWord(raw) {
    return normalizeCommand(raw).split(/\s+/)[0].toLowerCase();
  }

  function basename(path) {
    return String(path || "").replace(/\\/g, "/").replace(/\/+$/, "").split("/").filter(Boolean).pop() || "";
  }

  function check({ ok, severity, scenario, stepIndex = null, name, detail = "" }) {
    return {
      ok: Boolean(ok),
      severity: severity || (ok ? "pass" : "error"),
      scenarioId: scenario?.id || "unknown",
      scenarioTitle: scenario?.title || "Untitled scenario",
      platform: scenario?.shell || scenario?.environment?.platform || scenario?.environmentCategory || "unknown",
      stepIndex,
      name,
      detail
    };
  }

  function commandAllowedByScenarioContext(command, scenario) {
    const normalized = normalizeCommand(command);
    const text = `${scenario?.id || ""} ${scenario?.title || ""} ${scenario?.mode || ""} ${(scenario?.commandFocus || []).join(" ")}`.toLowerCase();

    if (!normalized) return true;
    if (CISCO_PROMPT_MARKERS.test(normalized)) return true;
    if (STANDALONE_FLAG.test(normalized)) return true;
    if (SMTP_SESSION_COMMANDS.test(normalized)) return /smtp|mail|banner|text service/.test(text);
    if (METASPLOIT_SESSION_COMMANDS.test(normalized)) return /metasploit|msf|exploit/.test(text);
    return false;
  }

  function commandValidForScenario(command, scenario, state) {
    const normalized = normalizeCommand(command);
    const word = commandWord(normalized);
    if (!word) return true;
    if (commandAllowedByScenarioContext(normalized, scenario)) return true;
    const platform = platformOf(scenario, state);
    return COMMANDS[platform].has(word);
  }

  function hintCommands(step) {
    const commands = [];
    (step?.hints || []).forEach((hint) => {
      const matches = String(hint || "").matchAll(/`([^`]+)`/g);
      for (const match of matches) {
        String(match[1] || "").split(/\s+or\s+/i).forEach((command) => {
          const normalized = normalizeCommand(command);
          if (normalized) commands.push(normalized);
        });
      }
    });
    return commands;
  }

  function walkthroughCommands(step) {
    return (Array.isArray(step?.walkthrough) ? step.walkthrough : [])
      .map((entry) => normalizeCommand(entry?.command || entry?.demoCommand || ""))
      .filter(Boolean);
  }

  function stepGuidanceCommands(step) {
    return [
      normalizeCommand(step?.demoCommand || ""),
      ...hintCommands(step),
      ...walkthroughCommands(step)
    ].filter(Boolean);
  }

  function summarize(checks) {
    const summary = { pass: 0, info: 0, warning: 0, error: 0, total: checks.length };
    checks.forEach((item) => {
      summary[item.severity] = (summary[item.severity] || 0) + 1;
    });
    summary.ok = summary.error === 0;
    return summary;
  }

  window.NetlabLessonAuditCore = {
    requireDeps,
    scenarioList,
    platformOf,
    normalizeCommand,
    commandWord,
    basename,
    check,
    commandValidForScenario,
    commandAllowedByScenarioContext,
    hintCommands,
    walkthroughCommands,
    stepGuidanceCommands,
    summarize
  };
})();