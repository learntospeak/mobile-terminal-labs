(() => {
  const MIN_INTRO_MS = 14000;
  const MAX_INTRO_MS = 26000;
  let introOpenedAt = 0;
  let fallbackTimer = 0;
  let closeTimer = 0;
  let simplifyingTerminalOutput = false;

  function isWindowsBeginnerLab() {
    const config = window.TerminalCoachConfig || {};
    return config.environmentCategory === "windows" && Boolean(config.isBeginnerMode);
  }

  function isFirstWindowsIncidentScenario() {
    const params = new URLSearchParams(window.location.search);
    const scenarioId = params.get("scenario") || params.get("scenarioId") || "";
    return scenarioId === "win-dir-incident-triage" || !scenarioId;
  }

  function installTaskNoteSuppression() {
    if (document.getElementById("terminalTaskNoteSuppression")) return;

    const style = document.createElement("style");
    style.id = "terminalTaskNoteSuppression";
    style.textContent = `
      .terminal-page #taskCompleteCard,
      .terminal-page #taskCompleteOverlay {
        display: none !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  function hideTaskNoteElements() {
    ["taskCompleteCard", "taskCompleteOverlay"].forEach((id) => {
      const element = document.getElementById(id);
      if (!element) return;
      element.hidden = true;
      element.setAttribute("aria-hidden", "true");
    });
  }

  function setText(id, text) {
    const element = document.getElementById(id);
    if (element) element.textContent = text;
  }

  function hideElement(id) {
    const element = document.getElementById(id);
    if (element) element.hidden = true;
  }

  function simplifyBeginnerOnboarding() {
    if (!isWindowsBeginnerLab() || !isFirstWindowsIncidentScenario()) return;

    setText("beginnerOnboardingTitle", "Start with one simple task");
    const copy = document.querySelector("#beginnerOnboardingCard .beginner-onboarding-copy");
    if (copy) {
      copy.textContent = "Use the command buttons or type a command. First, look around the current folder.";
    }

    const steps = document.querySelectorAll("#beginnerOnboardingCard .beginner-onboarding-steps li");
    [
      "Read the short mission.",
      "Choose a command.",
      "Use Help if you get stuck."
    ].forEach((text, index) => {
      if (steps[index]) steps[index].textContent = text;
    });

    const notes = document.querySelector("#beginnerOnboardingCard .beginner-onboarding-notes");
    if (notes) {
      notes.innerHTML = "<p><strong>Tip:</strong> You can use the buttons instead of memorising commands.</p>";
    }
  }

  function simplifyTicketBriefing() {
    if (!isWindowsBeginnerLab() || !isFirstWindowsIncidentScenario()) return;

    setText("ticketBriefingTitle", "First mission: find the note");
    setText("ticketBriefingBeginnerHappened", "Find the incident note and move it to the handover folder.");
    setText("ticketBriefingBeginnerMeaning", "Start simple: look around, then open the folder that matches the ticket.");
    setText("ticketBriefingBeginnerTryFirst", "First command to try: dir");
    setText("ticketBriefingObjective", "Look around the current folder first.");

    [
      "ticketBriefingSummaryBlock",
      "ticketBriefingUserReportBlock",
      "ticketBriefingSymptomsBlock",
      "ticketBriefingKnownFactsBlock",
      "ticketBriefingConstraintsBlock",
      "ticketBriefingTagsBlock",
      "ticketBriefingEscalationBlock",
      "ticketBriefingEasterEggBlock"
    ].forEach(hideElement);
  }

  function terminalOutputLooksLikeInitialBriefing(text) {
    const content = String(text || "");
    if (!content.includes("[Mission]") && !content.includes("Machine context") && !content.includes("Stage 1: Orientation")) {
      return false;
    }
    if (content.includes("Mission: Find the incident note")) {
      return false;
    }
    if (/C:\\Lab>|C:\/Lab>|Directory of|Volume in drive/i.test(content)) {
      return false;
    }
    return true;
  }

  function appendSimpleTerminalLine(container, text, className = "") {
    const line = document.createElement("div");
    line.className = `beginner-simple-terminal-line ${className}`.trim();
    line.textContent = text;
    container.appendChild(line);
  }

  function simplifyInitialTerminalOutput() {
    if (simplifyingTerminalOutput || !isWindowsBeginnerLab() || !isFirstWindowsIncidentScenario()) return;

    const output = document.getElementById("terminalOutput");
    if (!output || !terminalOutputLooksLikeInitialBriefing(output.textContent)) return;

    simplifyingTerminalOutput = true;
    output.replaceChildren();
    output.dataset.beginnerTextSimplified = "1";

    appendSimpleTerminalLine(output, "Mission: Find the incident note and move it to the handover folder.");
    appendSimpleTerminalLine(output, "");
    appendSimpleTerminalLine(output, "Step 1: Look around the current folder.");
    appendSimpleTerminalLine(output, "");
    appendSimpleTerminalLine(output, "Try: dir", "beginner-simple-terminal-command");
    appendSimpleTerminalLine(output, "Need help? Use Help, Commands, or Hint.", "beginner-simple-terminal-help");

    simplifyingTerminalOutput = false;
  }

  function installBeginnerTextSimplifier() {
    if (!isWindowsBeginnerLab() || !isFirstWindowsIncidentScenario()) return;

    simplifyBeginnerOnboarding();
    simplifyTicketBriefing();
    simplifyInitialTerminalOutput();

    const observer = new MutationObserver(() => {
      simplifyBeginnerOnboarding();
      simplifyTicketBriefing();
      simplifyInitialTerminalOutput();
    });

    [
      document.getElementById("terminalOutput"),
      document.getElementById("ticketBriefingCard"),
      document.getElementById("beginnerOnboardingCard")
    ].filter(Boolean).forEach((target) => {
      observer.observe(target, { childList: true, subtree: true, characterData: true });
    });

    window.setTimeout(() => observer.disconnect(), 12000);
  }

  function hasDirectLabRequest() {
    const params = new URLSearchParams(window.location.search);
    return Boolean(params.get("scenario") || params.get("scenarioId") || params.get("lesson"));
  }

  function shouldShowIntro() {
    const config = window.TerminalCoachConfig || {};
    const params = new URLSearchParams(window.location.search);
    const forced = params.get("intro") === "1";
    const skipped = params.get("skipIntro") === "1";
    const windowsBeginnerLab = config.environmentCategory === "windows" && config.isBeginnerMode;

    if (skipped || windowsBeginnerLab) return false;
    if (forced) return true;
    if (hasDirectLabRequest()) return false;
    return Boolean(config.isBeginnerMode);
  }

  function closeIntro() {
    const overlay = document.getElementById("terminalIntroOverlay");
    const frame = document.getElementById("terminalIntroFrame");

    window.clearTimeout(fallbackTimer);
    window.clearTimeout(closeTimer);

    if (!overlay) return;
    overlay.hidden = true;
    document.documentElement.classList.remove("terminal-intro-root-open");
    document.body.classList.remove("terminal-intro-open");
    if (frame) frame.src = "about:blank";

    const startButton = document.getElementById("beginnerOnboardingStartBtn")
      || document.getElementById("startScenarioBtn")
      || document.getElementById("terminalInput");
    startButton?.focus?.({ preventScroll: true });
  }

  function requestCloseIntro() {
    const elapsed = Date.now() - introOpenedAt;
    const remaining = Math.max(0, MIN_INTRO_MS - elapsed);
    window.clearTimeout(closeTimer);
    closeTimer = window.setTimeout(closeIntro, remaining);
  }

  function openIntro() {
    const overlay = document.getElementById("terminalIntroOverlay");
    const frame = document.getElementById("terminalIntroFrame");
    const skipButton = document.getElementById("terminalIntroSkipBtn");

    if (!overlay || !frame) return;

    if (overlay.parentElement !== document.body) {
      document.body.appendChild(overlay);
    }
    introOpenedAt = Date.now();
    frame.src = "./side-scroller-intro/index.html?embed=terminal&v=cyber-ops-briefing";
    overlay.hidden = false;
    document.documentElement.classList.add("terminal-intro-root-open");
    document.body.classList.add("terminal-intro-open");
    skipButton?.focus?.({ preventScroll: true });

    window.clearTimeout(fallbackTimer);
    fallbackTimer = window.setTimeout(closeIntro, MAX_INTRO_MS);
  }

  installTaskNoteSuppression();

  window.addEventListener("message", (event) => {
    const frame = document.getElementById("terminalIntroFrame");
    const fromIntroFrame = frame?.contentWindow && event.source === frame.contentWindow;
    if (event.origin !== window.location.origin && !fromIntroFrame) return;
    if (event.data?.type === "netlab:intro-complete") {
      requestCloseIntro();
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    hideTaskNoteElements();
    installBeginnerTextSimplifier();
    document.getElementById("terminalIntroSkipBtn")?.addEventListener("click", () => closeIntro());

    if (shouldShowIntro()) {
      openIntro();
    } else {
      closeIntro();
    }
  });
})();
