(function(){
var e=window.ScenarioEngine;if(!e||!Array.isArray(e.scenarios))return;
function find(id){return e.scenarios.find(function(s){return s&&s.id===id})}
function add(step,cmd,msg){step.exploration=Array.isArray(step.exploration)?step.exploration:[];step.exploration.push({match:{command:cmd},feedback:msg})}
function patch(id){var s=find(id);if(!s||s.__adminPolish)return;s.__adminPolish=true;(s.steps||[]).forEach(function(st){var fam=String(st.commandFamily||'').toLowerCase();var obj=String(st.objective||'').toLowerCase();
if(['net','schtasks','query','where'].indexOf(fam)>=0){add(st,'net','Good Windows admin check. If you already found the account, group, share, or mapping, continue with the next step.');add(st,'findstr','Good filter. If the needed line is visible, continue with documentation.');add(st,'dir','Good location check. Continue with the current admin review task.');}
if(obj.indexOf('verify')>=0||obj.indexOf('document')>=0||obj.indexOf('note')>=0){add(st,'dir','Good destination check. If the note already exists, open it to verify.');add(st,'type','Good verification. If this opens the expected note, the task is effectively complete.');}
});}
['win-net-user-analyst','win-net-localgroup-admins','win-net-share-audit','win-net-use-map-tools','win-schtasks-review','win-query-user-sessions','win-where-python'].forEach(patch);
})();