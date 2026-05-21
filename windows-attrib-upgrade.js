(function(){
var e=window.ScenarioEngine;if(!e||!Array.isArray(e.scenarios))return;
var s=e.scenarios.find(function(x){return x&&x.id==='win-attrib-hidden-plan';});if(!s||s.__attribUpgrade)return;s.__attribUpgrade=true;
function c(x){return{command:x};}function r(x){return{raw:new RegExp(x,'i')};}function made(p){return{command:'copy',fileExists:p};}
var ex=[{match:{command:'dir'},feedback:'Good check. Normal dir may not show hidden files.'},{match:{command:'attrib'},feedback:'Good. attrib reveals file attributes like hidden and read-only.'},{match:{raw:new RegExp('^dir\\s+/a','i')},feedback:'Good. dir /a shows hidden items too.'},{match:{raw:new RegExp('^type\\s+.+','i')},feedback:'If CMD cannot find the file, check whether it is hidden and use the exact file name.'}];
s.title='Hidden File Attribute Review';
s.objective='Find a hidden plan file, confirm its attributes, read it, copy it to Reports, and verify the copied evidence.';
s.commandFocus=['dir','attrib','type','copy'];
s.environment=Object.assign({},s.environment||{},{platform:'cmd',cwd:'C:/Lab',directories:['C:/Lab','C:/Lab/Reports','C:/Lab/Notes'],files:[{path:'C:/Lab/hidden-plan.txt',content:'Hidden plan: rotate service account password after review.\n',hidden:true},{path:'C:/Lab/Notes/readme.txt',content:'Check hidden files in C:/Lab.\n'},{path:'C:/Lab/Reports/readme.txt',content:'Copy reviewed evidence here.\n'}]});
s.visualGuide={type:'folder-map',root:'C:/Lab',relevantPaths:['C:/Lab/hidden-plan.txt','C:/Lab/Reports','C:/Lab/Reports/hidden-plan.txt']};
s.steps=[
{objective:'List the current folder normally.',commandFamily:'dir',hints:['Start with a normal listing.','This may not show hidden files.','Try `dir`.'],demoCommand:'dir',accepts:[c('dir')],exploration:ex},
{objective:'List all files including hidden ones.',commandFamily:'dir',hints:['Hidden files need an all-files listing.','Use the /a switch.','Try `dir /a`.'],demoCommand:'dir /a',accepts:[r('^dir\\s+/a$'),r('^dir\\s+/ah$')],exploration:ex},
{objective:'Check the attributes on hidden-plan.txt.',commandFamily:'attrib',hints:['Use attrib to inspect file attributes.','Target hidden-plan.txt.','Try `attrib hidden-plan.txt`.'],demoCommand:'attrib hidden-plan.txt',accepts:[r('^attrib\\s+hidden-plan\\.txt$')],exploration:ex},
{objective:'Read hidden-plan.txt to confirm it is the right file.',commandFamily:'type',hints:['Use type to read text.','Read hidden-plan.txt.','Try `type hidden-plan.txt`.'],demoCommand:'type hidden-plan.txt',accepts:[r('^type\\s+hidden-plan\\.txt$')],exploration:ex},
{objective:'Copy hidden-plan.txt into Reports for review.',commandFamily:'copy',hints:['Use copy with source then destination.','Destination is C:/Lab/Reports/.','Try `copy hidden-plan.txt C:/Lab/Reports/`.'],demoCommand:'copy hidden-plan.txt C:/Lab/Reports/',accepts:[made('C:/Lab/Reports/hidden-plan.txt'),r('^copy\\s+hidden-plan\\.txt\\s+C:/Lab/Reports/?$')],exploration:ex},
{objective:'Verify the copied file opens from Reports.',commandFamily:'type',hints:['Verify the destination copy.','Use the full path.','Try `type C:/Lab/Reports/hidden-plan.txt`.'],demoCommand:'type C:/Lab/Reports/hidden-plan.txt',accepts:[r('^type\\s+C:/Lab/Reports/hidden-plan\\.txt$')],exploration:ex}
];
})();