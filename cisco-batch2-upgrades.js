(function(){
var e=window.ScenarioEngine;if(!e||!Array.isArray(e.scenarios))return;
function f(id){return e.scenarios.find(function(x){return x&&x.id===id;});}
function c(x){return{command:x};}function raw(x){return{raw:new RegExp(x,'i')};}
var ex=[{match:{command:'show'},feedback:'Good inspection command. Verify before and after changes.'},{match:{command:'enable'},feedback:'enable moves to privileged EXEC mode.'},{match:{command:'configure'},feedback:'configure terminal enters global config mode.'},{match:{command:'exit'},feedback:'exit backs out one mode.'},{match:{command:'end'},feedback:'end returns to privileged EXEC mode.'},{match:{command:'ping'},feedback:'ping checks reachability.'},{match:{command:'traceroute'},feedback:'traceroute checks the path.'}];
function env(){return{platform:'cisco',host:'Router',cwd:'/',router:{hostname:'Router',mode:'user-exec',selectedInterface:null,interfaces:[],staticRoutes:[],startupConfig:null}};}
function patch(id,title,obj,focus,steps){var s=f(id);if(!s||s.__ciscoBatch2)return;s.__ciscoBatch2=true;s.title=title;s.objective=obj;s.shell='cisco';s.environmentCategory='cisco';s.commandFocus=focus;s.environment=Object.assign({},s.environment||{},env());s.steps=steps.map(function(st){st.exploration=st.exploration||ex;return st;});}
function step(o,fam,demo){return{objective:o,commandFamily:fam,hints:['Read the task.','Use '+fam+'.','Try `'+demo+'`.'],demoCommand:demo,accepts:[c(fam)]};}
patch('cisco-change-hostname','Change and Verify Router Hostname','Enter configuration mode, change the hostname, exit safely, and verify the prompt/config.', ['enable','configure','hostname','show'],[
step('Enter privileged EXEC mode.','enable','enable'),
step('Enter global configuration mode.','configure','configure terminal'),
{objective:'Change the hostname to Branch-R1.',commandFamily:'hostname',hints:['Use hostname.','Set Branch-R1.','Try `hostname Branch-R1`.'],demoCommand:'hostname Branch-R1',accepts:[c('hostname')],exploration:ex},
{objective:'Return to privileged mode.',commandFamily:'end',hints:['Use end.','Return to # prompt.','Try `end`.'],demoCommand:'end',accepts:[c('end')],exploration:ex},
{objective:'Verify the hostname appears in running config.',commandFamily:'show',hints:['Use show running-config.','Look for hostname.','Try `show running-config`.'],demoCommand:'show running-config',accepts:[c('show')],exploration:ex}
]);
patch('cisco-review-and-save-config','Review and Save Router Configuration','Inspect running config, check startup config, save changes, then verify saved state.', ['enable','show','copy','write'],[
step('Enter privileged EXEC mode.','enable','enable'),
{objective:'Review the current running configuration.',commandFamily:'show',hints:['Use show running-config.','This is read-only.','Try `show running-config`.'],demoCommand:'show running-config',accepts:[c('show')],exploration:ex},
{objective:'Review the startup configuration before saving.',commandFamily:'show',hints:['Use show startup-config.','Compare before saving.','Try `show startup-config`.'],demoCommand:'show startup-config',accepts:[c('show')],exploration:ex},
{objective:'Save running config to startup config.',commandFamily:'copy',hints:['Use copy command.','Source then destination.','Try `copy running-config startup-config`.'],demoCommand:'copy running-config startup-config',accepts:[c('copy')],exploration:ex},
{objective:'Verify startup config after saving.',commandFamily:'show',hints:['Use show startup-config again.','Confirm saved state.','Try `show startup-config`.'],demoCommand:'show startup-config',accepts:[c('show')],exploration:ex}
]);
patch('cisco-connectivity-checks','Cisco Connectivity Evidence Check','Inspect interface status, ping a neighbour, traceroute a destination, and record the evidence through show commands.', ['enable','show','ping','traceroute'],[
step('Enter privileged EXEC mode.','enable','enable'),
{objective:'Check interface summary before testing reachability.',commandFamily:'show',hints:['Use show ip interface brief.','Look for interface status.','Try `show ip interface brief`.'],demoCommand:'show ip interface brief',accepts:[c('show')],exploration:ex},
{objective:'Ping the LAN neighbour.',commandFamily:'ping',hints:['Use ping.','Target 192.168.10.10.','Try `ping 192.168.10.10`.'],demoCommand:'ping 192.168.10.10',accepts:[c('ping')],exploration:ex},
{objective:'Trace the route to the remote server.',commandFamily:'traceroute',hints:['Use traceroute.','Target 10.10.10.20.','Try `traceroute 10.10.10.20`.'],demoCommand:'traceroute 10.10.10.20',accepts:[c('traceroute')],exploration:ex},
{objective:'Review the routing table after testing.',commandFamily:'show',hints:['Use show ip route.','Confirm route context.','Try `show ip route`.'],demoCommand:'show ip route',accepts:[c('show')],exploration:ex}
]);
patch('cisco-add-static-route','Add and Verify a Static Route','Inspect current routes, add a static route, verify route table, then test reachability.', ['enable','show','configure','ip','ping'],[
step('Enter privileged EXEC mode.','enable','enable'),
{objective:'Review the route table before adding a route.',commandFamily:'show',hints:['Use show ip route.','Check current routes.','Try `show ip route`.'],demoCommand:'show ip route',accepts:[c('show')],exploration:ex},
step('Enter global configuration mode.','configure','configure terminal'),
{objective:'Add a static route to 10.20.0.0/24 via 192.168.10.254.',commandFamily:'ip',hints:['Use ip route.','Network, mask, next-hop.','Try `ip route 10.20.0.0 255.255.255.0 192.168.10.254`.'],demoCommand:'ip route 10.20.0.0 255.255.255.0 192.168.10.254',accepts:[c('ip')],exploration:ex},
{objective:'Return to privileged mode and verify the new route.',commandFamily:'show',hints:['Use end then show ip route.','Look for the static route.','Try `show ip route`.'],demoCommand:'show ip route',accepts:[c('show')],exploration:ex},
{objective:'Ping a host in the routed network.',commandFamily:'ping',hints:['Test after adding route.','Target 10.20.0.10.','Try `ping 10.20.0.10`.'],demoCommand:'ping 10.20.0.10',accepts:[c('ping')],exploration:ex}
]);
patch('cisco-shutdown-unused-interface','Shutdown and Verify an Unused Interface','Inspect interface state, shut an unused port, and verify status safely.', ['enable','show','configure','interface','shutdown'],[
step('Enter privileged EXEC mode.','enable','enable'),
{objective:'Check interface status before shutting anything.',commandFamily:'show',hints:['Use show ip interface brief.','Find unused interfaces.','Try `show ip interface brief`.'],demoCommand:'show ip interface brief',accepts:[c('show')],exploration:ex},
step('Enter global configuration mode.','configure','configure terminal'),
{objective:'Select unused interface GigabitEthernet0/2.',commandFamily:'interface',hints:['Use interface command.','Target Gi0/2.','Try `interface GigabitEthernet0/2`.'],demoCommand:'interface GigabitEthernet0/2',accepts:[c('interface')],exploration:ex},
{objective:'Shutdown the unused interface.',commandFamily:'shutdown',hints:['Use shutdown.','This disables the interface.','Try `shutdown`.'],demoCommand:'shutdown',accepts:[c('shutdown')],exploration:ex},
{objective:'Return and verify the interface status.',commandFamily:'show',hints:['Use end then show.','Check Gi0/2 status.','Try `show ip interface brief`.'],demoCommand:'show ip interface brief',accepts:[c('show')],exploration:ex}
]);
})();