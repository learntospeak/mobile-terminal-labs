(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
    } else {
      callback();
    }
  }

  function text(id, value) {
    const node = document.getElementById(id);
    if (node && value) {
      node.textContent = value;
    }
  }

  function setAttr(id, name, value) {
    const node = document.getElementById(id);
    if (node && value) {
      node.setAttribute(name, value);
    }
  }

  function isTerminalPage() {
    return document.body && document.body.classList.contains("terminal-page") && document.getElementById("terminalForm");
  }

  function isRoadmapPage() {
    return document.body && document.body.classList.contains("roadmap-page");
  }

  function getTrack() {
    const params = new URLSearchParams(window.location.search);
    const requested = String(params.get("track") || "").toLowerCase();
    if (requested === "windows" || requested === "linux") {
      return requested;
    }

    try {
      const stored = String(window.localStorage.getItem("netlab:terminal-track") || "").toLowerCase();
      if (stored === "windows" || stored === "linux") {
        return stored;
      }
    } catch (error) {
      return "windows";
    }

    return "windows";
  }

  function makeCard(className, html) {
    const card = document.createElement("section");
    card.className = className;
    card.innerHTML = html;
    return card;
  }

  function addBeginnerHowTo() {
    const shell = document.querySelector(".terminal-shell");
    const layout = document.querySelector(".terminal-layout");
    if (!shell || !layout || document.getElementById("launchBeginnerHowTo")) {
      return;
    }

    const card = makeCard("launch-howto-card", [
      "<div>",
      "  <p class=\"launch-howto-kicker\">How to use this lab</p>",
      "  <h2>One problem. One command. One lesson at a time.</h2>",
      "</div>",
      "<ol class=\"launch-howto-steps\">",
      "  <li><strong>Read the problem</strong> so you know what you are fixing.</li>",
      "  <li><strong>Type a command</strong> in the terminal box, then press Run.</li>",
      "  <li><strong>Use Commands, Hint, or Guide</strong> whenever you are unsure.</li>",
      "</ol>"
    ].join(""));
    card.id = "launchBeginnerHowTo";
    shell.insertBefore(card, layout);
  }

  function addControlToggle() {
    const controls = document.querySelector(".trainer-controls.terminal-controls");
    if (!controls || document.getElementById("launchControlToggle")) {
      return;
    }

    const row = document.createElement("div");
    row.className = "launch-control-toggle-row";
    row.innerHTML = "<button id=\"launchControlToggle\" class=\"launch-control-toggle\" type=\"button\" aria-expanded=\"false\">Show extra controls</button>";
    controls.parentNode.insertBefore(row, controls);

    const toggle = document.getElementById("launchControlToggle");
    toggle.addEventListener("click", function () {
      const show = !document.body.classList.contains("launch-show-extra-controls");
      document.body.classList.toggle("launch-show-extra-controls", show);
      toggle.setAttribute("aria-expanded", String(show));
      toggle.textContent = show ? "Hide extra controls" : "Show extra controls";
    });
  }

  function addMobileCommandTip() {
    const mount = document.getElementById("terminalDockInputMount");
    if (!mount || document.getElementById("launchCommandTip")) {
      return;
    }

    const tip = document.createElement("p");
    tip.id = "launchCommandTip";
    tip.className = "launch-command-tip";
    tip.textContent = "Tip: commands are short. Spelling matters, but you can use Commands or Guide if you get stuck.";
    mount.parentNode.insertBefore(tip, mount);
  }

  function polishTerminalPage() {
    if (!isTerminalPage()) {
      return;
    }

    document.body.classList.add("launch-polished", "launch-beginner-flow");
    const track = getTrack();

    if (track === "windows") {
      text("terminalPageKicker", "Beginner IT Troubleshooting");
      text("terminalPageTitle", "Windows Terminal Lab");
      text("terminalPageIntro", "Solve beginner helpdesk-style problems using real Windows commands. Read the problem, run a command, then learn what the result means.");
      text("beginnerModeSummary", "Start with the problem. Use Commands, Hint, or Guide whenever you are not sure what to type.");
    } else {
      text("terminalPageKicker", "Beginner Linux Practice");
      text("terminalPageTitle", "Linux Terminal Lab");
      text("terminalPageIntro", "Practise Linux troubleshooting one step at a time. You can use Commands, Hint, or Guide whenever you are unsure.");
      text("beginnerModeSummary", "Start with the problem. Use Commands, Hint, or Guide whenever you are not sure what to type.");
    }

    text("commandSheetBtn", "Commands");
    text("hintBtn", "Hint");
    text("watchWalkthroughBtn", "Guide");
    text("needHelpBtn", "Ask Coach");
    text("startScenarioBtn", "Start Problem");
    text("resetScenarioBtn", "Reset Task");
    text("runCommandBtn", "Run Command");
    text("mobileContextToggleBtn", "Hide problem");
    text("terminalJumpTopBtn", "Top");
    text("terminalJumpLatestBtn", "Latest result");

    setAttr("terminalInput", "placeholder", "Type a command here, for example: ipconfig");
    setAttr("commandSheetBtn", "title", "Open command examples");
    setAttr("hintBtn", "title", "Get a small hint for the current step");
    setAttr("watchWalkthroughBtn", "title", "See a worked example");
    setAttr("needHelpBtn", "title", "Ask the built-in coach for help");

    const details = ["environmentContextCard", "helpNotesCard", "progressCard", "missionCaseFileCard"];
    details.forEach(function (id) {
      const node = document.getElementById(id);
      if (node && node.tagName.toLowerCase() === "details") {
        node.open = false;
      }
    });

    addBeginnerHowTo();
    addControlToggle();
    addMobileCommandTip();
  }

  function polishRoadmapPage() {
    if (!isRoadmapPage()) {
      return;
    }

    document.body.classList.add("launch-polished");
    const intro = document.querySelector(".terminal-intro");
    if (intro) {
      intro.textContent = "Use this page to continue your beginner terminal path. Start with Windows Terminal Lab if you are new.";
    }
  }

  ready(function () {
    polishTerminalPage();
    polishRoadmapPage();
  });
})();
