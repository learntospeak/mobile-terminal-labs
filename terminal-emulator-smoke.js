// Terminal emulator smoke tests.
// Open emulator-smoke-test.html, or run in DevTools:
// NetlabEmulatorSmokeTest.run()

(function () {
  let latestLessonAuditResult = null;
  let latestLessonFlowResult = null;

  function result(ok, name, detail) {
    return { ok, name, detail: detail || "" };
  }

  function assert(name, condition, detail) {
    return result(Boolean(condition), name, detail);
  }

  function report(name, checks) {
    const failed = checks.filter((item) => !item.ok);
    if (console.table) console.table(checks);
    console.log(`${name}: ${checks.length - failed.length}/${checks.length} passed`);
    if (failed.length) console.warn(`${name} failures`, failed);
    return { name, passed: checks.length - failed.length, failed: failed.length, checks };
  }

  function sm() {
    if (!window.StateManager) {
      throw new Error("StateManager is not loaded. Open a terminal lab page first.");
    }
    return window.StateManager;
  }

  function runWindows() {
    const S = sm();
    const state = S.createState({
      platform: "cmd",
      drive: "C:",
      home: "C:/Users/student",
      cwd: "C:/Lab",
      directories: ["C:/Lab", "C:/Lab/Incidents", "C:/Lab/Incidents/Notes", "C:/Lab/Logs", "C:/Lab/Reports"],
      files: [
        { path: "C:/Lab/Incidents/Notes/summary.txt", content: "Notes summary" },
        { path: "C:/Lab/Logs/app.log", content: "Application log" }
      ]
    });

    const checks = [];
    checks.push(assert("Windows prompt starts at C:\\Lab>", S.getPrompt(state) === "C:\\Lab>", S.getPrompt(state)));
    checks.push(assert("dir would show Incidents", S.listChildren(state, state.cwd).some((n) => n.name === "Incidents")));
    let move = S.changeDirectory(state, "Incidents");
    checks.push(assert("cd Incidents changes cwd", move.ok && state.cwd === "C:/Lab/Incidents", state.cwd));
    checks.push(assert("prompt updates after cd", S.getPrompt(state) === "C:\\Lab\\Incidents>", S.getPrompt(state)));
    move = S.changeDirectory(state, "Notes");
    checks.push(assert("cd Notes changes cwd", move.ok && state.cwd === "C:/Lab/Incidents/Notes", state.cwd));
    move = S.changeDirectory(state, "..");
    checks.push(assert("cd .. goes back one folder", move.ok && state.cwd === "C:/Lab/Incidents", state.cwd));
    move = S.changeDirectory(state, "..");
    checks.push(assert("second cd .. returns to C:\\Lab", move.ok && state.cwd === "C:/Lab", state.cwd));
    move = S.changeDirectory(state, "Logs");
    checks.push(assert("wrong but valid folder changes cwd", move.ok && state.cwd === "C:/Lab/Logs", state.cwd));
    move = S.changeDirectory(state, "MadeUpFolder");
    checks.push(assert("invalid folder fails and cwd stays", !move.ok && state.cwd === "C:/Lab/Logs", `${move.error}; ${state.cwd}`));
    move = S.changeDirectory(state, "C:/Lab/Incidents/Notes");
    checks.push(assert("absolute path jump works", move.ok && state.cwd === "C:/Lab/Incidents/Notes", state.cwd));
    const file = S.readFile(state, "summary.txt");
    checks.push(assert("relative file read works", file.ok && file.content === "Notes summary", file.content || file.error));
    const missing = S.readFile(state, "missing.txt");
    checks.push(assert("missing file fails", !missing.ok && state.cwd === "C:/Lab/Incidents/Notes", `${missing.error}; ${state.cwd}`));
    return report("Windows CMD emulator", checks);
  }

  function runLinux() {
    const S = sm();
    const state = S.createState({
      platform: "linux",
      user: "student",
      host: "lab",
      home: "/home/student",
      cwd: "/home/student",
      directories: ["/home/student", "/home/student/projects", "/var/log", "/etc", "/srv/app"],
      files: [
        { path: "/var/log/app.log", content: "Linux app log" },
        { path: "/home/student/.env", hidden: true, content: "SECRET=nope" }
      ]
    });

    const checks = [];
    checks.push(assert("Linux prompt starts at home", S.getPrompt(state) === "student@lab:~$", S.getPrompt(state)));
    let move = S.changeDirectory(state, "projects");
    checks.push(assert("cd relative folder works", move.ok && state.cwd === "/home/student/projects", state.cwd));
    move = S.changeDirectory(state, "..");
    checks.push(assert("cd .. returns home", move.ok && state.cwd === "/home/student", state.cwd));
    move = S.changeDirectory(state, "/var/log");
    checks.push(assert("absolute path jump works", move.ok && state.cwd === "/var/log", state.cwd));
    const file = S.readFile(state, "app.log");
    checks.push(assert("cat/read relative file works", file.ok && file.content === "Linux app log", file.content || file.error));
    move = S.changeDirectory(state, "/VAR/LOG");
    checks.push(assert("Linux path casing is strict", !move.ok && state.cwd === "/var/log", `${move.error}; ${state.cwd}`));
    const visible = S.listChildren(state, "/home/student", false);
    const hidden = S.listChildren(state, "/home/student", true);
    checks.push(assert("hidden file hidden by default", !visible.some((n) => n.name === ".env")));
    checks.push(assert("hidden file visible when requested", hidden.some((n) => n.name === ".env")));
    return report("Linux emulator", checks);
  }

  function runCisco() {
    const S = sm();
    const state = S.createState({ platform: "cisco", host: "Router", cwd: "/", home: "/", router: { hostname: "Router", mode: "user-exec", selectedInterface: null, interfaces: [], staticRoutes: [], startupConfig: null } });
    const checks = [];
    checks.push(assert("Cisco starts in user EXEC", S.getPrompt(state) === "Router>", S.getPrompt(state)));
    state.router.mode = "privileged-exec";
    checks.push(assert("Cisco privileged prompt", S.getPrompt(state) === "Router#", S.getPrompt(state)));
    state.router.mode = "global-config";
    checks.push(assert("Cisco global config prompt", S.getPrompt(state) === "Router(config)#", S.getPrompt(state)));
    state.router.mode = "interface-config";
    checks.push(assert("Cisco interface config prompt", S.getPrompt(state) === "Router(config-if)#", S.getPrompt(state)));
    state.router.hostname = "Branch-R1";
    checks.push(assert("Cisco hostname updates prompt", S.getPrompt(state) === "Branch-R1(config-if)#", S.getPrompt(state)));
    return report("Cisco emulator", checks);
  }

  function run() {
    return { windows: runWindows(), linux: runLinux(), cisco: runCisco() };
  }

  function loadScriptOnce(src, globalName) {
    return new Promise((resolve, reject) => {
      if (globalName && window[globalName]) return resolve();
      const existing = Array.from(document.scripts).find((script) => script.src && script.src.includes(src.split("?")[0]));
      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), { once: true });
        if (!globalName) resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(script);
    });
  }

  async function ensureLessonAuditLoaded() {
    await loadScriptOnce("./scenarioEngine.js?v=20260503helpguide1", "ScenarioEngine");
    await loadScriptOnce("./lesson-audit-core.js?v=20260520audit2", "NetlabLessonAuditCore");
    await loadScriptOnce("./lesson-scenario-audit.js?v=20260520audit2", "NetlabLessonScenarioAudit");
  }

  async function ensureLessonFlowLoaded() {
    await ensureLessonAuditLoaded();
    await loadScriptOnce("./lesson-flow-smoke.js?v=20260520flow1", "NetlabLessonFlowSmoke");
  }

  function resultSummaryPayload(testResult, maxItems = 120) {
    const checks = testResult?.checks || [];
    const important = checks.filter((item) => item.severity === "error" || item.severity === "warning");
    const summary = testResult?.summary || {};
    return {
      name: testResult?.name || "Test Result",
      checks: important.slice(0, maxItems).map((item) => ({
        ok: item.severity !== "error",
        name: `${item.severity.toUpperCase()}: ${item.scenarioTitle} ${item.stepIndex !== null ? `(step ${item.stepIndex + 1})` : ""}`,
        detail: `${item.name}${item.detail ? ` — ${item.detail}` : ""}`
      })),
      raw: testResult,
      summary
    };
  }

  function downloadPayload(testResult) {
    const checks = testResult?.checks || [];
    return {
      generatedAt: new Date().toISOString(),
      pageUrl: window.location.href,
      userAgent: window.navigator?.userAgent || "",
      summary: testResult?.summary || {},
      scenarioCount: testResult?.scenarios || 0,
      errors: checks.filter((item) => item.severity === "error"),
      warnings: checks.filter((item) => item.severity === "warning"),
      info: checks.filter((item) => item.severity === "info"),
      allChecks: checks
    };
  }

  function downloadJson(filename, payload) {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function downloadLatestLessonAudit() {
    if (!latestLessonAuditResult) return window.alert("Run the Lesson Audit first, then download the report.");
    const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    downloadJson(`netlab-lesson-audit-${stamp}.json`, downloadPayload(latestLessonAuditResult));
  }

  function downloadLatestLessonFlow() {
    if (!latestLessonFlowResult) return window.alert("Run the Lesson Flow Smoke first, then download the report.");
    const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    downloadJson(`netlab-lesson-flow-${stamp}.json`, downloadPayload(latestLessonFlowResult));
  }

  function renderResultPanel(target, testResult, downloadLabel, downloadHandler) {
    if (!target) return;
    const payload = resultSummaryPayload(testResult);
    const raw = payload.raw || testResult;
    target.innerHTML = "";
    const header = document.createElement("div");
    header.className = "smoke-platform-head";
    header.innerHTML = `<h2>${payload.name}</h2><strong class="${raw.summary?.error ? "smoke-fail" : "smoke-pass"}">${raw.summary?.error || 0} errors · ${raw.summary?.warning || 0} warnings · ${raw.scenarios || 0} scenarios</strong>`;
    const downloadRow = document.createElement("div");
    downloadRow.className = "smoke-actions";
    downloadRow.style.padding = "12px 16px";
    downloadRow.innerHTML = `<button class="smoke-btn primary" type="button" data-download-current>${downloadLabel}</button>`;
    const list = document.createElement("div");
    list.className = "smoke-check-list";
    if (!payload.checks.length) {
      list.innerHTML = `<div class="smoke-check"><strong class="smoke-pass">PASS</strong><div>No errors or warnings found.</div></div>`;
    } else {
      list.innerHTML = payload.checks.map((check) => (
        `<div class="smoke-check"><strong class="${check.ok ? "smoke-pass" : "smoke-fail"}">${check.ok ? "WARN" : "FAIL"}</strong><div><div>${escapeHtml(check.name)}</div><div class="smoke-check-detail">${escapeHtml(check.detail)}</div></div></div>`
      )).join("");
    }
    const pre = document.createElement("pre");
    pre.className = "smoke-log";
    pre.textContent = JSON.stringify(raw.summary || {}, null, 2);
    target.append(header, downloadRow, list, pre);
    target.querySelector("[data-download-current]")?.addEventListener("click", downloadHandler);
  }

  function escapeHtml(value) {
    return String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function addAuditUi() {
    if (!document.body.classList.contains("home-dashboard") || document.getElementById("lessonAuditCard")) return;
    const shell = document.querySelector(".smoke-shell");
    if (!shell) return;

    const card = document.createElement("section");
    card.id = "lessonAuditCard";
    card.className = "smoke-card";
    card.innerHTML = [
      "<h2>Lesson Scenario Audit</h2>",
      "<p class=\"smoke-copy\">Scans every lesson for missing success rules, broken target folders/files, wrong-platform commands, stale hints, and missing recovery guidance.</p>",
      "<div class=\"smoke-actions\">",
      "  <button id=\"runLessonAuditBtn\" class=\"smoke-btn primary\" type=\"button\">Run Lesson Audit</button>",
      "  <button id=\"runWindowsAuditBtn\" class=\"smoke-btn\" type=\"button\">Audit Windows</button>",
      "  <button id=\"runLinuxAuditBtn\" class=\"smoke-btn\" type=\"button\">Audit Linux</button>",
      "  <button id=\"runCiscoAuditBtn\" class=\"smoke-btn\" type=\"button\">Audit Cisco</button>",
      "</div>",
      "<article id=\"lessonAuditResults\" class=\"smoke-platform\"><div class=\"smoke-check\"><strong>READY</strong><div>Press Run Lesson Audit.</div></div></article>"
    ].join("");
    shell.appendChild(card);

    const flowCard = document.createElement("section");
    flowCard.id = "lessonFlowCard";
    flowCard.className = "smoke-card";
    flowCard.innerHTML = [
      "<h2>Lesson Flow Smoke</h2>",
      "<p class=\"smoke-copy\">Simulates beginner mistakes: wrong folder movement, cd .. backtracking, wrong-folder file reads, and mobile command choice risks.</p>",
      "<div class=\"smoke-actions\">",
      "  <button id=\"runLessonFlowBtn\" class=\"smoke-btn primary\" type=\"button\">Run Lesson Flow Smoke</button>",
      "  <button id=\"runWindowsFlowBtn\" class=\"smoke-btn\" type=\"button\">Flow Windows</button>",
      "  <button id=\"runLinuxFlowBtn\" class=\"smoke-btn\" type=\"button\">Flow Linux</button>",
      "  <button id=\"runCiscoFlowBtn\" class=\"smoke-btn\" type=\"button\">Flow Cisco</button>",
      "</div>",
      "<article id=\"lessonFlowResults\" class=\"smoke-platform\"><div class=\"smoke-check\"><strong>READY</strong><div>Press Run Lesson Flow Smoke.</div></div></article>"
    ].join("");
    shell.appendChild(flowCard);

    async function runAudit(kind) {
      const target = document.getElementById("lessonAuditResults");
      latestLessonAuditResult = null;
      target.innerHTML = `<div class="smoke-check"><strong>RUNNING</strong><div>Loading scenario data and audit rules...</div></div>`;
      try {
        await ensureLessonAuditLoaded();
        const audit = window.NetlabLessonScenarioAudit;
        const output = kind === "windows" ? audit.runWindows() : kind === "linux" ? audit.runLinux() : kind === "cisco" ? audit.runCisco() : audit.run();
        latestLessonAuditResult = output;
        renderResultPanel(target, output, "Download Full Audit JSON", downloadLatestLessonAudit);
      } catch (error) {
        target.innerHTML = `<div class="smoke-check"><strong class="smoke-fail">FAIL</strong><div>${escapeHtml(error.message || String(error))}</div></div>`;
      }
    }

    async function runFlow(kind) {
      const target = document.getElementById("lessonFlowResults");
      latestLessonFlowResult = null;
      target.innerHTML = `<div class="smoke-check"><strong>RUNNING</strong><div>Loading scenario data and flow smoke rules...</div></div>`;
      try {
        await ensureLessonFlowLoaded();
        const flow = window.NetlabLessonFlowSmoke;
        const output = kind === "windows" ? flow.runWindows() : kind === "linux" ? flow.runLinux() : kind === "cisco" ? flow.runCisco() : flow.run();
        latestLessonFlowResult = output;
        renderResultPanel(target, output, "Download Full Flow JSON", downloadLatestLessonFlow);
      } catch (error) {
        target.innerHTML = `<div class="smoke-check"><strong class="smoke-fail">FAIL</strong><div>${escapeHtml(error.message || String(error))}</div></div>`;
      }
    }

    document.getElementById("runLessonAuditBtn").addEventListener("click", () => runAudit("all"));
    document.getElementById("runWindowsAuditBtn").addEventListener("click", () => runAudit("windows"));
    document.getElementById("runLinuxAuditBtn").addEventListener("click", () => runAudit("linux"));
    document.getElementById("runCiscoAuditBtn").addEventListener("click", () => runAudit("cisco"));
    document.getElementById("runLessonFlowBtn").addEventListener("click", () => runFlow("all"));
    document.getElementById("runWindowsFlowBtn").addEventListener("click", () => runFlow("windows"));
    document.getElementById("runLinuxFlowBtn").addEventListener("click", () => runFlow("linux"));
    document.getElementById("runCiscoFlowBtn").addEventListener("click", () => runFlow("cisco"));
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", addAuditUi, { once: true });
  else addAuditUi();

  window.NetlabEmulatorSmokeTest = { run, runWindows, runLinux, runCisco, ensureLessonAuditLoaded, ensureLessonFlowLoaded, downloadLatestLessonAudit, downloadLatestLessonFlow };
})();
