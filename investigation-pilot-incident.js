(function(){
  var engine = window.ScenarioEngine;
  if (!engine || !Array.isArray(engine.scenarios)) return;

  var scenario = engine.scenarios.find(function(item){ return item && item.id === 'win-dir-incident-triage'; });
  if (!scenario || scenario.__investigationPilotIncident) return;
  scenario.__investigationPilotIncident = true;

  scenario.investigationMode = true;
  scenario.interactionMode = 'investigation-first';
  scenario.caseId = 'case-file-incident-folder-01';
  scenario.caseTitle = 'Case File 01: The Missing Incident Notes';
  scenario.caseStep = 1;
  scenario.caseArc = {
    title: 'The Missing Incident Notes',
    summary: 'A junior technician needs to locate the right incident notes without getting distracted by unrelated folders.',
    startScene: 'Patch receives a handover ticket with too little detail. The learner must decide where to look first.',
    endScene: 'The learner finds the relevant notes and proves the next handover step with evidence.'
  };

  scenario.mobileInvestigation = true;
  scenario.desktopInvestigation = true;
  scenario.interactionSurfaces = {
    mobile: 'Tap intention, then tap command category, then choose the specific command.',
    desktop: 'Choose investigation intention first, then type or select the matching command.'
  };

  scenario.investigation = {
    enabled: true,
    pilot: true,
    caseId: 'case-file-incident-folder-01',
    caseTitle: 'Case File 01: The Missing Incident Notes',
    caseStep: 1,
    introPrompt: 'Before running commands, decide what kind of investigation this ticket needs.',
    intentions: [
      {
        id: 'find-incident-notes',
        label: 'Find the incident notes',
        best: true,
        explanation: 'The ticket is about missing handover information, so the best first move is to find the relevant incident folder.',
        commandCategories: ['navigation', 'evidence'],
        nextCommands: ['cd Incidents', 'dir', 'cd Notes', 'type summary.txt']
      },
      {
        id: 'check-network',
        label: 'Check network connectivity',
        best: false,
        explanation: 'This is a realistic support instinct, but the ticket is about local incident notes, not a reachable host.',
        commandCategories: ['connectivity'],
        nextCommands: ['ping fileserver', 'ipconfig']
      },
      {
        id: 'check-processes',
        label: 'Check running processes',
        best: false,
        explanation: 'Process checks are useful in other tickets, but there is no sign of a rogue app in this incident.',
        commandCategories: ['process'],
        nextCommands: ['tasklist']
      },
      {
        id: 'clean-temp-files',
        label: 'Clean temporary files',
        best: false,
        explanation: 'Cleaning files before reading evidence can destroy context. Investigate first, clean later.',
        commandCategories: ['cleanup'],
        nextCommands: ['dir Temp', 'del old.tmp']
      }
    ],
    commandCategories: [
      {
        id: 'navigation',
        label: 'Navigation',
        purpose: 'Move through folders to reach likely evidence locations.',
        commands: [
          { command: 'cd Incidents', best: true, reason: 'Moves toward the incident notes.' },
          { command: 'cd Logs', best: false, reason: 'Logs may matter later, but the ticket points to incident notes first.' },
          { command: 'cd Temp', best: false, reason: 'Temporary files are not the first evidence source.' }
        ]
      },
      {
        id: 'evidence',
        label: 'Evidence reading',
        purpose: 'List and open files that prove what happened.',
        commands: [
          { command: 'dir', best: true, reason: 'Lists available folders and files before opening anything.' },
          { command: 'type summary.txt', best: true, reason: 'Reads the relevant handover evidence.' },
          { command: 'type printer-note.txt', best: false, reason: 'A plausible but unrelated note.' }
        ]
      },
      {
        id: 'connectivity',
        label: 'Connectivity test',
        purpose: 'Check whether a host can be reached.',
        commands: [
          { command: 'ping fileserver', best: false, reason: 'Useful in network tickets, but not required for this local note triage.' },
          { command: 'nslookup fileserver', best: false, reason: 'DNS is not the current symptom.' }
        ]
      },
      {
        id: 'process',
        label: 'Process check',
        purpose: 'Review running tasks when the symptom involves a suspicious app.',
        commands: [
          { command: 'tasklist', best: false, reason: 'Valid command, wrong investigation path for this ticket.' }
        ]
      }
    ],
    plausibleWrongOptions: [
      { label: 'Check the network first', command: 'ping fileserver', feedback: 'Valid command, weak fit. This ticket is about local handover notes.' },
      { label: 'Check processes first', command: 'tasklist', feedback: 'Valid command, weak fit. There is no process symptom yet.' },
      { label: 'Open the printer note', command: 'type printer-note.txt', feedback: 'This is a red herring. It is a real note, but not the incident handover.' }
    ],
    evidenceQuestions: [
      {
        id: 'which-file-matters',
        prompt: 'Which file contained the useful handover evidence?',
        answer: 'summary.txt',
        choices: ['summary.txt', 'printer-note.txt', 'old-game-note.txt', 'app.log'],
        explanation: 'summary.txt is the file that matches the incident handover task.'
      },
      {
        id: 'what-did-dir-prove',
        prompt: 'What did listing the folder prove?',
        answer: 'The Notes folder exists and should be inspected.',
        choices: [
          'The Notes folder exists and should be inspected.',
          'The file server is offline.',
          'A process must be killed.',
          'DNS is broken.'
        ],
        explanation: 'dir helps you see what evidence locations are available before opening files.'
      }
    ],
    patchFeedback: {
      correctIntention: 'Good investigation instinct. The ticket is about incident notes, so you are following the evidence path first.',
      wrongButPlausible: 'That is a valid technician move in a different ticket, but this symptom points to local handover evidence first.',
      recovery: 'No damage done. Re-read the ticket, then choose the action that helps find the missing notes.',
      evidenceRead: 'Nice. You did not just run commands; you proved which file mattered.'
    },
    redHerrings: [
      {
        id: 'printer-note-red-herring',
        file: 'printer-note.txt',
        message: 'This note is real, but it belongs to a different ticket. Good investigators separate related evidence from noise.'
      }
    ],
    easterEggs: [
      {
        id: 'old-game-note-secret',
        file: 'old-game-note.txt',
        trigger: 'read-file',
        reward: 'future-command-snake-mini-game',
        message: 'You found an old Patch dev note. Later this can unlock a hidden command mini-game.'
      }
    ],
    completionReview: {
      title: 'Incident Notes Located',
      intentionSummary: 'You chose to find the incident notes before chasing unrelated symptoms.',
      evidenceSummary: 'You used folder navigation and file reading to locate the relevant handover summary.',
      realWorldMeaning: 'In real support work, good technicians follow the ticket evidence instead of randomly checking every system area.'
    }
  };

  scenario.distractors = scenario.investigation.plausibleWrongOptions;
  scenario.evidenceQuestions = scenario.investigation.evidenceQuestions;
  scenario.patchFeedback = scenario.investigation.patchFeedback;
  scenario.redHerrings = scenario.investigation.redHerrings;
  scenario.easterEggs = scenario.investigation.easterEggs;
  scenario.investigationReview = scenario.investigation.completionReview;
})();