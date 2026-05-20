(function () {
  const TARGET_ID = "win-dir-incident-triage";
  function commandMatch(command, extras = {}) { return { command, ...extras }; }
  function rawMatch(raw, extras = {}) { return { raw, ...extras }; }
  function cwdMatch(path, extras = {}) { return { command: "cd", finalCwd: path, ...extras }; }
  function fileExists(path, command = "copy") { return { command, fileExists: path }; }
  function explore(match, feedback) { return { match: typeof match === "string" ? { command: match } : { raw: match }, feedback }; }

  const engine = window.ScenarioEngine;
  if (!engine || !Array.isArray(engine.scenarios)) return;
  const scenario = engine.scenarios.find((item) => item && item.id === TARGET_ID);
  if (!scenario || scenario.__goldPatched) return;
  scenario.__goldPatched = true;

  const commonExploration = [
    explore("dir", "Good. You looked at the current folder."),
    explore(/^cd\s+\.\.$/i, "You moved back one folder. Check the prompt, then continue toward the current task."),
    explore(/^cd\s+(logs|reports|temp)$/i, "That folder exists, but check whether it matches the current task. Use cd .. if you went the wrong way."),
    explore(/^type\s+.+/i, "Reading files is useful. If CMD cannot find the file, check the prompt and use dir."),
    explore(/^copy\s+.+/i, "copy is the right command family when the task asks you to place a file somewhere else. Check source and destination paths.")
  ];

  Object.assign(scenario, {
    title: "Incident Folder Triage",
    category: "Beginner Windows CMD",
    level: "Beginner",
    difficulty: "Beginner",
    shell: "cmd",
    environmentCategory: "windows",
    objective: "Find the incident note, read it, then copy it into the handover folder for the manager.",
    allowedFlexibility: "You may use dir, cd, cd .., mkdir, copy, relative paths, or absolute paths. Wrong folders are allowed; the lab guides you back.",
    commandFocus: ["dir", "cd", "type", "mkdir", "copy"],
    acceptedCommands: ["dir", "cd Incidents", "cd Notes", "type summary.txt", "mkdir Handover", "copy summary.txt"],
    beginnerLabLevelId: "level-1-terminal-orientation",
    beginnerTicket: {
      happened: "A manager needs the incident note found and placed into the reports handover folder.",
      meaning: "Look around, move through folders, read the note, then copy the evidence to the correct handover location.",
      tryFirst: "Start with dir. If you go into the wrong folder, use cd .. to go back."
    },
    visualGuide: {
      type: "folder-map",
      root: "C:/Lab",
      relevantPaths: ["C:/Lab/Incidents", "C:/Lab/Incidents/Notes", "C:/Lab/Incidents/Notes/summary.txt", "C:/Lab/Reports", "C:/Lab/Reports/Handover"],
      commandMap: [
        { command: "dir", icon: "👀", meaning: "Look inside" },
        { command: "cd", icon: "➡️", meaning: "Move folders" },
        { command: "cd ..", icon: "↩️", meaning: "Go back" },
        { command: "type", icon: "📄", meaning: "Read a file" },
        { command: "mkdir", icon: "📁", meaning: "Make a folder" },
        { command: "copy", icon: "📋", meaning: "Copy evidence" }
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
        { path: "C:/Lab/Incidents/Notes/summary.txt", content: "Summary: fileserver access failed after a DNS change. Manager requested this note be copied to Reports\\Handover.\n" },
        { path: "C:/Lab/Incidents/Notes/draft.txt", content: "Draft note: incomplete. Do not hand over.\n" },
        { path: "C:/Lab/Logs/app.log", content: "INFO started\nWARN old entry\n" },
        { path: "C:/Lab/Reports/readme.txt", content: "Reports folder. Put handover evidence in the Handover subfolder.\n" }
      ]
    }
  });

  scenario.steps = [
    { objective: "List the current lab workspace.", commandFamily: "dir", context: "You are starting at C:\\Lab. Look at the folders before moving.", hints: ["Start by looking around.", "In Windows CMD, use dir to list the current folder.", "Try `dir`."], demoCommand: "dir", accepts: [commandMatch("dir")], exploration: commonExploration },
    { objective: "Move into the Incidents folder.", commandFamily: "cd", context: "The ticket is about an incident note. From C:\\Lab, the first useful folder is Incidents.", hints: ["Use cd to change folder.", "The folder name is Incidents.", "Try `cd Incidents`."], demoCommand: "cd Incidents", accepts: [cwdMatch("C:/Lab/Incidents")], partials: [{ match: { finalCwd: "C:/Lab/Logs" }, feedback: "Logs is real, but this task needs Incidents. Use cd .., then cd Incidents." }, { match: { finalCwd: "C:/Lab/Reports" }, feedback: "Reports is for the handover later. First use cd .., then cd Incidents." }], exploration: commonExploration },
    { objective: "Look inside Incidents and choose the folder that sounds like written notes.", commandFamily: "dir", context: "Do not guess the final file yet. First inspect what is inside Incidents.", hints: ["Use dir again after changing folders.", "Look for a folder that would contain notes.", "Try `dir`."], demoCommand: "dir", accepts: [commandMatch("dir")], exploration: commonExploration },
    { objective: "Move into the Notes folder inside Incidents.", commandFamily: "cd", context: "The written incident files are inside Notes.", hints: ["Use cd again to enter Notes.", "If you backed out to C:\\Lab, use `cd Incidents\\Notes`.", "Try `cd Notes`."], demoCommand: "cd Notes", accepts: [cwdMatch("C:/Lab/Incidents/Notes")], partials: [{ match: { finalCwd: "C:/Lab" }, feedback: "You are back at C:\\Lab. Use cd Incidents\\Notes or cd Incidents then cd Notes." }, { match: { finalCwd: "C:/Lab/Logs" }, feedback: "You are in Logs. Use cd .., then cd Incidents\\Notes." }], exploration: commonExploration },
    { objective: "List the note files and decide which one looks ready to hand over.", commandFamily: "dir", context: "There may be more than one text file. List them before opening anything.", hints: ["Check what files are here.", "Use dir again.", "Try `dir`."], demoCommand: "dir", accepts: [commandMatch("dir")], exploration: commonExploration },
    { objective: "Read summary.txt and confirm it is the final note, not the draft.", commandFamily: "type", context: "The manager needs the finished summary, not an incomplete draft.", hints: ["Use type to read a text file in CMD.", "The final-looking file is summary.txt.", "Try `type summary.txt`."], demoCommand: "type summary.txt", accepts: [rawMatch(/^type\s+summary\.txt$/i)], partials: [{ match: { raw: /^type\s+draft\.txt$/i }, feedback: "draft.txt opens, but it says incomplete. Read summary.txt for the handover." }], exploration: commonExploration },
    { objective: "Manager update: move back to the Lab root so you can prepare the Reports handover folder.", commandFamily: "cd", context: "You found the note. Now prepare the destination area under C:\\Lab\\Reports.", hints: ["You are inside Incidents\\Notes.", "Go back two levels or use an absolute path later.", "Try `cd ..` twice, or use `cd C:\\Lab`."], demoCommand: "cd ..", accepts: [cwdMatch("C:/Lab"), rawMatch(/^cd\s+C:\\Lab$/i), rawMatch(/^cd\s+C:\/Lab$/i)], partials: [{ match: { finalCwd: "C:/Lab/Incidents" }, feedback: "You are halfway back. Use cd .. once more to return to C:\\Lab." }], exploration: commonExploration },
    { objective: "Move into the Reports folder.", commandFamily: "cd", context: "Reports is where the handover package belongs.", hints: ["Use cd to enter Reports.", "The folder is under C:\\Lab.", "Try `cd Reports`."], demoCommand: "cd Reports", accepts: [cwdMatch("C:/Lab/Reports")], exploration: commonExploration },
    { objective: "Create a Handover folder if it is not already there.", commandFamily: "mkdir", context: "The copied note needs its own handover folder.", hints: ["Use the CMD command that makes a directory.", "The folder name is Handover.", "Try `mkdir Handover`."], demoCommand: "mkdir Handover", accepts: [fileExists("C:/Lab/Reports/Handover", "mkdir"), rawMatch(/^mkdir\s+Handover$/i), rawMatch(/^md\s+Handover$/i)], exploration: commonExploration },
    { objective: "Copy summary.txt from the incident notes into Reports\\Handover.", commandFamily: "copy", context: "You can copy using the full source path and the destination folder.", hints: ["Use copy with source first, destination second.", "The source is in C:\\Lab\\Incidents\\Notes.", "Try `copy C:\\Lab\\Incidents\\Notes\\summary.txt C:\\Lab\\Reports\\Handover\\`."], demoCommand: "copy C:\\Lab\\Incidents\\Notes\\summary.txt C:\\Lab\\Reports\\Handover\\", accepts: [fileExists("C:/Lab/Reports/Handover/summary.txt", "copy"), rawMatch(/^copy\s+C:\\Lab\\Incidents\\Notes\\summary\.txt\s+C:\\Lab\\Reports\\Handover\\?$/i), rawMatch(/^copy\s+C:\/Lab\/Incidents\/Notes\/summary\.txt\s+C:\/Lab\/Reports\/Handover\/?$/i)], exploration: commonExploration },
    { objective: "Verify the copied note opens from the Handover folder.", commandFamily: "type", context: "A technician verifies the destination copy, not just the original file.", hints: ["Move into Handover or read the file with its full path.", "The copied file should still be summary.txt.", "Try `cd Handover`, then `type summary.txt`, or use the full path."], demoCommand: "type summary.txt", accepts: [rawMatch(/^type\s+summary\.txt$/i), rawMatch(/^type\s+C:\\Lab\\Reports\\Handover\\summary\.txt$/i), rawMatch(/^type\s+C:\/Lab\/Reports\/Handover\/summary\.txt$/i)], partials: [{ match: { finalCwd: "C:/Lab/Reports/Handover" }, feedback: "Good. You are in Handover now. Use type summary.txt to verify the copied file." }], exploration: commonExploration }
  ];

  const params = new URLSearchParams(window.location.search);
  const requested = params.get("scenario") || params.get("scenarioId") || params.get("lesson");
  if (requested === TARGET_ID || requested === "incident-folder-triage") {
    engine.scenarios = [scenario, ...engine.scenarios.filter((item) => item && item.id !== TARGET_ID)];
  }
})();
