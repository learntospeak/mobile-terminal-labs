(function () {
  const ASSET_BASE = "./assets/mascot/";
  const STATE_FILES = { main: "patch-main.png", happy: "patch-happy.png", thinking: "patch-thinking.png", confused: "patch-confused.png", excited: "patch-excited.png", nicework: "patch-nicework.png", ping: "patch-ping.png", traceroute: "patch-traceroute.png", ipconfig: "patch-ipconfig.png", nslookup: "patch-nslookup.png", files: "patch-files.png" };
  const ALT_TEXT = { main: "Patch, the beginner IT guide", happy: "Patch smiling", thinking: "Patch thinking", confused: "Patch helping after a mistake", excited: "Patch celebrating progress", nicework: "Patch celebrating progress", ping: "Patch checking a network connection", traceroute: "Patch tracing a network path", ipconfig: "Patch showing network information", nslookup: "Patch checking DNS", files: "Patch looking at files" };
  function normalizeState(state) { const key = String(state || "main").toLowerCase().replace(/[^a-z0-9-]/g, ""); return STATE_FILES[key] ? key : "main"; }
  function getMascotSrc(state = "main") { return `${ASSET_BASE}${STATE_FILES[normalizeState(state)]}`; }
  function getMascotAlt(state = "main") { return ALT_TEXT[normalizeState(state)] || ALT_TEXT.main; }
  function loadStylesheet(id, href) { if (typeof document === "undefined" || document.getElementById(id)) return; const css = document.createElement("link"); css.id = id; css.rel = "stylesheet"; css.href = href; document.head.appendChild(css); }
  function directScenarioId() { const params = new URLSearchParams(window.location.search); let id = params.get("scenario") || params.get("scenarioId") || params.get("lesson") || ""; return id === "incident-folder-triage" ? "win-dir-incident-triage" : id; }
  function forceDirectScenarioFilter() {
    const id = directScenarioId();
    if (!id || !window.TerminalCoachConfig) return;
    window.__NETLAB_DIRECT_SCENARIO_ID = id;
    window.TerminalCoachConfig.scenarioFilter = (scenario) => scenario && scenario.id === id;
    window.TerminalCoachConfig.isBeginnerMode = false;
    window.TerminalCoachConfig.uiMode = "standard";
    try { window.sessionStorage?.setItem("netlab:direct-scenario-id", id); } catch (error) {}
  }
  function routeDirectScenarioNow() {
    forceDirectScenarioFilter();
    const engine = window.ScenarioEngine;
    const id = directScenarioId();
    if (!engine || !Array.isArray(engine.scenarios) || !id) return;
    const scenario = engine.scenarios.find((item) => item && item.id === id);
    if (!scenario) return;
    engine.scenarios = [scenario, ...engine.scenarios.filter((item) => item && item.id !== id)];
    window.__NETLAB_DIRECT_SCENARIO_ID = id;
  }
  function loadTerminalPatches() {
    if (typeof window === "undefined") return;
    forceDirectScenarioFilter();
    routeDirectScenarioNow();
    window.setTimeout(() => {
      forceDirectScenarioFilter();
      routeDirectScenarioNow();
      import("./terminal-recovery-patterns.js?v=20260520recovery1").catch(() => {});
      import("./incident-folder-gold.js?v=20260520gold1").catch(() => {});
      import("./windows-notes-upgrade.js?v=20260521notes1").catch(() => {});
      import("./windows-ping-fileserver-upgrade.js?v=20260521ping1").catch(() => {});
      import("./windows-taskkill-upgrade.js?v=20260521taskkill1").catch(() => {});
      import("./windows-attrib-upgrade.js?v=20260521attrib1").catch(() => {});
      import("./windows-tree-upgrade.js?v=20260521tree1").catch(() => {});
      import("./windows-copy-note-upgrade.js?v=20260521copy1").catch(() => {});
      import("./windows-delete-dump-upgrade.js?v=20260521delete1").catch(() => {});
      import("./windows-type-more-upgrade.js?v=20260521typemore1").catch(() => {});
      import("./windows-host-user-upgrade.js?v=20260521host1").catch(() => {});
      import("./windows-xcopy-upgrade.js?v=20260521xcopy1").catch(() => {});
      import("./windows-batch2-upgrades.js?v=20260522batch2").catch(() => {});
      import("./windows-batch3-upgrades.js?v=20260522batch3").catch(() => {});
      import("./windows-batch4-upgrades.js?v=20260522batch4").catch(() => {});
      import("./windows-batch5a-upgrades.js?v=20260522batch5a").catch(() => {});
      import("./windows-batch5b-upgrades.js?v=20260522batch5b").catch(() => {});
      import("./linux-batch1-upgrades.js?v=20260522linux1").catch(() => {});
      import("./linux-batch2-upgrades.js?v=20260522linux2").catch(() => {});
      import("./linux-batch3-upgrades.js?v=20260522linux3").catch(() => {});
      import("./cisco-batch1-upgrades.js?v=20260522cisco1").catch(() => {});
      import("./cisco-batch2-upgrades.js?v=20260522cisco2").catch(() => {});
      import("./security-batch1-upgrades.js?v=20260522sec1").catch(() => {});
      import("./security-batch2-upgrades.js?v=20260522sec2").catch(() => {});
      import("./security-batch3-upgrades.js?v=20260522sec3").catch(() => {});
      import("./security-batch4-upgrades.js?v=20260522sec4").catch(() => {});
      import("./security-batch5-upgrades.js?v=20260522sec5").catch(() => {});
      import("./security-batch6-upgrades.js?v=20260522sec6").catch(() => {});
      import("./final-polish-batch1.js?v=20260522polish1").catch(() => {});
      import("./final-polish-network.js?v=20260522netpolish1").catch(() => {});
      import("./final-polish-admin.js?v=20260522adminpolish1").catch(() => {});
      import("./final-polish-linux.js?v=20260522linuxpolish1").catch(() => {});
      import("./final-polish-cisco.js?v=20260522ciscopolish1").catch(() => {});
      import("./final-polish-process.js?v=20260522processpolish1").catch(() => {});
      import("./final-polish-review.js?v=20260522reviewpolish1").catch(() => {});
      import("./incident-ahead-fix.js?v=20260522ahead1").catch(() => {});
      import("./investigation-pilot-incident.js?v=20260523pilot1").catch(() => {});
      import("./investigation-mode-ui.js?v=20260523stage2").catch(() => {});
      import("./investigation-smoke-download.js?v=20260523download1").catch(() => {});
      import("./direct-scenario-router.js?v=20260521router4").catch(() => {});
      routeDirectScenarioNow();
    }, 0);
  }
  loadStylesheet("appThemeStylesheet", "./app-theme.css?v=20260520theme1");
  loadStylesheet("terminalModalScrollFixStylesheet", "./modal-scroll-fix.css?v=20260521modal2");
  loadStylesheet("investigationModeStylesheet", "./investigation-mode-ui.css?v=20260523stage2");
  loadTerminalPatches();
  window.PatchMascot = { getMascotSrc, getMascotAlt, normalizeState };
})();