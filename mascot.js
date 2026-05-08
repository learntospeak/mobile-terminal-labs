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

  window.PatchMascot = {
    getMascotSrc,
    getMascotAlt,
    normalizeState
  };
})();
