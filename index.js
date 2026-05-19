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

  function renderResumePanel() {
    if (!els.resumeActions) {
      return;
    }

    const lastProgress = NetlabApp.getLastActiveProgress();
    const beginnerHref = NetlabApp.buildSectionUrl("windows-terminal", "start");

    if (!lastProgress) {
      els.resumeActions.hidden = false;
      els.resumeActions.innerHTML = [
        "<a id=\"resumeLastBtn\" class=\"app-action-link\" href=\"" + escapeHtml(beginnerHref) + "\">Resume Beginner Lab</a>"
      ].join("");
      return;
    }

    els.resumeActions.hidden = false;
    const resumeHref = NetlabApp.buildSectionUrl(lastProgress.sectionId, "resume");

    els.resumeActions.innerHTML = [
      "<a id=\"resumeLastBtn\" class=\"app-action-link\" href=\"" + escapeHtml(resumeHref) + "\">Resume Last Lab</a>",
      "<button id=\"startOverLastBtn\" class=\"app-action-btn app-action-btn-muted\" type=\"button\">Start Over</button>"
    ].join("");

    const startOverBtn = document.getElementById("startOverLastBtn");
    if (startOverBtn) {
      startOverBtn.addEventListener("click", function () {
        NetlabApp.resetSectionProgress(lastProgress.sectionId);
        window.location.href = NetlabApp.buildSectionUrl(lastProgress.sectionId, "start");
      });
    }
  }

  function openResumeModal() {}
  function closeResumeModal() {}

  function renderCardProgress() {
    const progressMap = NetlabApp.getAllSectionProgress();

    els.cardProgressSlots.forEach(function (slot) {
      const sectionId = slot.dataset.progressSlot;
      const progress = progressMap[sectionId];

      if (!progress) {
        slot.textContent = "Not Started";
        return;
      }

      slot.textContent = deriveProgressStatus(progress);
    });
  }

  function deriveProgressStatus(progress) {
    if (!progress) {
      return "Not Started";
    }

    if (progress.totalCount && progress.completedCount >= progress.totalCount) {
      return "Complete";
    }

    if (progress.completedCount > 0 || (progress.currentItemLabel && progress.currentItemLabel !== "Not started")) {
      return "In Progress";
    }

    return "Not Started";
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
})();