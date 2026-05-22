(function(){
var e=window.ScenarioEngine;if(!e||!Array.isArray(e.scenarios))return;
function add(step,cmd,msg){step.exploration=Array.isArray(step.exploration)?step.exploration:[];step.exploration.push({match:{command:cmd},feedback:msg})}
function patch(s){if(!s||s.__reviewPolish)return;s.__reviewPolish=true;(s.steps||[]).forEach(function(st){var obj=String(st.objective||'').toLowerCase();var fam=String(st.commandFamily||'').toLowerCase();
if(obj.indexOf('verify')>=0||obj.indexOf('document')>=0||obj.indexOf('note')>=0||obj.indexOf('review')>=0||obj.indexOf('confirm')>=0){
add(st,'dir','Good destination check. If the expected file or evidence is visible, open it or continue to the final note.');
add(st,'ls','Good destination check. If the expected file or evidence is visible, open it or continue to the final note.');
add(st,'type','Good verification. If this opens the expected file, the step is effectively complete.');
add(st,'cat','Good verification. If this opens the expected file, the step is effectively complete.');
add(st,'echo','Good documentation step. If you already created the note, verify it with type/cat.');
}
if(['echo','type','cat','dir','ls'].indexOf(fam)>=0){
add(st,'pwd','Good orientation check. Continue from the current folder if it matches the task.');
add(st,'cd','Good folder movement. If you landed in the correct folder, continue with the next file or note command.');
}
});}
e.scenarios.forEach(patch);
})();