(function(){
var e=window.ScenarioEngine;if(!e||!Array.isArray(e.scenarios))return;
var s=e.scenarios.find(function(x){return x&&x.id==='win-host-and-user-identity';});if(!s||s.__hostUserUpgrade)return;s.__hostUserUpgrade=true;
function c(x){return{command:x};}function r(x){return{raw:new RegExp(x,'i')};}function made(p){return{command:'echo',fileExists:p};}
var ex=[{match:{command:'hostname'},feedback:'Good. hostname identifies the machine.'},{match:{command:'whoami'},feedback:'Good. whoami identifies the user context.'},{match:{command:'dir'},feedback:'dir is valid, but this ticket is about identity evidence.'}];
s.title='Identify the Host and User Context';
s.objective='Identify the Windows host, confirm the logged-in user, check the report folder, then write an identity note.';
s.commandFocus=['hostname','whoami','dir','echo','type'];
s.environment=Object.assign({},s.environment||{},{platform:'cmd',cwd:'C:/Lab/Reports',directories:['C:/Lab','C:/Lab/Reports'],files:[{path:'C:/Lab/Reports/readme.txt',content:'Put host and user identity notes here.\n'}]});
s.steps=[
{objective:'Confirm the computer name.',commandFamily:'hostname',hints:['Start by identifying the machine.','Use hostname.','Try `hostname`.'],demoCommand:'hostname',accepts:[c('hostname')],exploration:ex},
{objective:'Confirm which user context you are working under.',commandFamily:'whoami',hints:['Now identify the user.','Use whoami.','Try `whoami`.'],demoCommand:'whoami',accepts:[c('whoami')],exploration:ex},
{objective:'List the Reports folder so you know where the note will be saved.',commandFamily:'dir',hints:['Check your destination folder.','Use dir.','Try `dir`.'],demoCommand:'dir',accepts:[c('dir')],exploration:ex},
{objective:'Create a short identity note for the ticket.',commandFamily:'echo',hints:['Document the evidence.','Save it as identity.txt.','Try `echo host and user confirmed > identity.txt`.'],demoCommand:'echo host and user confirmed > identity.txt',accepts:[made('C:/Lab/Reports/identity.txt'),r('^echo\\s+.+>\\s*identity\\.txt$')],exploration:ex},
{objective:'Verify the identity note opens.',commandFamily:'type',hints:['Verify the note.','Use type.','Try `type identity.txt`.'],demoCommand:'type identity.txt',accepts:[r('^type\\s+identity\\.txt$')],exploration:ex}
];
})();