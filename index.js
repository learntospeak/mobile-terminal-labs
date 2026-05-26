(function () {
  const NetlabApp = window.NetlabApp;

  if (!NetlabApp) {
    return;
  }

  const view = {
    authMode: "",
    error: "",
    notice: "",
    noticeTone: "info",
    busy: false
  };

  const els = {};

  document.addEventListener("DOMContentLoaded", init);

  function getRequestedAuthMode() {
    const params = new URLSearchParams(window.location.search);
    const requested = String(params.get("auth") || "").toLowerCase();
    return requested === "login" || requested === "signup" ? requested : "";
  }

  function clearRequestedAuthMode() {
    const url = new URL(window.location.href);
    url.searchParams.delete("auth");
    window.history.replaceState({}, "", url.href);
  }

  function focusRequestedAuth(mode) {
    window.requestAnimationFrame(function () {
      if (els.accountPanel) {
        els.accountPanel.scrollIntoView({ block: "start", behavior: "smooth" });
      }

      const firstField = document.getElementById(mode === "signup" ? "signUpUsername" : "logInEmail");
      if (firstField && typeof firstField.focus === "function") {
        firstField.focus({ preventScroll: true });
      }
    });
  }

  async function init() {
    els.accountPanel = document.getElementById("hubAccountPanel");
    els.resumeActions = document.getElementById("hubResumeActions");
    els.resumeModal = document.getElementById("hubResumeModal");
    els.resumeModalCopy = document.getElementById("hubResumeModalCopy");
    els.resumeContinue = document.getElementById("hubResumeContinue");
    els.resumeModalClose = document.getElementById("hubResumeModalClose");
    els.resumeModalCancel = document.getElementById("hubResumeModalCancel");
    els.resumeModalBackdrop = document.getElementById("hubResumeModalBackdrop");
    els.cardProgressSlots = Array.from(document.querySelectorAll("[data-progress-slot]"));

    bindStartJourneyCard();
    renderLoadingState();
    bindGlobalEvents();
    await NetlabApp.whenReady();
    const requestedAuthMode = getRequestedAuthMode();
    if (requestedAuthMode && NetlabApp.getActiveProfile().isGuest) {
      view.authMode = requestedAuthMode;
    }
    clearRequestedAuthMode();
    renderAll();
    if (requestedAuthMode && NetlabApp.getActiveProfile().isGuest) {
      focusRequestedAuth(requestedAuthMode);
    }
  }

  function bindStartJourneyCard() {
    const startHref = "./open-lab.html?track=windows&scenario=win-dir-incident-triage&mode=beginner&intro=1&v=start-journey-cyberops";
    const cards = Array.from(document.querySelectorAll(".dashboard-nav-card"));
    cards.forEach(function (card) {
      const title = card.querySelector("h2");
      const copy = card.querySelector("p");
      if (title && copy && title.textContent.trim().toLowerCase() === "home" && /start your journey/i.test(copy.textContent)) {
        card.setAttribute("href", startHref);
        card.removeAttribute("aria-current");
        card.setAttribute("aria-label", "Start your journey in the Windows beginner lab");
        card.addEventListener("click", function (event) {
          event.preventDefault();
          window.location.href = startHref;
        });
      }
    });
  }

  function bindGlobalEvents() {
    window.addEventListener("netlab:authchange", renderAll);
    window.addEventListener("netlab:progresschange", renderAll);
    window.addEventListener("netlab:profilemetachange", renderAll);
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeResumeModal();
      }
    });

    [els.resumeModalClose, els.resumeModalCancel, els.resumeModalBackdrop].forEach(function (button) {
      if (button) {
        button.addEventListener("click", closeResumeModal);
      }
    });
  }

  function renderLoadingState() {
    if (els.accountPanel) {
      els.accountPanel.innerHTML = [
        "<p class=\"hub-account-label\">Account</p>",
        "<p class=\"hub-account-copy\">Checking session...</p>"
      ].join("");
    }

    if (els.resumeActions) {
      els.resumeActions.hidden = true;
      els.resumeActions.innerHTML = "";
    }
    closeResumeModal();
  }

  function renderAll() {
    renderAccountPanel();
    renderResumePanel();
    renderCardProgress();
  }

  function normalizeAuthErrorMessage(message) {
    const text = String(message || "").trim();

    if (/email not confirmed/i.test(text)) {
      return "Your account was created, but the email address is not confirmed yet. Open the confirmation email, click the link, then come back here and log in with your email address.";
    }

    return text || "Authentication failed. Please try again.";
  }

  function renderAccountPanel() {
    if (!els.accountPanel) {
      return;
    }

    const profile = NetlabApp.getActiveProfile();
    const isGuest = profile.isGuest;
    const showAuthForms = isGuest;

    els.accountPanel.innerHTML = [
      "<div class=\"hub-account-head\">",
      "  <div>",
      "    <p class=\"hub-account-label\">Account</p>",
      "    <h2 class=\"hub-account-title\">" + escapeHtml(isGuest ? "Guest Mode" : profile.label) + "</h2>",
      "    <p class=\"hub-account-copy\">" + escapeHtml(isGuest
        ? "You can use the app without an account. Sign in to save your progress across devices."
        : (profile.email || "Signed in. Progress sync is active for this account.")) + "</p>",
      "  </div>",
      "</div>",
      "<div class=\"app-shell-badges hub-account-badges\">",
      "  <span class=\"status-badge status-badge-blue\">" + escapeHtml(isGuest ? "Local progress" : "Cloud sync active") + "</span>",
      "</div>",
      view.notice ? "<div class=\"app-shell-banner app-shell-banner-" + escapeHtml(view.noticeTone || "info") + "\">" + escapeHtml(view.notice) + "</div>" : "",
      view.error ? "<div class=\"app-shell-banner app-shell-banner-error\">" + escapeHtml(view.error) + "</div>" : "",
      renderAuthActions(profile),
      showAuthForms && view.authMode === "signup" ? renderSignUpForm() : "",
      showAuthForms && view.authMode === "login" ? renderLogInForm() : "",
      ""
    ].join("");

    bindAccountActions();
  }

  function renderAuthActions(profile) {
    if (profile.isGuest) {
      return [
        "<div class=\"app-shell-actions hub-account-actions\">",
        "  <button id=\"logInBtn\" class=\"app-action-btn hub-account-btn\" type=\"button\">Sign In</button>",
        "  <button id=\"signUpBtn\" class=\"app-action-btn app-action-btn-muted hub-account-btn\" type=\"button\">Sign Up</button>",
        "  <button id=\"soundToggleBtn\" class=\"app-action-btn app-action-btn-muted hub-account-btn\" type=\"button\">Sound: " + escapeHtml(NetlabApp.isSoundEnabled() ? "On" : "Off") + "</button>",
        "</div>"
      ].join("");
    }

    return [
      "<div class=\"app-shell-actions hub-account-actions\">",
      "  <button id=\"logOutBtn\" class=\"app-action-btn hub-account-btn\" type=\"button\">Log Out</button>",
      "  <button id=\"soundToggleBtn\" class=\"app-action-btn app-action-btn-muted hub-account-btn\" type=\"button\">Sound: " + escapeHtml(NetlabApp.isSoundEnabled() ? "On" : "Off") + "</button>",
      "</div>"
    ].join("");
  }

  function renderSignUpForm() { return ""; }
  function renderLogInForm() { return ""; }
  function bindAccountActions() {}
  function renderResumePanel() {}
  function openResumeModal() {}
  function closeResumeModal() {
    if (els.resumeModal) {
      els.resumeModal.hidden = true;
      document.body.classList.remove("hub-resume-modal-open");
    }
  }
  function renderCardProgress() {}
  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
})();