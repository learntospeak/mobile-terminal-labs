(function () {
  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function isWindowsState(state) {
    return state.platform === "cmd";
  }

  function isCiscoState(state) {
    return state.platform === "cisco";
  }

  function normalizeInputPath(input) {
    return (input || "").replace(/\\/g, "/").trim();
  }

  function normalizeWindowsDriveValue(value) {
    const normalized = String(value || "C:").trim();
    if (!normalized) {
      return "C:";
    }

    return normalized.replace(/^([A-Za-z]):?(?=$)/, (_, letter) => `${letter.toUpperCase()}:`);
  }

  function normalizeWindowsDrivePath(path) {
    return String(path || "").replace(/^([A-Za-z]):(?=\/|$)/, (_, letter) => `${letter.toUpperCase()}:`);
  }

  function getRootPath(state) {
    return isWindowsState(state) ? `${normalizeWindowsDriveValue(state.drive)}/` : "/";
  }

  function splitPath(path) {
    return path.split("/").filter(Boolean);
  }

  function joinPath(base, part, windows) {
    if (!base.endsWith("/")) {
      return `${base}/${part}`;
    }

    return `${base}${part}`;
  }

  function normalizePath(state, inputPath, basePath) {
    const windows = isWindowsState(state);
    const base = windows
      ? normalizeWindowsDrivePath(normalizeInputPath(basePath || state.cwd || getRootPath(state)))
      : normalizeInputPath(basePath || state.cwd || getRootPath(state));
    const raw = windows
      ? normalizeWindowsDrivePath(normalizeInputPath(inputPath || ""))
      : normalizeInputPath(inputPath || "");

    if (!raw || raw === ".") return base;

    if (!windows && raw === "~") {
      return state.home;
    }

    if (!windows && raw.startsWith("~/")) {
      return `${state.home}/${raw.slice(2)}`.replace(/\/+/g, "/");
    }

    let working;

    if (windows) {
      if (/^[A-Za-z]:\//.test(raw)) {
        working = raw;
      } else if (/^[A-Za-z]:$/.test(raw)) {
        working = `${raw}/`;
      } else if (raw.startsWith("/")) {
        working = `${normalizeWindowsDriveValue(state.drive)}${raw}`;
      } else {
        working = joinPath(base, raw, true);
      }
    } else if (raw.startsWith("/")) {
      working = raw;
    } else {
      working = joinPath(base, raw, false);
    }

    const prefix = windows ? `${working.slice(0, 2)}/` : "/";
    const remainder = windows ? working.slice(3) : working.slice(1);
    const parts = splitPath(remainder);
    const resolved = [];

    parts.forEach((part) => {
      if (part === "." || part === "") return;
      if (part === "..") {
        resolved.pop();
        return;
      }
      resolved.push(part);
    });

    if (windows) {
      return `${working.slice(0, 2)}/${resolved.join("/")}`.replace(/\/$/, "") || prefix;
    }

    return `${prefix}${resolved.join("/")}`.replace(/\/$/, "") || "/";
  }

  function displayPath(state, path, forPrompt = false) {
    if (isWindowsState(state)) {
      return normalizeWindowsDrivePath(path).replace(/\//g, "\\");
    }

    if (forPrompt && path.startsWith(state.home)) {
      const suffix = path.slice(state.home.length);
      return suffix ? `~${suffix}` : "~";
    }

    return path;
  }

  function getNameFromPath(path) {
    const trimmed = path.replace(/\/$/, "");
    const parts = trimmed.split("/");
    return parts[parts.length - 1] || trimmed;
  }

  function ensureDirectory(state, path) {
    const normalized = normalizePath(state, path, getRootPath(state));

    if (state.fs[normalized]) return state.fs[normalized];

    const windows = isWindowsState(state);
    const root = getRootPath(state);

    if (!state.fs[root]) {
      state.fs[root] = {
        type: "dir",
        path: root,
        name: windows ? (state.drive || "C:") : "/",
        hidden: false
      };
    }

    if (normalized === root) {
      return state.fs[root];
    }

    const prefix = windows ? normalized.slice(0, 2) : "";
    const remainder = windows ? normalized.slice(3) : normalized.slice(1);
    const parts = splitPath(remainder);
    let current = root;

    parts.forEach((part, index) => {
      current = windows
        ? `${prefix}/${parts.slice(0, index + 1).join("/")}`
        : `/${parts.slice(0, index + 1).join("/")}`;

      if (!state.fs[current]) {
        state.fs[current] = {
          type: "dir",
          path: current,
          name: getNameFromPath(current),
          hidden: part.startsWith("."),
          createdAt: Date.now()
        };
      }
    });

    return state.fs[normalized];
  }

  function createFile(state, fileDef) {
    const normalized = normalizePath(state, fileDef.path, getRootPath(state));
    const parent = normalized.includes("/")
      ? normalized.slice(0, normalized.lastIndexOf("/")) || getRootPath(state)
      : getRootPath(state);

    ensureDirectory(state, parent);

    state.fs[normalized] = {
      type: "file",
      path: normalized,
      name: getNameFromPath(normalized),
      hidden: Boolean(fileDef.hidden),
      attributes: clone(fileDef.attributes || []),
      content: fileDef.content || "",
      archiveEntries: clone(fileDef.archiveEntries || []),
      executable: Boolean(fileDef.executable),
      downloaded: Boolean(fileDef.downloaded)
    };

    return state.fs[normalized];
  }

  function listChildren(state, dirPath, includeHidden = false) {
    const normalized = normalizePath(state, dirPath);
    const prefix = normalized === getRootPath(state) ? normalized : `${normalized}/`;

    return Object.values(state.fs)
      .filter((node) => {
        if (node.path === normalized) return false;
        if (!node.path.startsWith(prefix)) return false;
        const relative = node.path.slice(prefix.length);
        if (relative.includes("/")) return false;
        if (!includeHidden && node.hidden) return false;
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  function getNode(state, path) {
    return state.fs[normalizePath(state, path)];
  }

  function changeDirectory(state, targetPath) {
    const normalized = normalizePath(state, targetPath);
    const node = state.fs[normalized];

    if (!node) {
      return { ok: false, error: "No such directory" };
    }

    if (node.type !== "dir") {
      return { ok: false, error: "Not a directory" };
    }

    state.cwd = normalized;
    if (isWindowsState(state)) {
      state.drive = normalizeWindowsDriveValue(normalized.slice(0, 2));
    }
    return { ok: true, path: normalized };
  }

  function readFile(state, targetPath) {
    const node = getNode(state, targetPath);

    if (!node) return { ok: false, error: "No such file" };
    if (node.type !== "file") return { ok: false, error: "Path is not a file" };

    return { ok: true, content: node.content, node };
  }

  function writeFile(state, targetPath, content, append = false) {
    const normalized = normalizePath(state, targetPath);
    const existing = state.fs[normalized];

    if (existing && existing.type !== "file") {
      return { ok: false, error: "Path is not a file" };
    }

    if (!existing) {
      createFile(state, { path: normalized, content });
      return { ok: true, node: state.fs[normalized] };
    }

    existing.content = append ? `${existing.content}${content}` : content;
    return { ok: true, node: existing };
  }

  function mkdir(state, targetPath) {
    const normalized = normalizePath(state, targetPath);
    const existing = state.fs[normalized];

    if (existing) {
      if (existing.type === "dir") {
        return { ok: true, path: normalized };
      }

      return { ok: false, error: "Path exists and is not a directory" };
    }

    ensureDirectory(state, normalized);
    return { ok: true, path: normalized };
  }

  function touch(state, targetPath) {
    const normalized = normalizePath(state, targetPath);

    if (state.fs[normalized] && state.fs[normalized].type === "dir") {
      return { ok: false, error: "Cannot touch a directory" };
    }

    if (!state.fs[normalized]) {
      createFile(state, { path: normalized, content: "" });
    }

    return { ok: true, path: normalized };
  }

  function collectDescendants(state, sourcePath) {
    const normalized = normalizePath(state, sourcePath);
    const prefix = normalized.endsWith("/") ? normalized : `${normalized}/`;

    return Object.values(state.fs)
      .filter((node) => node.path === normalized || node.path.startsWith(prefix))
      .sort((a, b) => a.path.localeCompare(b.path));
  }

  function removePath(state, targetPath, recursive = false) {
    const normalized = normalizePath(state, targetPath);
    const node = state.fs[normalized];

    if (!node) return { ok: false, error: "No such file or directory" };

    if (node.type === "dir") {
      const children = listChildren(state, normalized, true);
      if (children.length && !recursive) {
        return { ok: false, error: "Directory not empty" };
      }

      collectDescendants(state, normalized).forEach((entry) => {
        delete state.fs[entry.path];
      });
      return { ok: true };
    }

    delete state.fs[normalized];
    return { ok: true };
  }

  function copyPath(state, sourcePath, destPath) {
    const source = getNode(state, sourcePath);
    if (!source) return { ok: false, error: "Source not found" };

    const sourceNormalized = normalizePath(state, sourcePath);
    let destNormalized = normalizePath(state, destPath);
    const destinationNode = state.fs[destNormalized];

    if (destinationNode && destinationNode.type === "dir") {
      const sourceNode = state.fs[sourceNormalized];
      const sourceName = sourceNode ? sourceNode.name : sourceNormalized.split("/").pop();
      destNormalized = normalizePath(state, sourceName, destNormalized);
    }

    if (source.type === "file") {
      createFile(state, {
        path: destNormalized,
        content: source.content,
        hidden: source.hidden,
        attributes: source.attributes,
        archiveEntries: source.archiveEntries
      });
      return { ok: true };
    }

    collectDescendants(state, sourceNormalized).forEach((node) => {
      const relative = node.path.slice(sourceNormalized.length).replace(/^\//, "");
      const target = relative ? `${destNormalized}/${relative}` : destNormalized;
      if (node.type === "dir") {
        ensureDirectory(state, target);
      } else {
        createFile(state, {
          path: target,
          content: node.content,
          hidden: node.hidden,
          attributes: node.attributes,
          archiveEntries: node.archiveEntries
        });
      }
    });

    return { ok: true };
  }

  function movePath(state, sourcePath, destPath) {
    const copied = copyPath(state, sourcePath, destPath);
    if (!copied.ok) return copied;
    return removePath(state, sourcePath, true);
  }

  function listProcesses(state) {
    return [...state.processes].sort((a, b) => a.pid - b.pid);
  }

  function killProcess(state, pid) {
    const index = state.processes.findIndex((process) => String(process.pid) === String(pid));
    if (index === -1) return { ok: false, error: "Process not found" };
    const [removed] = state.processes.splice(index, 1);
    return { ok: true, process: removed };
  }

  function openListener(state, listener) {
    state.listeners.push({ ...listener });
    return { ok: true };
  }

  function clearListeners(state) {
    state.listeners = [];
  }

  function findTarget(state, search) {
    const value = (search || "").trim();
    return state.targets.find((target) => {
      if (target.ip === value) return true;
      if (target.hostname === value) return true;
      return (target.aliases || []).includes(value);
    });
  }

  function recordDiscovery(state, record) {
    state.discovery.push({ ...record, recordedAt: Date.now() });
  }

  function extractArchive(state, archivePath) {
    const archive = getNode(state, archivePath);

    if (!archive) return { ok: false, error: "Archive not found" };
    if (archive.type !== "file") return { ok: false, error: "Path is not a file" };
    if (!archive.archiveEntries || !archive.archiveEntries.length) {
      const archiveName = getNameFromPath(archive.path)
        .replace(/\.tar\.gz$/i, "")
        .replace(/\.tgz$/i, "")
        .replace(/\.zip$/i, "");
      archive.archiveEntries = [
        { path: archiveName, type: "dir" },
        { path: `${archiveName}/README.txt`, content: `Extracted contents for ${archiveName}.\n` },
        { path: `${archiveName}/manifest.txt`, content: `${archiveName} manifest\n` },
        { path: `${archiveName}/app.conf`, content: "mode=lab\n" }
      ];
    }

    const parent = archive.path.slice(0, archive.path.lastIndexOf("/")) || getRootPath(state);

    archive.archiveEntries.forEach((entry) => {
      const target = normalizePath(state, entry.path, parent);
      if (entry.type === "dir") {
        ensureDirectory(state, target);
      } else {
        createFile(state, {
          path: target,
          content: entry.content || "",
          hidden: Boolean(entry.hidden),
          executable: Boolean(entry.executable)
        });
      }
    });

    state.extractedArchives.push(archive.path);
    return { ok: true };
  }

  function addAmbientDirectory(state, path) {
    if (!state.fs[normalizePath(state, path, getRootPath(state))]) {
      ensureDirectory(state, path);
    }
  }

  function addAmbientFile(state, fileDef) {
    const normalized = normalizePath(state, fileDef.path, getRootPath(state));
    if (!state.fs[normalized]) {
      createFile(state, fileDef);
    }
  }

  function addAmbientFilesForDirectory(state, dirPath, files) {
    files.forEach((file) => {
      addAmbientFile(state, {
        path: `${dirPath}/${file.name}`,
        content: file.content,
        hidden: Boolean(file.hidden),
        attributes: file.attributes || []
      });
    });
  }

  function applyWindowsFilesystemDressing(state) {
    [
      "C:/Lab/Archive",
      "C:/Lab/Archive/Old",
      "C:/Lab/Evidence",
      "C:/Lab/Notes",
      "C:/Lab/Reports/Drafts",
      "C:/Lab/Temp/Staging",
      "C:/Lab/Tickets",
      "C:/Lab/Tools",
      "C:/Lab/Tools/Docs",
      "C:/Lab/Tools/Scripts",
      "C:/Users/student/Desktop/Tickets",
      "C:/Users/student/Downloads/Installers"
    ].forEach((dir) => addAmbientDirectory(state, dir));

    addAmbientFilesForDirectory(state, "C:/Lab", [
      { name: "README.txt", content: "Lab workspace. Check the ticket before changing files.\r\n" },
      { name: "case-index.txt", content: "INC-1042  open\r\nINC-1041  archived\r\n" }
    ]);
    addAmbientFilesForDirectory(state, "C:/Lab/Reports", [
      { name: "draft-summary.txt", content: "Draft summary - verify evidence before submitting.\r\n" },
      { name: "previous-ticket.txt", content: "Previous ticket closed after service restart.\r\n" }
    ]);
    addAmbientFilesForDirectory(state, "C:/Lab/Logs", [
      { name: "system.log", content: "INFO boot complete\r\nWARN update retry scheduled\r\n" },
      { name: "access-old.log", content: "analyst login accepted\r\nservice account reviewed\r\n" }
    ]);
    addAmbientFilesForDirectory(state, "C:/Lab/Notes", [
      { name: "handoff-note.txt", content: "Night shift asked for a clean evidence trail.\r\n" },
      { name: "scratch.txt", content: "Remember to confirm the exact folder before copying.\r\n" }
    ]);
    addAmbientFilesForDirectory(state, "C:/Lab/Archive", [
      { name: "readme.txt", content: "Older material lives here. Do not use it unless the ticket asks.\r\n" },
      { name: "old-case-note.bak", content: "Archived note from a previous case.\r\n" }
    ]);
    addAmbientFilesForDirectory(state, "C:/Lab/Temp", [
      { name: "session.tmp", content: "temporary workspace marker\r\n" },
      { name: "do-not-delete-current.txt", content: "Current collection marker.\r\n" }
    ]);
    addAmbientFilesForDirectory(state, "C:/Lab/Tools/Docs", [
      { name: "usage-notes.txt", content: "Tool notes: list folders before running scripts.\r\n" },
      { name: "network-checklist.txt", content: "ipconfig, ping, nslookup, route print\r\n" }
    ]);
    addAmbientFilesForDirectory(state, "C:/Lab/Tickets", [
      { name: "open-ticket.txt", content: "User reports intermittent access to shared resources.\r\n" },
      { name: "triage-queue.txt", content: "network share, backup job, workstation identity\r\n" }
    ]);
  }

  function applyLinuxFilesystemDressing(state) {
    [
      "/home/student/archive",
      "/home/student/downloads/tmp",
      "/home/student/evidence",
      "/home/student/notes",
      "/home/student/output/old",
      "/home/student/reports/drafts",
      "/home/student/scripts/helpers",
      "/home/student/targets",
      "/tmp/lab",
      "/var/log/archive",
      "/srv/app",
      "/srv/app/logs"
    ].forEach((dir) => addAmbientDirectory(state, dir));

    addAmbientFilesForDirectory(state, "/home/student", [
      { name: "README.txt", content: "Student lab home. Start with pwd and ls when unsure.\n" },
      { name: ".bash_history", content: "pwd\nls\ncat reports/readme.txt\n", hidden: true }
    ]);
    addAmbientFilesForDirectory(state, "/home/student/reports", [
      { name: "draft-notes.txt", content: "Draft notes - replace guesses with evidence.\n" },
      { name: "old-summary.txt", content: "Older summary kept for comparison only.\n" }
    ]);
    addAmbientFilesForDirectory(state, "/home/student/targets", [
      { name: "scope.txt", content: "Stay inside the lab hosts and documented target names.\n" },
      { name: "hosts-backup.txt", content: "web-lab\nmail-lab\nfileserver\nmetasploitable2\n" }
    ]);
    addAmbientFilesForDirectory(state, "/home/student/output", [
      { name: "scan-draft.txt", content: "Draft output from an earlier practice run.\n" },
      { name: "notes.tmp", content: "temporary output notes\n" }
    ]);
    addAmbientFilesForDirectory(state, "/home/student/downloads", [
      { name: "download-log.txt", content: "2026-04-17 package cached\n2026-04-17 evidence copied\n" },
      { name: "README.txt", content: "Downloaded lab material and temporary files.\n" }
    ]);
    addAmbientFilesForDirectory(state, "/home/student/recon", [
      { name: "recon-notes.txt", content: "Confirm target names before scanning.\n" },
      { name: "old-targets.txt", content: "legacy-web\nlegacy-mail\n" }
    ]);
    addAmbientFilesForDirectory(state, "/home/student/evidence", [
      { name: "chain-of-custody.txt", content: "Record what was read, copied, or moved.\n" },
      { name: "old-access.log", content: "user=guest src=10.0.0.25 status=expired\n" }
    ]);
    addAmbientFilesForDirectory(state, "/home/student/scripts", [
      { name: "README.md", content: "Helper scripts live in subfolders. Check before running.\n" },
      { name: "todo.txt", content: "add argument checks\nsave output under reports\n" }
    ]);
    addAmbientFilesForDirectory(state, "/var/log", [
      { name: "auth.log", content: "Accepted password for student from 10.0.0.15\n" },
      { name: "daemon.log", content: "lab-daemon started\nlab-daemon health check ok\n" }
    ]);
    addAmbientFilesForDirectory(state, "/srv/app/logs", [
      { name: "app.log", content: "INFO app boot\nWARN cache rebuild pending\n" },
      { name: "access.log", content: "GET /health 200\nGET /login 200\n" }
    ]);
  }

  function applyFilesystemDressing(state, base) {
    if (base.filesystemDressing === false || isCiscoState(state)) return;

    if (isWindowsState(state)) {
      applyWindowsFilesystemDressing(state);
      return;
    }

    applyLinuxFilesystemDressing(state);
  }

  function createState(environment) {
    const base = clone(environment);
    const ciscoPlatform = base.platform === "cisco";
    const defaultCiscoHostname = base.hostname || base.host || "Router";
    const state = {
      platform: base.platform || "linux",
      shell: base.platform || "linux",
      user: base.user || (base.platform === "cmd" ? "student" : ciscoPlatform ? "" : "student"),
      host: base.host || (ciscoPlatform ? defaultCiscoHostname : "lab"),
      drive: normalizeWindowsDriveValue(base.drive || "C:"),
      cwd: base.cwd || (base.platform === "cmd" ? "C:/Users/student" : ciscoPlatform ? "/" : "/home/student"),
      home: base.home || (base.platform === "cmd" ? "C:/Users/student" : ciscoPlatform ? "/" : "/home/student"),
      fs: {},
      processes: clone(base.processes || []),
      targets: clone(base.targets || []),
      envVars: clone(base.envVars || {}),
      systemInfo: clone(base.systemInfo || {}),
      networkAdapters: clone(base.networkAdapters || []),
      networkConnections: clone(base.networkConnections || []),
      arpCache: clone(base.arpCache || []),
      routeTable: clone(base.routeTable || []),
      dnsRecords: clone(base.dnsRecords || []),
      services: clone(base.services || []),
      drivers: clone(base.drivers || []),
      userSessions: clone(base.userSessions || []),
      localUsers: clone(base.localUsers || []),
      localGroups: clone(base.localGroups || []),
      shares: clone(base.shares || []),
      mappedShares: clone(base.mappedShares || []),
      scheduledTasks: clone(base.scheduledTasks || []),
      pathExecutables: clone(base.pathExecutables || []),
      currentDate: base.currentDate || "04/17/2026",
      currentTime: base.currentTime || "08:24 AM",
      promptTemplate: base.promptTemplate || "$P$G",
      pendingShutdown: null,
      discovery: [],
      listeners: [],
      extractedArchives: [],
      metasploit: {
        active: false,
        currentModule: null,
        options: {}
      },
      activeConnection: null,
      history: [],
      completedScenarioIds: clone(base.completedScenarioIds || []),
      router: clone(base.router || {
        hostname: defaultCiscoHostname,
        mode: "user-exec",
        selectedInterface: null,
        configDirty: false,
        version: base.version || "Cisco IOS Software, 1900 Software (C1900-UNIVERSALK9-M), Version 15.4(3)M",
        model: base.model || "Cisco 1941/K9",
        image: base.image || "flash:c1900-universalk9-mz.SPA.154-3.M.bin",
        serialNumber: base.serialNumber || "FTX0001ABCD",
        uptime: base.uptime || "2 weeks, 4 days, 1 hour, 12 minutes",
        configRegister: base.configRegister || "0x2102",
        interfaces: clone(base.interfaces || []),
        staticRoutes: clone(base.staticRoutes || []),
        startupConfig: clone(base.startupConfig || null)
      })
    };

    if (ciscoPlatform) {
      state.host = state.router.hostname || defaultCiscoHostname;
    }

    state.home = normalizePath(state, state.home, getRootPath(state));
    state.cwd = normalizePath(state, state.cwd, state.home);

    ensureDirectory(state, getRootPath(state));
    ensureDirectory(state, state.home);
    ensureDirectory(state, state.cwd);

    (base.directories || []).forEach((dir) => ensureDirectory(state, dir));
    (base.files || []).forEach((file) => createFile(state, file));
    applyFilesystemDressing(state, base);

    return state;
  }

  function getPrompt(state) {
    if (isCiscoState(state)) {
      const routerState = state.router || {};
      const hostName = routerState.hostname || state.host || "Router";

      switch (routerState.mode) {
        case "privileged-exec":
          return `${hostName}#`;
        case "global-config":
          return `${hostName}(config)#`;
        case "interface-config":
          return `${hostName}(config-if)#`;
        default:
          return `${hostName}>`;
      }
    }

    if (state.metasploit.active) return "msf6 >";
    if (state.activeConnection) {
      if (state.activeConnection.type === "smtp") return "smtp>";
      if (state.activeConnection.type === "shell") return "shell>";
      return "conn>";
    }

    if (isWindowsState(state)) {
      const template = String(state.promptTemplate || "$P$G");
      const driveLetter = String(state.drive || "C:").replace(":", "");
      const rendered = template
        .replace(/\$\$/g, "\u0000")
        .replace(/\$P/gi, displayPath(state, state.cwd))
        .replace(/\$N/gi, driveLetter)
        .replace(/\$G/gi, ">")
        .replace(/\$L/gi, "<")
        .replace(/\$B/gi, "|")
        .replace(/\$Q/gi, "=")
        .replace(/\$_/gi, "\n")
        .replace(/\$S/gi, " ")
        .replace(/\$D/gi, state.currentDate || "04/17/2026")
        .replace(/\$T/gi, state.currentTime || "08:24 AM")
        .replace(/\u0000/g, "$");

      return rendered || `${displayPath(state, state.cwd)}>`;
    }

    return `${state.user}@${state.host}:${displayPath(state, state.cwd, true)}$`;
  }

  window.StateManager = {
    clone,
    createState,
    normalizePath,
    displayPath,
    getPrompt,
    getNode,
    listChildren,
    readFile,
    writeFile,
    mkdir,
    touch,
    changeDirectory,
    removePath,
    copyPath,
    movePath,
    listProcesses,
    killProcess,
    openListener,
    clearListeners,
    findTarget,
    recordDiscovery,
    extractArchive,
    isWindowsState,
    isCiscoState
  };
})();
