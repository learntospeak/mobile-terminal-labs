(function(){
var e=window.ScenarioEngine;if(!e||!Array.isArray(e.scenarios))return;
var s=e.scenarios.find(function(x){return x&&x.id==='win-xcopy-toolkit-bundle';});if(!s||s.__xcopyUpgrade)return;s.__xcopyUpgrade=true;
function c(x){return{command:x};}function made(p){return{command:'xcopy',fileExists:p};}function cd(p){return{command:'cd',finalCwd:p};}
var ex=[{match:{command:'dir'},feedback:'Good check. Confirm the folder before copying.'},{match:{command:'xcopy'},feedback:'xcopy copies a folder bundle.'},{match:{command:'type'},feedback:'If the file is missing, verify you are checking the copied folder.'}];
s.title='Replicate and Verify the Toolkit Bundle';
s.objective='Inspect the toolkit bundle, copy it to Archive, then verify the copied checklist.';
s.commandFocus=['dir','xcopy','cd','type'];
s.environment=Object.assign({},s.environment||{},{platform:'cmd',cwd:'C:/Lab',directories:['C:/Lab','C:/Lab/Toolkit','C:/Lab/Toolkit/Docs','C:/Lab/Archive'],files:[{path:'C:/Lab/Toolkit/Docs/checklist.txt',content:'Toolkit checklist copied for archive review.\n'},{path:'C:/Lab/Archive/readme.txt',content:'Archive destination.\n'}]});
s.steps=[
{objective:'List the lab root and identify the Toolkit folder.',commandFamily:'dir',hints:['Start by listing folders.','Use dir.','Try `dir`.'],demoCommand:'dir',accepts:[c('dir')],exploration:ex},
{objective:'List the Toolkit folder before copying it.',commandFamily:'dir',hints:['Check the source folder.','Use dir with a path.','Try `dir Toolkit`.'],demoCommand:'dir Toolkit',accepts:[c('dir')],exploration:ex},
{objective:'Copy the Toolkit folder tree into Archive.',commandFamily:'xcopy',hints:['Use xcopy for a folder bundle.','Copy Toolkit into Archive.','Try the xcopy command shown in Command Help.'],demoCommand:'xcopy Toolkit Archive/Toolkit',accepts:[made('C:/Lab/Archive/Toolkit/Docs/checklist.txt')],exploration:ex},
{objective:'Move into the copied Docs folder.',commandFamily:'cd',hints:['Verify the copied folder, not the original.','Use cd.','Try `cd Archive/Toolkit/Docs`.'],demoCommand:'cd Archive/Toolkit/Docs',accepts:[cd('C:/Lab/Archive/Toolkit/Docs')],exploration:ex},
{objective:'Read the copied checklist.',commandFamily:'type',hints:['Open the copied file.','Use type.','Try `type checklist.txt`.'],demoCommand:'type checklist.txt',accepts:[c('type')],exploration:ex}
];
})();