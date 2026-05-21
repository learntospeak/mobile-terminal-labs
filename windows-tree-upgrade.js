(function(){
var e=window.ScenarioEngine;if(!e||!Array.isArray(e.scenarios))return;
var s=e.scenarios.find(function(x){return x&&x.id==='win-tree-toolbox-map';});if(!s||s.__treeUpgrade)return;s.__treeUpgrade=true;
function c(x){return{command:x};}function r(x){return{raw:new RegExp(x,'i')};}function made(p){return{command:'echo',fileExists:p};}
var ex=[{match:{command:'dir'},feedback:'Good first look.'},{match:{command:'tree'},feedback:'Good map. tree shows folder structure.'},{match:{raw:new RegExp('^cd\\s+\\.\\.$','i')},feedback:'You moved back one folder. Check the prompt.'},{match:{raw:new RegExp('^type\\s+.+','i')},feedback:'If the file is missing, use dir or tree to confirm the path.'}];
s.title='Map and Verify the Toolbox Tree';
s.objective='Map the toolkit folders, inspect the checklist, then create a short map note for the ticket.';
s.commandFocus=['dir','tree','cd','type','echo'];
s.environment=Object.assign({},s.environment||{},{platform:'cmd',cwd:'C:/Lab',directories:['C:/Lab','C:/Lab/Tools','C:/Lab/Tools/Network','C:/Lab/Tools/Docs','C:/Lab/Reports'],files:[{path:'C:/Lab/Tools/Docs/checklist.txt',content:'Toolkit checklist: Network tools are in Tools/Network. Save a map note to Reports.\n'},{path:'C:/Lab/Reports/readme.txt',content:'Put review notes here.\n'}]});
s.visualGuide={type:'folder-map',root:'C:/Lab',relevantPaths:['C:/Lab/Tools','C:/Lab/Tools/Docs','C:/Lab/Tools/Docs/checklist.txt','C:/Lab/Reports']};
s.steps=[
{objective:'List the lab workspace before mapping it.',commandFamily:'dir',hints:['Start simple.','Use dir.','Try `dir`.'],demoCommand:'dir',accepts:[c('dir')],exploration:ex},
{objective:'Use tree to map the toolbox folder structure.',commandFamily:'tree',hints:['Now map the folders.','Use tree on Tools.','Try `tree Tools`.'],demoCommand:'tree Tools',accepts:[r('^tree\\s+Tools$'),r('^tree$')],exploration:ex},
{objective:'Move into the toolbox docs folder.',commandFamily:'cd',hints:['The checklist is under Tools/Docs.','Use cd with the path.','Try `cd Tools/Docs`.'],demoCommand:'cd Tools/Docs',accepts:[{command:'cd',finalCwd:'C:/Lab/Tools/Docs'}],exploration:ex},
{objective:'Read checklist.txt and identify what the manager needs.',commandFamily:'type',hints:['Read the checklist.','Use type.','Try `type checklist.txt`.'],demoCommand:'type checklist.txt',accepts:[r('^type\\s+checklist\\.txt$')],exploration:ex},
{objective:'Create a short toolbox-map note in Reports.',commandFamily:'echo',hints:['Document the folder map.','Save it in Reports.','Try `echo toolbox mapped > C:/Lab/Reports/toolbox-map.txt`.'],demoCommand:'echo toolbox mapped > C:/Lab/Reports/toolbox-map.txt',accepts:[made('C:/Lab/Reports/toolbox-map.txt'),r('^echo\\s+.+>\\s*C:/Lab/Reports/toolbox-map\\.txt$')],exploration:ex},
{objective:'Verify the toolbox-map note opens from Reports.',commandFamily:'type',hints:['Verify the destination note.','Use type with the full path.','Try `type C:/Lab/Reports/toolbox-map.txt`.'],demoCommand:'type C:/Lab/Reports/toolbox-map.txt',accepts:[r('^type\\s+C:/Lab/Reports/toolbox-map\\.txt$')],exploration:ex}
];
})();