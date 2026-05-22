(function(){
var e=window.ScenarioEngine;if(!e||!Array.isArray(e.scenarios))return;
function find(id){return e.scenarios.find(function(s){return s&&s.id===id})}
function add(step,cmd,msg){step.exploration=Array.isArray(step.exploration)?step.exploration:[];step.exploration.push({match:{command:cmd},feedback:msg})}
function patch(id){var s=find(id);if(!s||s.__ciscoPolish)return;s.__ciscoPolish=true;(s.steps||[]).forEach(function(st){var fam=String(st.commandFamily||'').toLowerCase();var obj=String(st.objective||'').toLowerCase();
if(['enable','disable','configure','interface','hostname','description','ip','no','shutdown','copy','write','show','ping','traceroute'].indexOf(fam)>=0){
add(st,'show','Good verification command. If you already confirmed the state, continue with the next configuration or test step.');
add(st,'enable','Good mode change. If you are already at the # prompt, continue with the next task.');
add(st,'configure','Good mode change. If you are already in config mode, continue with the configuration step.');
add(st,'exit','You backed out one mode. Check the prompt and continue from the correct mode.');
add(st,'end','Good recovery. You are back at privileged EXEC mode; continue with verification or the next task.');
}
if(obj.indexOf('verify')>=0||obj.indexOf('review')>=0||obj.indexOf('check')>=0){
add(st,'show','Good verification. If the expected state is visible, the task can move forward.');
add(st,'ping','Good reachability check. If reachability is already proven, continue with route/status verification.');
add(st,'traceroute','Good path check. If the path is known, continue with route/status verification.');
}
});}
['cisco-enter-privileged-mode','cisco-show-version-and-status','cisco-interface-description','cisco-no-shutdown-lan','cisco-assign-ip-address','cisco-change-hostname','cisco-review-and-save-config','cisco-connectivity-checks','cisco-add-static-route','cisco-shutdown-unused-interface'].forEach(patch);
})();