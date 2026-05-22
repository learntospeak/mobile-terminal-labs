(function(){
var e=window.ScenarioEngine;if(!e||!Array.isArray(e.scenarios))return;
function f(id){return e.scenarios.find(function(x){return x&&x.id===id;});}
function c(x){return{command:x};}function made(p,n){return{command:n||'echo',fileExists:p};}
var ex=[{match:{command:'dir'},feedback:'Good context check.'},{match:{command:'type'},feedback:'Good evidence check.'},{match:{command:'echo'},feedback:'Good documentation step.'},{match:{command:'ping'},feedback:'Ping checks reachability only.'},{match:{command:'netstat'},feedback:'Netstat helps inspect ports and connections.'},{match:{command:'findstr'},feedback:'Findstr helps filter noisy output.'}];
function env(){return{platform:'cmd',cwd:'C:/Lab/Reports',directories:['C:/Lab','C:/Lab/Reports'],files:[{path:'C:/Lab/Reports/readme.txt',content:'Put ticket notes here.\n'}]};}
function patch(id,title,obj,focus,steps){var s=f(id);if(!s||s.__batch5b)return;s.__batch5b=true;s.title=title;s.objective=obj;s.commandFocus=focus;s.environment=Object.assign({},s.environment||{},env());s.steps=steps.map(function(st){st.exploration=st.exploration||ex;return st;});}
function step(o,fam,demo){return{objective:o,commandFamily:fam,hints:['Read the task.','Use '+fam+'.','Try `'+demo+'`.'],demoCommand:demo,accepts:[c(fam)]};}
function note(file){return{objective:'Create '+file+' in Reports.',commandFamily:'echo',hints:['Document the result.','Use echo with redirection.','Try `echo checked > '+file+'`.'],demoCommand:'echo checked > '+file,accepts:[made('C:/Lab/Reports/'+file,'echo')]};}
function verify(file){return{objective:'Verify '+file+' opens.',commandFamily:'type',hints:['Verify the note.','Use type.','Try `type '+file+'`.'],demoCommand:'type '+file,accepts:[c('type')]};}
patch('win-localhost-service-check','Localhost Service Check','Check localhost connectivity, inspect listening ports, filter the service port, then document the result.',['ping','netstat','findstr','echo','type'],[
step('Ping localhost.', 'ping','ping 127.0.0.1'),
{objective:'List active and listening ports.',commandFamily:'netstat',hints:['Use netstat.','Use numeric output.','Try `netstat -an`.'],demoCommand:'netstat -an',accepts:[c('netstat')],exploration:ex},
{objective:'Filter the port list for 8080.',commandFamily:'findstr',hints:['Use findstr.','Search for 8080.','Try `netstat -an | findstr 8080`.'],demoCommand:'netstat -an | findstr 8080',accepts:[c('findstr')],exploration:ex},
note('localhost-service.txt'),verify('localhost-service.txt')]);
patch('win-printer-basic-triage','Printer Basic Triage','Check the print service, inspect shares, verify context, then record printer triage evidence.',['sc','net','dir','echo','type'],[
{objective:'Check the Spooler service.',commandFamily:'sc',hints:['Use sc query.','Target Spooler.','Try `sc query Spooler`.'],demoCommand:'sc query Spooler',accepts:[c('sc')],exploration:ex},
{objective:'Review printer/share context.',commandFamily:'net',hints:['Use net share.','Look for shared resources.','Try `net share`.'],demoCommand:'net share',accepts:[c('net')],exploration:ex},
step('List Reports before saving printer evidence.','dir','dir'),note('printer-triage.txt'),verify('printer-triage.txt')]);
patch('win-web-port-triage','Web Port Triage','Check web server reachability, inspect ports, filter web traffic, then document the finding.',['ping','netstat','findstr','echo','type'],[
step('Ping the web server name.','ping','ping web-lab'),
{objective:'Check active/listening ports.',commandFamily:'netstat',hints:['Use netstat.','Use -an.','Try `netstat -an`.'],demoCommand:'netstat -an',accepts:[c('netstat')],exploration:ex},
{objective:'Filter for web port 80.',commandFamily:'findstr',hints:['Use findstr.','Search for :80.','Try `netstat -an | findstr :80`.'],demoCommand:'netstat -an | findstr :80',accepts:[c('findstr')],exploration:ex},
note('web-port-triage.txt'),verify('web-port-triage.txt')]);
patch('win-dhcp-basic-check','DHCP Basic Check','Inspect IP lease context, filter DHCP and gateway evidence, then write a DHCP note.',['ipconfig','findstr','echo','type'],[
{objective:'Run ipconfig /all for lease details.',commandFamily:'ipconfig',hints:['Use ipconfig.','Use /all for detail.','Try `ipconfig /all`.'],demoCommand:'ipconfig /all',accepts:[c('ipconfig')],exploration:ex},
{objective:'Filter ipconfig output for DHCP.',commandFamily:'findstr',hints:['Use findstr.','Search DHCP.','Try `ipconfig /all | findstr DHCP`.'],demoCommand:'ipconfig /all | findstr DHCP',accepts:[c('findstr')],exploration:ex},
{objective:'Filter ipconfig output for Gateway.',commandFamily:'findstr',hints:['Use findstr.','Search Gateway.','Try `ipconfig /all | findstr Gateway`.'],demoCommand:'ipconfig /all | findstr Gateway',accepts:[c('findstr')],exploration:ex},
note('dhcp-check.txt'),verify('dhcp-check.txt')]);
patch('win-basic-firewall-check','Basic Firewall Check','Inspect firewall profile state, filter the state lines, and save a firewall review note.',['netsh','findstr','echo','type'],[
{objective:'Show firewall profile state.',commandFamily:'netsh',hints:['Use netsh.','Show all profiles.','Try `netsh advfirewall show allprofiles`.'],demoCommand:'netsh advfirewall show allprofiles',accepts:[c('netsh')],exploration:ex},
{objective:'Filter firewall output for State.',commandFamily:'findstr',hints:['Use findstr.','Search for State.','Try `netsh advfirewall show allprofiles | findstr State`.'],demoCommand:'netsh advfirewall show allprofiles | findstr State',accepts:[c('findstr')],exploration:ex},
step('List Reports before saving firewall evidence.','dir','dir'),note('firewall-check.txt'),verify('firewall-check.txt')]);
})();