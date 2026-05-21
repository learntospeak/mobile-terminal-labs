(function(){
var e=window.ScenarioEngine;if(!e||!Array.isArray(e.scenarios))return;
var s=e.scenarios.find(function(x){return x&&x.id==='win-copy-case-note';});if(!s||s.__copyNoteUpgrade)return;s.__copyNoteUpgrade=true;
function c(x){return{command:x};}function r(x){return{raw:new RegExp(x,'i')};}function made(p){return{command:'copy',fileExists:p};}
var ex=[{match:{command:'dir'},feedback:'Good check. Confirm the file exists before copying.'},{match:{raw:new RegExp('^type\\s+.+','i')},feedback:'Reading the source first helps verify it is the right file.'},{match:{raw:new RegExp('^copy\\s+.+','i')},feedback:'copy uses source first and destination second.'},{match:{raw:new RegExp('^cd\\s+\\.\\.$','i')},feedback:'You moved back one folder. Check the prompt before continuing.'}];
s.title='Copy and Verify a Case Note';
s.objective='Find the case note, read it, copy it to Reports, then verify the copied file.';
s.commandFocus=['dir','type','copy'];
s.environment=Object.assign({},s.environment||{},{platform:'cmd',cwd:'C:/Lab/Notes',directories:['C:/Lab','C:/Lab/Notes','C:/Lab/Reports','C:/Lab/Archive'],files:[{path:'C:/Lab/Notes/case-note.txt',content:'Case note: attach this to the incident report.\n'},{path:'C:/Lab/Archive/case-note-old.txt',content:'Old case note.\n'},{path:'C:/Lab/Reports/readme.txt',content:'Incident report destination.\n'}]});
s.visualGuide={type:'folder-map',root:'C:/Lab',relevantPaths:['C:/Lab/Notes/case-note.txt','C:/Lab/Reports','C:/Lab/Reports/case-note.txt']};
s.steps=[
{objective:'List the Notes folder and find the current case note.',commandFamily:'dir',hints:['Start by listing files.','Use dir.','Try `dir`.'],demoCommand:'dir',accepts:[c('dir')],exploration:ex},
{objective:'Read case-note.txt before copying it.',commandFamily:'type',hints:['Verify the source file first.','Use type.','Try `type case-note.txt`.'],demoCommand:'type case-note.txt',accepts:[r('^type\\s+case-note\\.txt$')],exploration:ex},
{objective:'Copy case-note.txt into Reports.',commandFamily:'copy',hints:['Use source then destination.','Reports is C:/Lab/Reports/.','Try `copy case-note.txt C:/Lab/Reports/`.'],demoCommand:'copy case-note.txt C:/Lab/Reports/',accepts:[made('C:/Lab/Reports/case-note.txt'),r('^copy\\s+case-note\\.txt\\s+C:/Lab/Reports/?$')],exploration:ex},
{objective:'Verify the copied note opens from Reports.',commandFamily:'type',hints:['Verify the destination copy.','Use the full path.','Try `type C:/Lab/Reports/case-note.txt`.'],demoCommand:'type C:/Lab/Reports/case-note.txt',accepts:[r('^type\\s+C:/Lab/Reports/case-note\\.txt$')],exploration:ex},
{objective:'List Reports so the copied note is visible in the destination folder.',commandFamily:'dir',hints:['Finish by checking the destination folder.','Use dir with the Reports path.','Try `dir C:/Lab/Reports`.'],demoCommand:'dir C:/Lab/Reports',accepts:[r('^dir\\s+C:/Lab/Reports$'),r('^dir\\s+C:/Lab/Reports/?$')],exploration:ex}
];
})();