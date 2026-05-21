(function(){
var e=window.ScenarioEngine;if(!e||!Array.isArray(e.scenarios))return;
var s=e.scenarios.find(function(x){return x&&x.id==='win-ping-fileserver';});if(!s||s.__pingUpgrade)return;s.__pingUpgrade=true;
function c(x){return{command:x};}function r(x){return{raw:new RegExp(x,'i')};}function made(p){return{command:'echo',fileExists:p};}
var ex=[{match:{command:'ipconfig'},feedback:'Good local check first.'},{match:{command:'ping'},feedback:'Good reachability check. Compare name and IP results.'},{match:{command:'nslookup'},feedback:'Good DNS check.'},{match:{command:'dir'},feedback:'dir is valid, but this ticket is mainly a network check.'}];
s.title='Fileserver Reachability Ticket';s.objective='Read the ticket, check local IP settings, test fileserver by name and IP, verify DNS, then write a short conclusion.';s.commandFocus=['type','ipconfig','ping','nslookup','echo'];
s.environment=Object.assign({},s.environment||{},{platform:'cmd',cwd:'C:/Lab/Reports',directories:['C:/Lab','C:/Lab/Reports'],files:[{path:'C:/Lab/Reports/fileserver-ticket.txt',content:'User cannot access fileserver. Check local IP, ping by name, ping by IP, then verify DNS.\n'}]});
s.visualGuide={type:'network',nodes:['Your PC','Gateway','DNS','fileserver'],highlightAfter:{ipconfig:'Your PC','ping fileserver':'fileserver','nslookup fileserver':'DNS'}};
s.steps=[
{objective:'Read the fileserver ticket note.',commandFamily:'type',hints:['Start with the report.','Open fileserver-ticket.txt.','Try `type fileserver-ticket.txt`.'],demoCommand:'type fileserver-ticket.txt',accepts:[r('^type\\s+fileserver-ticket\\.txt$')],exploration:ex},
{objective:'Check this PC network configuration.',commandFamily:'ipconfig',hints:['Start local.','Use ipconfig.','Try `ipconfig`.'],demoCommand:'ipconfig',accepts:[c('ipconfig')],exploration:ex},
{objective:'Ping fileserver by name.',commandFamily:'ping',hints:['Test the name users use.','Use ping against fileserver.','Try `ping fileserver`.'],demoCommand:'ping fileserver',accepts:[r('^ping\\s+fileserver$')],exploration:ex},
{objective:'Ping fileserver by IP address.',commandFamily:'ping',hints:['Now test the IP.','The IP is 192.168.56.20.','Try `ping 192.168.56.20`.'],demoCommand:'ping 192.168.56.20',accepts:[r('^ping\\s+192\\.168\\.56\\.20$')],exploration:ex},
{objective:'Verify the fileserver name resolves in DNS.',commandFamily:'nslookup',hints:['Check DNS evidence.','Ask DNS for fileserver.','Try `nslookup fileserver`.'],demoCommand:'nslookup fileserver',accepts:[r('^nslookup\\s+fileserver$')],exploration:ex},
{objective:'Create a short conclusion note.',commandFamily:'echo',hints:['Document what you proved.','Create conclusion.txt.','Try `echo fileserver reachable > conclusion.txt`.'],demoCommand:'echo fileserver reachable > conclusion.txt',accepts:[made('C:/Lab/Reports/conclusion.txt'),r('^echo\\s+.+>\\s*conclusion\\.txt$')],exploration:ex}
];
})();