(function(){
var e=window.ScenarioEngine;if(!e||!Array.isArray(e.scenarios))return;
var s=e.scenarios.find(function(x){return x&&x.id==='win-delete-old-dump';});if(!s||s.__deleteDumpUpgrade)return;s.__deleteDumpUpgrade=true;
function c(x){return{command:x};}function r(x){return{raw:new RegExp(x,'i')};}function gone(p){return{command:'del',fileMissing:p};}function made(p){return{command:'echo',fileExists:p};}
var ex=[{match:{command:'dir'},feedback:'Good check. Confirm the file exists before deleting anything.'},{match:{raw:new RegExp('^type\\s+.+','i')},feedback:'Reading a note can confirm what to remove.'},{match:{command:'del'},feedback:'del is destructive. Make sure the target is the old dump.'}];
s.title='Purge and Verify an Old Dump File';
s.objective='Find the old dump file, confirm it is safe to remove, delete it, then verify and document the cleanup.';s.commandFocus=['dir','type','del','echo'];
s.environment=Object.assign({},s.environment||{},{platform:'cmd',cwd:'C:/Lab/Temp',directories:['C:/Lab','C:/Lab/Temp','C:/Lab/Reports'],files:[{path:'C:/Lab/Temp/old-memory.dmp',content:'OLD DUMP - safe to remove.\n'},{path:'C:/Lab/Temp/current-note.txt',content:'Remove only old-memory.dmp. Do not delete current-note.txt.\n'},{path:'C:/Lab/Reports/readme.txt',content:'Put cleanup notes here.\n'}]});
s.steps=[
{objective:'List the Temp folder before deleting anything.',commandFamily:'dir',hints:['Start by listing files.','Use dir.','Try `dir`.'],demoCommand:'dir',accepts:[c('dir')],exploration:ex},
{objective:'Read current-note.txt to confirm which file is safe to remove.',commandFamily:'type',hints:['Check the instruction note.','Use type.','Try `type current-note.txt`.'],demoCommand:'type current-note.txt',accepts:[r('^type\\s+current-note\\.txt$')],exploration:ex},
{objective:'Delete only old-memory.dmp.',commandFamily:'del',hints:['Use del carefully.','The target is old-memory.dmp.','Try `del old-memory.dmp`.'],demoCommand:'del old-memory.dmp',accepts:[gone('C:/Lab/Temp/old-memory.dmp'),r('^del\\s+old-memory\\.dmp$')],partials:[{match:{raw:new RegExp('^del\\s+current-note\\.txt$','i')},feedback:'Do not delete current-note.txt. The cleanup target is old-memory.dmp.'}],exploration:ex},
{objective:'List the folder again to verify the dump is gone.',commandFamily:'dir',hints:['Verify after deleting.','Use dir again.','Try `dir`.'],demoCommand:'dir',accepts:[c('dir')],exploration:ex},
{objective:'Create a cleanup note in Reports.',commandFamily:'echo',hints:['Document the cleanup.','Save it to Reports.','Try `echo old dump removed > C:/Lab/Reports/cleanup.txt`.'],demoCommand:'echo old dump removed > C:/Lab/Reports/cleanup.txt',accepts:[made('C:/Lab/Reports/cleanup.txt'),r('^echo\\s+.+>\\s*C:/Lab/Reports/cleanup\\.txt$')],exploration:ex},
{objective:'Verify the cleanup note opens from Reports.',commandFamily:'type',hints:['Verify the report note.','Use the full path.','Try `type C:/Lab/Reports/cleanup.txt`.'],demoCommand:'type C:/Lab/Reports/cleanup.txt',accepts:[r('^type\\s+C:/Lab/Reports/cleanup\\.txt$')],exploration:ex}
];
})();