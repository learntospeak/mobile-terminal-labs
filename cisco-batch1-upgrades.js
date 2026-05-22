(function(){
var e=window.ScenarioEngine;if(!e||!Array.isArray(e.scenarios))return;
function f(id){return e.scenarios.find(function(x){return x&&x.id===id;});}
function c(x){return{command:x};}function raw(x){return{raw:new RegExp(x,'i')};}
var ex=[{match:{command:'show'},feedback:'Good inspection command. show commands help you verify before changing config.'},{match:{command:'enable'},feedback:'enable moves from user EXEC to privileged EXEC.'},{match:{command:'configure'},feedback:'configure terminal enters global configuration mode.'},{match:{command:'exit'},feedback:'exit backs out one mode. Check the prompt before continuing.'},{match:{command:'end'},feedback:'end returns to privileged EXEC mode.'}];
function env(){return{platform:'cisco',host:'Router',cwd:'/',router:{hostname:'Router',mode:'user-exec',selectedInterface:null,interfaces:[],staticRoutes:[],startupConfig:null}};}
function patch(id,title,obj,focus,steps){var s=f(id);if(!s||s.__ciscoBatch1)return;s.__ciscoBatch1=true;s.title=title;s.objective=obj;s.shell='cisco';s.environmentCategory='cisco';s.commandFocus=focus;s.environment=Object.assign({},s.environment||{},env());s.steps=steps.map(function(st){st.exploration=st.exploration||ex;return st;});}
function step(o,fam,demo){return{objective:o,commandFamily:fam,hints:['Read the task.','Use '+fam+'.','Try `'+demo+'`.'],demoCommand:demo,accepts:[c(fam)]};}
patch('cisco-enter-privileged-mode','Enter and Verify Privileged Mode','Enter privileged EXEC mode, inspect status, then return safely.', ['enable','show','disable'],[
step('Check the current router prompt before changing modes.','show','show clock'),
{objective:'Enter privileged EXEC mode.',commandFamily:'enable',hints:['Use enable.','The prompt should change from > to #.','Try `enable`.'],demoCommand:'enable',accepts:[c('enable')],exploration:ex},
{objective:'Verify privileged mode with a show command.',commandFamily:'show',hints:['Use a safe show command.','Check version information.','Try `show version`.'],demoCommand:'show version',accepts:[c('show')],exploration:ex},
{objective:'Return to user EXEC mode.',commandFamily:'disable',hints:['Use disable.','Prompt should return to >.','Try `disable`.'],demoCommand:'disable',accepts:[c('disable')],exploration:ex}
]);
patch('cisco-show-version-and-status','Version and Interface Status Review','Use show commands to collect router version and interface status evidence.', ['show'],[
step('Enter privileged mode first if needed.','enable','enable'),
{objective:'Show router version information.',commandFamily:'show',hints:['Use show version.','This is safe read-only evidence.','Try `show version`.'],demoCommand:'show version',accepts:[c('show')],exploration:ex},
{objective:'Show interface summary status.',commandFamily:'show',hints:['Use the brief interface summary.','Look for up/down state.','Try `show ip interface brief`.'],demoCommand:'show ip interface brief',accepts:[c('show')],exploration:ex},
{objective:'Show running configuration for context.',commandFamily:'show',hints:['Use show running-config.','This is read-only.','Try `show running-config`.'],demoCommand:'show running-config',accepts:[c('show')],exploration:ex}
]);
patch('cisco-interface-description','Set and Verify Interface Description','Enter config mode, select an interface, add a description, then verify it.', ['enable','configure','interface','description','show'],[
step('Enter privileged EXEC mode.','enable','enable'),
{objective:'Enter global configuration mode.',commandFamily:'configure',hints:['Use configure terminal.','Prompt should show config.','Try `configure terminal`.'],demoCommand:'configure terminal',accepts:[raw('^configure\\s+terminal$'),c('configure')],exploration:ex},
{objective:'Select interface GigabitEthernet0/1.',commandFamily:'interface',hints:['Use interface command.','Target Gi0/1.','Try `interface GigabitEthernet0/1`.'],demoCommand:'interface GigabitEthernet0/1',accepts:[c('interface')],exploration:ex},
{objective:'Add a clear interface description.',commandFamily:'description',hints:['Use description.','Describe the LAN handoff.','Try `description LAN handoff`.'],demoCommand:'description LAN handoff',accepts:[c('description')],exploration:ex},
{objective:'Return to privileged mode and verify the description.',commandFamily:'show',hints:['Use end then show.','Verify interface config.','Try `end`, then `show running-config interface GigabitEthernet0/1`.'],demoCommand:'show running-config interface GigabitEthernet0/1',accepts:[c('show')],exploration:ex}
]);
patch('cisco-no-shutdown-lan','Bring Up and Verify a LAN Interface','Inspect interface state, enter config mode, no shut the LAN port, then verify status.', ['show','enable','configure','interface','no'],[
step('Enter privileged mode.','enable','enable'),
{objective:'Check interface status before changing it.',commandFamily:'show',hints:['Use show ip interface brief.','Find the LAN interface.','Try `show ip interface brief`.'],demoCommand:'show ip interface brief',accepts:[c('show')],exploration:ex},
{objective:'Enter interface configuration mode for Gi0/1.',commandFamily:'interface',hints:['Enter config mode first.','Select Gi0/1.','Try `configure terminal`, then `interface GigabitEthernet0/1`.'],demoCommand:'interface GigabitEthernet0/1',accepts:[c('interface')],exploration:ex},
{objective:'Enable the interface with no shutdown.',commandFamily:'no',hints:['Use no shutdown.','This enables the interface.','Try `no shutdown`.'],demoCommand:'no shutdown',accepts:[raw('^no\\s+shutdown$'),c('no')],exploration:ex},
{objective:'Verify interface status after enabling it.',commandFamily:'show',hints:['Use end then show.','Check brief status again.','Try `show ip interface brief`.'],demoCommand:'show ip interface brief',accepts:[c('show')],exploration:ex}
]);
patch('cisco-assign-ip-address','Assign and Verify Interface IP','Configure an interface IP address, enable the interface, then verify address and status.', ['enable','configure','interface','ip','no','show'],[
step('Enter privileged mode.','enable','enable'),
step('Enter global configuration mode.','configure','configure terminal'),
{objective:'Select interface GigabitEthernet0/1.',commandFamily:'interface',hints:['Use interface command.','Target Gi0/1.','Try `interface GigabitEthernet0/1`.'],demoCommand:'interface GigabitEthernet0/1',accepts:[c('interface')],exploration:ex},
{objective:'Assign the LAN IP address.',commandFamily:'ip',hints:['Use ip address.','Use 192.168.10.1/24 mask.','Try `ip address 192.168.10.1 255.255.255.0`.'],demoCommand:'ip address 192.168.10.1 255.255.255.0',accepts:[c('ip')],exploration:ex},
{objective:'Enable the interface.',commandFamily:'no',hints:['Use no shutdown.','Bring interface up.','Try `no shutdown`.'],demoCommand:'no shutdown',accepts:[c('no')],exploration:ex},
{objective:'Verify the interface IP.',commandFamily:'show',hints:['Use show ip interface brief.','Check IP and status.','Try `show ip interface brief`.'],demoCommand:'show ip interface brief',accepts:[c('show')],exploration:ex}
]);
})();