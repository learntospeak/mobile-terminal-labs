(() => {
  const MIN_INTRO_MS = 14000;
  const MAX_INTRO_MS = 26000;
  let introOpenedAt = 0;
  let fallbackTimer = 0;
  let closeTimer = 0;

  function hasDirectLabRequest() {
    const params = new URLSearchParams(window.location.search);
    return Boolean(params.get("scenario") || params.get("scenarioId") || params.get("lesson"));
  }

  function shouldShowIntro() {
    const config = window.TerminalCoachConfig || {};
    const params = new URLSearchParams(window.location.search);
    const forced = params.get("intro") === "1";
    const skipped = params.get("skipIntro") === "1";

    if (forced) return true;
    if (skipped) return false;
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

  window.addEventListener("message", (event) => {
    const frame = document.getElementById("terminalIntroFrame");
    const fromIntroFrame = frame?.contentWindow && event.source === frame.contentWindow;
    if (event.origin !== window.location.origin && !fromIntroFrame) return;
    if (event.data?.type === "netlab:intro-complete") {
      requestCloseIntro();
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("terminalIntroSkipBtn")?.addEventListener("click", () => closeIntro());

    if (shouldShowIntro()) {
      openIntro();
    } else {
      closeIntro();
    }
  });
})();