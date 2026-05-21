(function(){
var e=window.ScenarioEngine;if(!e||!Array.isArray(e.scenarios))return;
var s=e.scenarios.find(function(x){return x&&x.id==='win-taskkill-updater';});if(!s||s.__taskkillUpgrade)return;s.__taskkillUpgrade=true;
function c(x){return{command:x};}function r(x){return{raw:new RegExp(x,'i')};}function made(p){return{command:'echo',fileExists:p};}
var ex=[{match:{command:'tasklist'},feedback:'Good. Identify before stopping anything.'},{match:{raw:new RegExp('^tasklist\\s*\\|\\s*findstr','i')},feedback:'Good filter. Narrow the process list before acting.'},{match:{command:'taskkill'},feedback:'taskkill changes process state. Make sure you target the right PID or image name.'},{match:{command:'dir'},feedback:'dir works, but this ticket is about processes.'}];
s.title='Runaway Worker Investigation';s.objective='List processes, identify the updater, stop it, verify it is gone, then record the result.';s.commandFocus=['tasklist','findstr','taskkill','echo'];
s.environment=Object.assign({},s.environment||{},{platform:'cmd',cwd:'C:/Lab',processes:[{pid:4088,name:'OneDriveUpdater.exe'},{pid:1504,name:'spoolsv.exe'},{pid:960,name:'svchost.exe'}]});
s.steps=[
{objective:'List running processes before killing anything.',commandFamily:'tasklist',hints:['Identify before acting.','Use tasklist.','Try `tasklist`.'],demoCommand:'tasklist',accepts:[c('tasklist')],exploration:ex},
{objective:'Filter the list for the updater process.',commandFamily:'findstr',hints:['Narrow the output.','Search for Updater.','Try `tasklist | findstr Updater`.'],demoCommand:'tasklist | findstr Updater',accepts:[r('^tasklist\\s*\\|\\s*findstr\\s+Updater$'),r('^tasklist\\s*\\|\\s*findstr\\s+OneDriveUpdater$')],exploration:ex},
{objective:'Stop OneDriveUpdater.exe by PID or image name.',commandFamily:'taskkill',hints:['Use taskkill.','The PID shown is 4088.','Try `taskkill /PID 4088`.'],demoCommand:'taskkill /PID 4088',accepts:[r('^taskkill\\s+/PID\\s+4088$'),r('^taskkill\\s+/IM\\s+OneDriveUpdater\\.exe$')],exploration:ex},
{objective:'Verify the updater no longer appears in tasklist.',commandFamily:'tasklist',hints:['Verify after stopping it.','Filter again for Updater.','Try `tasklist | findstr Updater`.'],demoCommand:'tasklist | findstr Updater',accepts:[r('^tasklist\\s*\\|\\s*findstr\\s+Updater$'),c('tasklist')],exploration:ex},
{objective:'Record the cleanup result in a note.',commandFamily:'echo',hints:['Document the result.','Create cleanup.txt.','Try `echo updater stopped > cleanup.txt`.'],demoCommand:'echo updater stopped > cleanup.txt',accepts:[made('C:/Lab/cleanup.txt'),r('^echo\\s+.+>\\s*cleanup\\.txt$')],exploration:ex}
];
})();