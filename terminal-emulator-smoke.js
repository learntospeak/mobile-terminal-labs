// Terminal emulator smoke tests.
// Open a terminal lab page, then run in DevTools:
// NetlabEmulatorSmokeTest.run()

(function () {
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
      directories: [
        "C:/Lab",
        "C:/Lab/Incidents",
        "C:/Lab/Incidents/Notes",
        "C:/Lab/Logs",
        "C:/Lab/Reports"
      ],
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
    const state = S.createState({
      platform: "cisco",
      host: "Router",
      cwd: "/",
      home: "/",
      router: {
        hostname: "Router",
        mode: "user-exec",
        selectedInterface: null,
        interfaces: [],
        staticRoutes: [],
        startupConfig: null
      }
    });

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
    return {
      windows: runWindows(),
      linux: runLinux(),
      cisco: runCisco()
    };
  }

  window.NetlabEmulatorSmokeTest = { run, runWindows, runLinux, runCisco };
})();
