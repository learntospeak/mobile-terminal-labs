(function () {
  const ASSET_BASE = "./assets/mascot/";
  const STATE_FILES = {
    main: "patch-main.png",
    happy: "patch-happy.png",
    thinking: "patch-thinking.png",
    confused: "patch-confused.png",
    excited: "patch-excited.png",
    nicework: "patch-nicework.png",
    ping: "patch-ping.png",
    traceroute: "patch-traceroute.png",
    ipconfig: "patch-ipconfig.png",
    nslookup: "patch-nslookup.png",
    files: "patch-files.png"
  };

  const ALT_TEXT = {
    main: "Patch, the beginner IT guide",
    happy: "Patch smiling",
    thinking: "Patch thinking",
    confused: "Patch helping after a mistake",
    excited: "Patch celebrating progress",
    nicework: "Patch celebrating progress",
    ping: "Patch checking a network connection",
    traceroute: "Patch tracing a network path",
    ipconfig: "Patch showing network information",
    nslookup: "Patch checking DNS",
    files: "Patch looking at files"
  };

  function normalizeState(state) {
    const key = String(state || "main").toLowerCase().replace(/[^a-z0-9-]/g, "");
    return STATE_FILES[key] ? key : "main";
  }

  function getMascotSrc(state = "main") {
    return `${ASSET_BASE}${STATE_FILES[normalizeState(state)]}`;
  }

  function getMascotAlt(state = "main") {
    return ALT_TEXT[normalizeState(state)] || ALT_TEXT.main;
  }

  function loadStylesheet(id, href) {
    if (typeof document === "undefined" || document.getElementById(id)) return;
    const css = document.createElement("link");
    css.id = id;
    css.rel = "stylesheet";
    css.href = href;
    document.head.appendChild(css);
  }

  function loadTerminalPatches() {
    if (typeof window === "undefined") return;
    window.setTimeout(() => {
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
    }, 0);
  }

  loadStylesheet("appThemeStylesheet", "./app-theme.css?v=20260520theme1");
  loadStylesheet("terminalModalScrollFixStylesheet", "./modal-scroll-fix.css?v=20260521modal1");
  loadTerminalPatches();

  window.PatchMascot = {
    getMascotSrc,
    getMascotAlt,
    normalizeState
  };
})();