(function () {
  function core() { if (!window.NetlabLessonAuditCore) throw new Error("NetlabLessonAuditCore is not loaded."); return window.NetlabLessonAuditCore; }
  function check(args) { return core().check(args); }
  function list() { return core().scenarioList(); }
  function accepts(step) { return Array.isArray(step && step.accepts) ? step.accepts : []; }
  function allText(scenario, step) {
    return [scenario && scenario.id, scenario && scenario.title, scenario && scenario.objective, ...(scenario && scenario.commandFocus || []), step && step.objective, step && step.context, step && step.demoCommand, ...(step && step.hints || [])].filter(Boolean).join(" ").toLowerCase();
  }
  function acceptText(step) { return accepts(step).map(r => String(r.command || r.rawEquals || r.raw || "")).join(" ").toLowerCase(); }
  function expText(step) { return (step.exploration || []).map(e => [e.match && e.match.command, e.match && e.match.raw, e.feedback].filter(Boolean).join(" ")).join(" ").toLowerCase(); }
  function familiesFor(scenario, step) {
    const text = allText(scenario, step);
    return ["ping", "ipconfig", "nslookup", "tracert", "traceroute", "pathping", "route", "netstat", "arp", "getmac", "sc", "tasklist", "show"].filter(cmd => text.includes(cmd));
  }
  function isDiagnosticScenario(scenario) {
    return familiesFor(scenario, {}).length > 0 || /connectivity|dns|gateway|port|service|route|interface/.test(allText(scenario, {}));
  }
  function hasSafeExploration(step, scenario) {
    const shell = scenario.shell || (scenario.environment && scenario.environment.platform) || "linux";
    const text = expText(step);
    if (shell === "cmd") return /dir|ipconfig|ping|nslookup|tracert|route|netstat|arp|tasklist|sc/.test(text);
    if (shell === "cisco") return /show|ping|traceroute|exit|end|enable/.test(text);
    return /pwd|ls|ping|ip |traceroute|netstat|ss|nmap|nc/.test(text);
  }
  function auditStep(scenario, step, index) {
    const checks = [];
    const families = familiesFor(scenario, step);
    families.forEach(family => {
      const guidance = allText(scenario, step).includes(family);
      const accepted = acceptText(step).includes(family);
      checks.push(check({ ok: guidance, severity: guidance ? "pass" : "error", scenario, stepIndex: index, name: "Diagnostic command visible in guidance", detail: family }));
      checks.push(check({ ok: accepted, severity: accepted ? "pass" : "warning", scenario, stepIndex: index, name: "Diagnostic command accepted", detail: family }));
    });
    if (families.length) {
      const safe = hasSafeExploration(step, scenario);
      checks.push(check({ ok: safe, severity: safe ? "pass" : "warning", scenario, stepIndex: index, name: "Diagnostic step allows safe nearby commands", detail: "Learner can explore without breaking flow." }));
    }
    return checks;
  }
  function auditScenario(scenario) {
    if (!isDiagnosticScenario(scenario)) return [];
    return (scenario.steps || []).flatMap((step, index) => auditStep(scenario, step, index));
  }
  function filter(scenarios, platform) {
    const p = String(platform || "").toLowerCase();
    if (!p) return scenarios;
    return scenarios.filter(s => p === "windows" ? s.shell === "cmd" || s.environmentCategory === "windows" : p === "cisco" ? s.shell === "cisco" || s.environmentCategory === "cisco" : s.shell !== "cmd" && s.shell !== "cisco");
  }
  function run(options = {}) {
    const selected = filter(list(), options.platform);
    const checks = selected.flatMap(auditScenario);
    const summary = core().summarize(checks);
    if (console.table) console.table(checks.filter(x => x.severity === "error" || x.severity === "warning"));
    return { name: "Connectivity Flow Smoke", scenarios: selected.length, summary, checks };
  }
  window.NetlabConnectivityFlowSmoke = { run, runWindows: () => run({ platform: "windows" }), runLinux: () => run({ platform: "linux" }), runCisco: () => run({ platform: "cisco" }) };
})();
