(function () {
  const TARGET_ID = "win-dir-incident-triage";
  function commandMatch(command, extras = {}) { return { command, ...extras }; }
  function rawMatch(raw, extras = {}) { return { raw, ...extras }; }
  function cwdMatch(path, extras = {}) { return { command: "cd", finalCwd: path, ...extras }; }
  function explore(match, feedback) { return { match: typeof match === "string" ? { command: match } : { raw: match }, feedback }; }

  const engine = window.ScenarioEngine;
  if (!engine || !Array.isArray(engine.scenarios)) return;
  const scenario = engine.scenarios.find((item) => item && item.id === TARGET_ID);
  if (!scenario || scenario.__goldPatched) return;
  scenario.__goldPatched = true;

  const commonExploration = [
    explore("dir", "Good. You looked at the current folder."),
    explore(/^cd\s+\.\.$/i, "You moved back one folder. Check the prompt, then continue toward Incidents and Notes."),
    explore(/^cd\s+(logs|reports|temp)$/i, "That folder exists, but this task needs Incidents. Use cd .., then cd Incidents."),
    explore(/^cd\s+incidents\\notes$/i, "That direct path is valid if you are starting from C:\\Lab."),
    explore(/^type\s+.+/i, "Reading files is fine. For this task, make sure you are in Incidents\\Notes and read summary.txt.")
  ];

  Object.assign(scenario, {
    title: "Incident Folder Triage",
    category: "Beginner Windows CMD",
    level: "Beginner",
    difficulty: "Beginner",
    shell: "cmd",
    environmentCategory: "windows",
    objective: "Use Windows CMD to find and read a note inside the lab folders.",
    allowedFlexibility: "You may use dir, cd, cd .., relative paths, or absolute paths. Wrong folders are allowed; the lab guides you back.",
    commandFocus: ["dir", "cd", "type"],
    beginnerLabLevelId: "level-1-terminal-orientation",
    beginnerTicket: {
      happened: "A ticket says there is a note somewhere in the lab folders.",
      meaning: "Use CMD to look around, move through folders, and read the note file.",
      tryFirst: "Start with dir. If you go into the wrong folder, use cd .. to go back."
    },
    visualGuide: {
      type: "folder-map",
      root: "C:/Lab",
      relevantPaths: ["C:/Lab/Incidents", "C:/Lab/Incidents/Notes", "C:/Lab/Incidents/Notes/summary.txt"],
      commandMap: [
        { command: "dir", icon: "👀", meaning: "Look inside" },
        { command: "cd Incidents", icon: "➡️", meaning: "Move to Incidents" },
        { command: "cd Notes", icon: "➡️", meaning: "Move to Notes" },
        { command: "cd ..", icon: "↩️", meaning: "Go back" },
        { command: "type summary.txt", icon: "📄", meaning: "Read the note" }
      ]
    },
    environment: {
      ...(scenario.environment || {}),
      platform: "cmd",
      user: "student",
      host: "lab-win",
      home: "C:/Users/student",
      drive: "C:",
      cwd: "C:/Lab",
      directories: ["C:/Users/student", "C:/Lab", "C:/Lab/Incidents", "C:/Lab/Incidents/Notes", "C:/Lab/Logs", "C:/Lab/Reports", "C:/Lab/Temp"],
      files: [
        { path: "C:/Lab/Incidents/Notes/summary.txt", content: "Summary: this note is the file the ticket asked you to find.\n" },
        { path: "C:/Lab/Logs/app.log", content: "INFO started\nWARN old entry\n" },
        { path: "C:/Lab/Reports/readme.txt", content: "Reports folder. This is not the note for the first task.\n" }
      ]
    },
    steps: [
      { objective: "List the current lab workspace.", commandFamily: "dir", context: "You are starting at C:\\Lab. Look at what folders are available before moving.", hints: ["Start by looking around.", "In Windows CMD, use dir to list the current folder.", "Try `dir`."], demoCommand: "dir", accepts: [commandMatch("dir")], exploration: commonExploration },
      { objective: "Move into the Incidents folder.", commandFamily: "cd", context: "From C:\\Lab, the correct first folder is Incidents.", hints: ["Use cd to change folder.", "The folder name is Incidents.", "Try `cd Incidents`. If you went somewhere else, use `cd ..` first."], demoCommand: "cd Incidents", accepts: [cwdMatch("C:/Lab/Incidents")], partials: [{ match: { finalCwd: "C:/Lab/Logs" }, feedback: "Logs is real, but this task needs Incidents. Use cd .., then cd Incidents." }, { match: { finalCwd: "C:/Lab/Reports" }, feedback: "Reports is real, but this task needs Incidents. Use cd .., then cd Incidents." }], exploration: commonExploration },
      { objective: "Move into the Notes folder inside Incidents.", commandFamily: "cd", context: "You should be in C:\\Lab\\Incidents. The note is inside Notes.", hints: ["Look for the Notes folder if you are unsure.", "Use cd again to enter Notes.", "Try `cd Notes`. If you are back at C:\\Lab, use `cd Incidents\\Notes`."], demoCommand: "cd Notes", accepts: [cwdMatch("C:/Lab/Incidents/Notes")], partials: [{ match: { finalCwd: "C:/Lab" }, feedback: "You are back at C:\\Lab. Use cd Incidents\\Notes or cd Incidents then cd Notes." }, { match: { finalCwd: "C:/Lab/Logs" }, feedback: "You are in Logs. Use cd .., then cd Incidents\\Notes." }], exploration: commonExploration },
      { objective: "List the Notes folder contents.", commandFamily: "dir", context: "Now that you are inside Notes, list the files before opening one.", hints: ["Check what files are here.", "Use dir again.", "Try `dir`."], demoCommand: "dir", accepts: [commandMatch("dir")], exploration: commonExploration },
      { objective: "Read the summary file.", commandFamily: "type", context: "The file is summary.txt. Use the CMD file-reading command.", hints: ["Use type to read a text file in CMD.", "The file is summary.txt.", "Try `type summary.txt`."], demoCommand: "type summary.txt", accepts: [rawMatch(/^type\s+summary\.txt$/i)], partials: [{ match: { command: "type" }, feedback: "Use type with the exact file name: summary.txt. If CMD cannot find it, check that the prompt ends in Incidents\\Notes." }], exploration: commonExploration }
    ]
  });

  const params = new URLSearchParams(window.location.search);
  const requested = params.get("scenario") || params.get("scenarioId") || params.get("lesson");
  if (requested === TARGET_ID || requested === "incident-folder-triage") {
    engine.scenarios = [scenario, ...engine.scenarios.filter((item) => item && item.id !== TARGET_ID)];
  }
})();
