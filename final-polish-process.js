(function(){
var e=window.ScenarioEngine;if(!e||!Array.isArray(e.scenarios))return;
function find(id){return e.scenarios.find(function(s){return s&&s.id===id})}
function add(step,cmd,msg){step.exploration=Array.isArray(step.exploration)?step.exploration:[];step.exploration.push({match:{command:cmd},feedback:msg})}
function patch(id){var s=find(id);if(!s||s.__processPolish)return;s.__processPolish=true;(s.steps||[]).forEach(function(st){var fam=String(st.commandFamily||'').toLowerCase();var obj=String(st.objective||'').toLowerCase();
if(['tasklist','taskkill','sc','driverquery','wmic'].indexOf(fam)>=0){
add(st,'tasklist','Good process check. If the target process is already identified, continue with the action or verification step.');
add(st,'taskkill','Good process action. If the target process has already been stopped, continue with verification.');
add(st,'sc','Good service check. If the service state is already known, continue with verification or notes.');
add(st,'driverquery','Good driver inventory. If the needed driver evidence is visible, continue with the review note.');
add(st,'wmic','Good inventory check. If the process detail is already visible, continue with filtering or documentation.');
add(st,'findstr','Good filter. If the important line is already found, continue with the next step.');
}
if(obj.indexOf('verify')>=0||obj.indexOf('document')>=0||obj.indexOf('note')>=0){
add(st,'dir','Good destination check. If the note already exists, open it to verify.');
add(st,'type','Good verification. If this opens the expected note, the task is effectively complete.');
}
});}
['win-taskkill-updater','win-tasklist-and-wmic-inventory','win-sc-query-spooler','win-net-stop-start-spooler','win-driverquery-review','cmd-updater-stop','windows-log-review','windows-startup-audit','windows-archive-note-review'].forEach(patch);
})();