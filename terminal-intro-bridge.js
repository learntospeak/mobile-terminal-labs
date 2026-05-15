(() => {
  function shouldShowIntro() {
    const config = window.TerminalCoachConfig || {};
    const params = new URLSearchParams(window.location.search);
    const forced = params.get("intro") === "1";
    const skipped = params.get("skipIntro") === "1";

    if (skipped) return false;
    return forced || Boolean(config.isBeginnerMode);
  }

  function closeIntro() {
    const overlay = document.getElementById("terminalIntroOverlay");
    const frame = document.getElementById("terminalIntroFrame");

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

  function openIntro() {
    const overlay = document.getElementById("terminalIntroOverlay");
    const frame = document.getElementById("terminalIntroFrame");
    const skipButton = document.getElementById("terminalIntroSkipBtn");

    if (!overlay || !frame) return;

    if (overlay.parentElement !== document.body) {
      document.body.appendChild(overlay);
    }
    frame.src = "./side-scroller-intro/index.html?embed=terminal";
    overlay.hidden = false;
    document.documentElement.classList.add("terminal-intro-root-open");
    document.body.classList.add("terminal-intro-open");
    skipButton?.focus?.({ preventScroll: true });
  }

  window.addEventListener("message", (event) => {
    if (event.origin !== window.location.origin) return;
    if (event.data?.type === "netlab:intro-complete") {
      closeIntro();
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("terminalIntroSkipBtn")?.addEventListener("click", () => closeIntro());

    if (shouldShowIntro()) {
      openIntro();
    }
  });
})();
