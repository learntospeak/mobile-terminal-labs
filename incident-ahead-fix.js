(function(){
var e=window.ScenarioEngine;if(!e||!Array.isArray(e.scenarios))return;
var s=e.scenarios.find(function(x){return x&&x.id==='win-dir-incident-triage'});if(!s||s.__incidentAheadFix)return;s.__incidentAheadFix=true;
function addAccept(step,rule){step.accepts=Array.isArray(step.accepts)?step.accepts:[];step.accepts.push(rule)}
function addPartial(step,rule){step.partials=Array.isArray(step.partials)?step.partials:[];step.partials.push(rule)}
function addExplore(step,rule){step.exploration=Array.isArray(step.exploration)?step.exploration:[];step.exploration.push(rule)}
var steps=Array.isArray(s.steps)?s.steps:[];
var moveNotes=steps.find(function(st){return String(st.objective||'').toLowerCase().indexOf('notes folder')>=0&&String(st.commandFamily||'').toLowerCase()==='cd'});
if(moveNotes){
  addAccept(moveNotes,{command:'dir',finalCwd:'C:/Lab/Incidents/Notes'});
  addAccept(moveNotes,{command:'type',finalCwd:'C:/Lab/Incidents/Notes'});
  addAccept(moveNotes,{raw:/^cd\s+\.\s*$/i,finalCwd:'C:/Lab/Incidents/Notes'});
  addExplore(moveNotes,{match:{command:'dir'},feedback:'You are already in the Notes folder. Good catch — list the files, then read summary.txt.'});
  addExplore(moveNotes,{match:{raw:/^type\s+summary\.txt$/i},feedback:'You are already doing the next useful thing: reading summary.txt.'});
  addPartial(moveNotes,{match:{finalCwd:'C:/Lab/Incidents/Notes'},feedback:'You are already in C:\\Lab\\Incidents\\Notes. Continue by listing files or reading summary.txt; you do not need to cd Notes again.'});
}
var listNotes=steps.find(function(st){return String(st.objective||'').toLowerCase().indexOf('list the note files')>=0});
if(listNotes){
  addAccept(listNotes,{raw:/^type\s+summary\.txt$/i,finalCwd:'C:/Lab/Incidents/Notes'});
  addExplore(listNotes,{match:{raw:/^type\s+summary\.txt$/i},feedback:'You skipped ahead correctly and opened summary.txt. Continue with the handover preparation.'});
}
var readSummary=steps.find(function(st){return String(st.objective||'').toLowerCase().indexOf('read summary.txt')>=0});
if(readSummary){
  addAccept(readSummary,{raw:/^dir\s*$/i,finalCwd:'C:/Lab/Incidents/Notes'});
  addExplore(readSummary,{match:{command:'dir'},feedback:'You are in the correct folder and can see the notes. Now read summary.txt.'});
}
})();