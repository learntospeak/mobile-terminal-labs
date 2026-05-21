(function(){
var e=window.ScenarioEngine;if(!e||!Array.isArray(e.scenarios))return;
var s=e.scenarios.find(function(x){return x&&x.id==='win-type-more-audit-log';});if(!s||s.__typeMoreUpgrade)return;s.__typeMoreUpgrade=true;
function c(x){return{command:x};}function r(x){return{raw:new RegExp(x,'i')};}function made(p){return{command:'echo',fileExists:p};}
var ex=[{match:{command:'dir'},feedback:'Good check. Confirm file names before reading.'},{match:{command:'type'},feedback:'type prints a text file.'},{match:{command:'more'},feedback:'more is useful for longer files.'},{match:{raw:new RegExp('^findstr\\b','i')},feedback:'findstr helps isolate a line after you inspect the file.'}];
s.title='Read and Summarise a Long Audit Note';
s.objective='Find a long audit note, read it safely, isolate the warning, and create a short summary for Reports.';
s.commandFocus=['dir','type','more','findstr','echo'];
s.environment=Object.assign({},s.environment||{},{platform:'cmd',cwd:'C:/Lab/Audit',directories:['C:/Lab','C:/Lab/Audit','C:/Lab/Reports'],files:[{path:'C:/Lab/Audit/audit-log.txt',content:'INFO startup ok\nINFO user login\nWARN backup job failed\nINFO cleanup ok\n'},{path:'C:/Lab/Reports/readme.txt',content:'Put audit summaries here.\n'}]});
s.visualGuide={type:'folder-map',root:'C:/Lab',relevantPaths:['C:/Lab/Audit/audit-log.txt','C:/Lab/Reports/audit-summary.txt']};
s.steps=[
{objective:'List the Audit folder and find the log file.',commandFamily:'dir',hints:['Start by listing files.','Use dir.','Try `dir`.'],demoCommand:'dir',accepts:[c('dir')],exploration:ex},
{objective:'Read audit-log.txt once with type.',commandFamily:'type',hints:['Open the file directly.','Use type.','Try `type audit-log.txt`.'],demoCommand:'type audit-log.txt',accepts:[r('^type\\s+audit-log\\.txt$')],exploration:ex},
{objective:'Review the same file using more, as you would for a longer note.',commandFamily:'more',hints:['Use paging for long files.','Try more.','Try `more audit-log.txt`.'],demoCommand:'more audit-log.txt',accepts:[r('^more\\s+audit-log\\.txt$')],exploration:ex},
{objective:'Filter the warning line from the audit log.',commandFamily:'findstr',hints:['Search for WARN.','Use findstr.','Try `findstr WARN audit-log.txt`.'],demoCommand:'findstr WARN audit-log.txt',accepts:[r('^findstr\\s+WARN\\s+audit-log\\.txt$')],exploration:ex},
{objective:'Create an audit summary note in Reports.',commandFamily:'echo',hints:['Document the finding.','Save it in Reports.','Try `echo backup job failed > C:/Lab/Reports/audit-summary.txt`.'],demoCommand:'echo backup job failed > C:/Lab/Reports/audit-summary.txt',accepts:[made('C:/Lab/Reports/audit-summary.txt'),r('^echo\\s+.+>\\s*C:/Lab/Reports/audit-summary\\.txt$')],exploration:ex},
{objective:'Verify the audit summary opens from Reports.',commandFamily:'type',hints:['Verify the destination file.','Use type with the full path.','Try `type C:/Lab/Reports/audit-summary.txt`.'],demoCommand:'type C:/Lab/Reports/audit-summary.txt',accepts:[r('^type\\s+C:/Lab/Reports/audit-summary\\.txt$')],exploration:ex}
];
})();