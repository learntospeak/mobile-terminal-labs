(function(){
var e=window.ScenarioEngine;if(!e||!Array.isArray(e.scenarios))return;
function addExplore(step,rule){step.exploration=Array.isArray(step.exploration)?step.exploration:[];step.exploration.push(rule)}
function addPartial(step,rule){step.partials=Array.isArray(step.partials)?step.partials:[];step.partials.push(rule)}
function find(id){return e.scenarios.find(function(s){return s&&s.id===id})}
function patchFileFlow(id){var s=find(id);if(!s||s.__flowPolish1)return;s.__flowPolish1=true;(s.steps||[]).forEach(function(st){var fam=String(st.commandFamily||'').toLowerCase();var obj=String(st.objective||'').toLowerCase();if(fam==='cd'||obj.indexOf('move into')>=0||obj.indexOf('folder')>=0){addExplore(st,{match:{command:'dir'},feedback:'Good check. If you are already in the correct folder, use the next file-reading or verification command.'});addExplore(st,{match:{raw:/^cd\s*$/i},feedback:'CMD/Linux is showing your current folder. If the prompt already matches the destination, continue with the next useful task.'});addExplore(st,{match:{raw:/^pwd$/i},feedback:'Good location check. If you are already in the right directory, continue with the next useful task.'});}
if(fam==='type'||fam==='cat'||obj.indexOf('read')>=0||obj.indexOf('verify')>=0){addExplore(st,{match:{command:'dir'},feedback:'Good check. Now open the target file from this location or use the full path.'});addExplore(st,{match:{command:'ls'},feedback:'Good check. Now open the target file from this location or use the full path.'});}
if(['copy','cp','move','mv','ren','mkdir','touch','tar','unzip','echo'].indexOf(fam)>=0){addExplore(st,{match:{command:'dir'},feedback:'Good check before changing files. Confirm source and destination, then run the action.'});addExplore(st,{match:{command:'ls'},feedback:'Good check before changing files. Confirm source and destination, then run the action.'});}
});}
[
'win-dir-incident-triage','win-cd-notes-folder','win-tree-toolbox-map','win-copy-case-note','win-delete-old-dump','win-type-more-audit-log','win-attrib-hidden-plan','win-xcopy-toolkit-bundle','win-mkdir-rmdir-temp-workspace','win-move-and-rename-review-note',
'archive-release-review','asset-bundle-extract','config-bundle-extract','evidence-bundle-extract','rename-an-incident-note','python-scan-workspace-prep','python-setup-and-run','create-a-backup-workspace','copy-a-config-template','move-a-suspicious-log'
].forEach(patchFileFlow);
})();