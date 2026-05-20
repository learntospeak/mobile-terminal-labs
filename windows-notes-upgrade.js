(function(){
  var e=window.ScenarioEngine;
  if(!e||!Array.isArray(e.scenarios))return;
  var s=e.scenarios.find(function(x){return x&&x.id==='win-cd-notes-folder';});
  if(!s||s.__notesUpgrade)return;
  s.__notesUpgrade=true;
  function c(x){return{command:x};}
  function cd(p){return{command:'cd',finalCwd:p};}
  function rx(t){return{raw:new RegExp(t,'i')};}
  function made(p){return{command:'copy',fileExists:p};}
  var explore=[
    {match:{command:'dir'},feedback:'Good check. You looked at the current folder.'},
    {match:{raw:new RegExp('^cd\\s+\\.\\.$','i')},feedback:'You moved back one folder. Check the prompt, then continue.'},
    {match:{raw:new RegExp('^type\\s+.+','i')},feedback:'If CMD cannot find the file, check the prompt and use dir.'}
  ];
  s.title='Find and Verify the Notes Folder';
  s.objective='Find the Notes folder, read the current note, copy it to Reports, then verify the copied file.';
  s.commandFocus=['dir','cd','type','copy'];
  s.environment=Object.assign({},s.environment||{},{platform:'cmd',cwd:'C:/Lab',directories:['C:/Lab','C:/Lab/Notes','C:/Lab/Archive','C:/Lab/Reports','C:/Lab/Logs'],files:[{path:'C:/Lab/Notes/ticket-note.txt',content:'Ticket note: copy this note into Reports for review.\n'},{path:'C:/Lab/Archive/old-note.txt',content:'Old note.\n'},{path:'C:/Lab/Reports/readme.txt',content:'Reports folder.\n'}]});
  s.steps=[
    {objective:'List the lab workspace and find the notes folder.',commandFamily:'dir',hints:['Look around first.','Use dir.','Try `dir`.'],demoCommand:'dir',accepts:[c('dir')],exploration:explore},
    {objective:'Move into the Notes folder.',commandFamily:'cd',hints:['Use cd.','The folder is Notes.','Try `cd Notes`.'],demoCommand:'cd Notes',accepts:[cd('C:/Lab/Notes')],exploration:explore},
    {objective:'List the Notes folder and identify the current ticket note.',commandFamily:'dir',hints:['List before reading.','Look for ticket-note.txt.','Try `dir`.'],demoCommand:'dir',accepts:[c('dir')],exploration:explore},
    {objective:'Read ticket-note.txt.',commandFamily:'type',hints:['Use type.','Read ticket-note.txt.','Try `type ticket-note.txt`.'],demoCommand:'type ticket-note.txt',accepts:[rx('^type\\s+ticket-note\\.txt$')],exploration:explore},
    {objective:'Copy ticket-note.txt into Reports.',commandFamily:'copy',hints:['Use copy.','Destination is C:/Lab/Reports/.','Try `copy ticket-note.txt C:/Lab/Reports/`.'],demoCommand:'copy ticket-note.txt C:/Lab/Reports/',accepts:[made('C:/Lab/Reports/ticket-note.txt'),rx('^copy\\s+ticket-note\\.txt\\s+C:/Lab/Reports/?$')],exploration:explore},
    {objective:'Verify the copied note opens from Reports.',commandFamily:'type',hints:['Verify the destination copy.','Use the full path.','Try `type C:/Lab/Reports/ticket-note.txt`.'],demoCommand:'type C:/Lab/Reports/ticket-note.txt',accepts:[rx('^type\\s+C:/Lab/Reports/ticket-note\\.txt$')],exploration:explore}
  ];
})();