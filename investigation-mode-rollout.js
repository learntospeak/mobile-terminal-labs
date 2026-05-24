(function(){
  window.InvestigationModeRollout = {
    version: '2026-05-24-stage8',
    pilotId: 'win-dir-incident-triage',
    strategy: 'Convert one Windows investigation family at a time. Pilot first, then nearby file-navigation labs, then networking/process labs.',
    windowsLabs: [
      {
        id: 'win-dir-incident-triage',
        title: 'Incident Folder Triage',
        family: 'file-navigation',
        status: 'done',
        stageTarget: 'pilot-complete',
        notes: 'Pilot lab for intention-first investigation mode.'
      },
      {
        id: 'win-cd-notes-folder',
        title: 'Notes Folder Review',
        family: 'file-navigation',
        status: 'pending',
        stageTarget: 'copy-pilot-pattern',
        notes: 'Good next candidate because it uses the same navigation and evidence-reading pattern.'
      },
      {
        id: 'win-attrib-hidden-plan',
        title: 'Hidden Attributes Plan Review',
        family: 'file-navigation',
        status: 'pending',
        stageTarget: 'add-hidden-evidence-choices',
        notes: 'Good for red-herring and hidden-file reasoning.'
      },
      {
        id: 'win-copy-case-note',
        title: 'Copy a Case Note Forward',
        family: 'file-navigation',
        status: 'pending',
        stageTarget: 'add-action-intention-layer',
        notes: 'Good for evidence preservation and safe action intent.'
      },
      {
        id: 'win-type-more-audit-log',
        title: 'Read a Long Audit Note Safely',
        family: 'file-navigation',
        status: 'pending',
        stageTarget: 'add-output-interpretation',
        notes: 'Good for output comprehension questions.'
      },
      {
        id: 'win-ping-fileserver',
        title: 'Reachability Check on the File Server',
        family: 'networking',
        status: 'pending',
        stageTarget: 'add-connectivity-intentions',
        notes: 'First networking candidate after the file-navigation pattern is stable.'
      },
      {
        id: 'win-nslookup-fileserver',
        title: 'Nslookup Family: Resolve Names',
        family: 'networking',
        status: 'pending',
        stageTarget: 'add-dns-vs-connectivity-choice',
        notes: 'Good for choosing between ping, nslookup, and ipconfig.'
      },
      {
        id: 'win-taskkill-updater',
        title: 'Stop the Rogue Updater',
        family: 'processes',
        status: 'pending',
        stageTarget: 'add-process-investigation-intentions',
        notes: 'Good process-check candidate once the system supports non-file cases.'
      }
    ]
  };
  window.NetlabInvestigationRollout = window.InvestigationModeRollout;
})();