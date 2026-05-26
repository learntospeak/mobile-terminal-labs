(function(){
  const graph={
    'YOUR-PC':['ACCESS-SW'],
    'ACCESS-SW':['YOUR-PC','ROUTER-A','SALES-01','SALES-02','SALES-PRN','RECEPTION','LOBBY-AP'],
    'ROUTER-A':['ACCESS-SW','CORE-SW','DNS01','DHCP01','WEB-DMZ','ARCHIVE'],
    'CORE-SW':['ROUTER-A','FIREWALL','ACCOUNTS-PC','WAREHOUSE-PC','PACKET-LOSS'],
    'FIREWALL':['CORE-SW','VAULT-GATE'],
    'VAULT-GATE':['FIREWALL','FILESERV','DOOR-CTRL'],
    'FILESERV':['VAULT-GATE'],
    'SALES-01':['ACCESS-SW'],
    'SALES-02':['ACCESS-SW'],
    'SALES-PRN':['ACCESS-SW'],
    'RECEPTION':['ACCESS-SW'],
    'LOBBY-AP':['ACCESS-SW','KIOSK'],
    'KIOSK':['LOBBY-AP'],
    'DNS01':['ROUTER-A'],
    'DHCP01':['ROUTER-A'],
    'WEB-DMZ':['ROUTER-A'],
    'ARCHIVE':['ROUTER-A'],
    'ACCOUNTS-PC':['CORE-SW','NAS-ACCOUNTS'],
    'NAS-ACCOUNTS':['ACCOUNTS-PC','PAYROLL','BACKUP-NAS'],
    'PAYROLL':['NAS-ACCOUNTS'],
    'BACKUP-NAS':['NAS-ACCOUNTS'],
    'WAREHOUSE-PC':['CORE-SW','SCANNER'],
    'SCANNER':['WAREHOUSE-PC','LABEL-PRN'],
    'LABEL-PRN':['SCANNER'],
    'PACKET-LOSS':['CORE-SW','MONITOR01'],
    'MONITOR01':['PACKET-LOSS'],
    'DOOR-CTRL':['VAULT-GATE']
  };
  const ipData={
    'YOUR-PC':['10.10.5.23','255.255.255.0','10.10.5.1','Office workstation'],
    'ACCESS-SW':['10.10.5.1','255.255.255.0','10.10.5.254','LAN access switch/gateway'],
    'ROUTER-A':['10.10.5.254','255.255.255.0','10.20.0.1','Router to core network'],
    'CORE-SW':['10.20.0.1','255.255.255.0','10.20.7.1','Core switch'],
    'FIREWALL':['10.20.0.254','255.255.255.0','10.20.7.1','Firewall between core and secure servers'],
    'VAULT-GATE':['10.20.7.1','255.255.255.0','10.20.7.15','Secure server gateway'],
    'FILESERV':['10.20.7.15','255.255.255.0','10.20.7.1','Target file server'],
    'SALES-01':['10.10.5.41','255.255.255.0','10.10.5.1','Sales PC'],
    'SALES-02':['10.10.5.42','255.255.255.0','10.10.5.1','Sales PC'],
    'SALES-PRN':['10.10.5.44','255.255.255.0','10.10.5.1','Sales printer'],
    'RECEPTION':['10.10.5.31','255.255.255.0','10.10.5.1','Reception PC'],
    'LOBBY-AP':['10.10.5.12','255.255.255.0','10.10.5.1','Lobby access point'],
    'KIOSK':['10.10.5.77','255.255.255.0','10.10.5.1','Reception kiosk'],
    'DNS01':['10.10.20.10','255.255.255.0','10.10.20.1','DNS server'],
    'DHCP01':['10.10.20.11','255.255.255.0','10.10.20.1','DHCP server'],
    'WEB-DMZ':['172.16.10.20','255.255.255.0','172.16.10.1','DMZ web server'],
    'ARCHIVE':['10.10.30.50','255.255.255.0','10.10.30.1','Archive server'],
    'ACCOUNTS-PC':['10.20.0.41','255.255.255.0','10.20.0.1','Accounts PC'],
    'NAS-ACCOUNTS':['10.20.0.60','255.255.255.0','10.20.0.1','Accounts NAS'],
    'PAYROLL':['10.20.0.45','255.255.255.0','10.20.0.1','Payroll PC'],
    'BACKUP-NAS':['10.20.7.40','255.255.255.0','10.20.7.1','Backup storage'],
    'WAREHOUSE-PC':['10.20.0.81','255.255.255.0','10.20.0.1','Warehouse PC'],
    'SCANNER':['10.20.0.82','255.255.255.0','10.20.0.1','Warehouse scanner'],
    'LABEL-PRN':['10.20.0.83','255.255.255.0','10.20.0.1','Label printer'],
    'PACKET-LOSS':['10.20.0.200','255.255.255.0','10.20.0.1','Unstable link cloud'],
    'MONITOR01':['10.20.0.90','255.255.255.0','10.20.0.1','Monitoring node'],
    'DOOR-CTRL':['10.20.7.30','255.255.255.0','10.20.7.1','Door controller']
  };
  const edgeList=[['YOUR-PC','ACCESS-SW'],['ACCESS-SW','ROUTER-A'],['ROUTER-A','CORE-SW'],['CORE-SW','FIREWALL'],['FIREWALL','VAULT-GATE'],['VAULT-GATE','FILESERV'],['ACCESS-SW','SALES-01'],['ACCESS-SW','SALES-02'],['ACCESS-SW','SALES-PRN'],['ACCESS-SW','RECEPTION'],['ACCESS-SW','LOBBY-AP'],['LOBBY-AP','KIOSK'],['ROUTER-A','DNS01'],['ROUTER-A','DHCP01'],['ROUTER-A','WEB-DMZ'],['ROUTER-A','ARCHIVE'],['CORE-SW','ACCOUNTS-PC'],['ACCOUNTS-PC','NAS-ACCOUNTS'],['NAS-ACCOUNTS','PAYROLL'],['NAS-ACCOUNTS','BACKUP-NAS'],['CORE-SW','WAREHOUSE-PC'],['WAREHOUSE-PC','SCANNER'],['SCANNER','LABEL-PRN'],['CORE-SW','PACKET-LOSS'],['PACKET-LOSS','MONITOR01'],['VAULT-GATE','DOOR-CTRL']];
  const zones={lan:['ACCESS-SW','SALES-01','SALES-02','SALES-PRN','RECEPTION','LOBBY-AP','KIOSK'],gateway:['ROUTER-A','DNS01','DHCP01','WEB-DMZ','ARCHIVE'],core:['CORE-SW','ACCOUNTS-PC','NAS-ACCOUNTS','PAYROLL','BACKUP-NAS','WAREHOUSE-PC','SCANNER','LABEL-PRN','PACKET-LOSS','MONITOR01'],secure:['FIREWALL','VAULT-GATE','DOOR-CTRL'],target:['FILESERV']};
  const discovered=new Set(['YOUR-PC']);
  const unlocked=new Set();
  let active=true,current='YOUR-PC',moving=false,resultTimer=0;
  function q(s){return document.querySelector(s)}
  function qa(s){return Array.from(document.querySelectorAll(s))}
  function node(id){return document.querySelector('[data-id="'+id+'"]')}
  function edgeKey(a,b){return [a,b].sort().join('|')}
  function reveal(list){list.forEach(id=>discovered.add(id))}
  function setLog(text){const log=q('#log');if(log)log.textContent=text}
  function shortResult(text){return String(text||'').split('\n').filter(Boolean).slice(-3).join(' · ').replace(/^Patch:\s*/,'')}
  function showMobileResult(text){const toast=q('#pprMobileResult');if(!toast)return;toast.textContent=shortResult(text)||'Command complete.';toast.hidden=false;clearTimeout(resultTimer);resultTimer=setTimeout(()=>{toast.hidden=true},3600)}
  function pingReply(ip,name,zone,nextHint){return 'C:\\Lab> ping '+ip+'\n\nPinging '+name+' ['+ip+'] with 32 bytes of data:\nReply from '+ip+': bytes=32 time=2ms TTL=64\nReply from '+ip+': bytes=32 time=2ms TTL=64\n\nPing statistics for '+ip+':\n    Packets: Sent = 2, Received = 2, Lost = 0 (0% loss)\n\nPatch: Reply received. '+zone+' revealed.'+(nextHint?'\nNext clue: '+nextHint:'')}
  function ipconfigText(id){const d=ipData[id]||['0.0.0.0','255.255.255.0','0.0.0.0','Unknown device'];return 'C:\\Lab> ipconfig\n\nNode . . . . . . . . . . . . : '+id+'\nDescription . . . . . . . . : '+d[3]+'\nIPv4 Address . . . . . . . . : '+d[0]+'\nSubnet Mask . . . . . . . . : '+d[1]+'\nDefault Gateway . . . . . . : '+d[2]+'\n\nPatch: In the real world, ipconfig shows the machine you are on. Here it shows the node where the packet worm currently is.'}
  function center(id){const map=q('#map'),el=node(id);if(!map||!el)return null;const mr=map.getBoundingClientRect(),er=el.getBoundingClientRect();return{x:er.left-mr.left+er.width/2,y:er.top-mr.top+er.height/2}}
  function setCurrent(id){const c=center(id),w=q('#worm');if(!c||!w)return;current=id;qa('.node').forEach(n=>n.classList.toggle('current',n.dataset.id===id));w.style.left=(c.x-w.offsetWidth/2)+'px';w.style.top=(c.y-45)+'px';classify();renderCommandOptions()}
  function unlockZone(name){if(zones[name])reveal(zones[name]);unlocked.add(name);classify();renderCommandOptions()}
  function shortestPath(start,target){if(start===target)return[start];const queue=[[start]],seen=new Set([start]);while(queue.length){const p=queue.shift(),last=p[p.length-1];for(const next of graph[last]||[]){if(seen.has(next))continue;const c=p.concat(next);if(next===target)return c;seen.add(next);queue.push(c)}}return null}
  function animateTo(target){if(moving)return;const path=shortestPath(current,target);if(!path||path.length<2)return;moving=true;let i=1;const step=()=>{setCurrent(path[i]);i++;if(i<path.length)setTimeout(step,390);else{moving=false;renderCommandOptions()}};setTimeout(step,160)}
  function nextPingOption(){if(!unlocked.has('lan'))return{command:'ping 10.10.5.1',label:'Ping LAN gateway',meta:'Reveal ACCESS-SW and nearby office devices'};if(!unlocked.has('gateway'))return{command:'ping 10.10.5.254',label:'Ping router',meta:'Reveal ROUTER-A and the next network layer'};if(!unlocked.has('core'))return{command:'ping 10.20.0.1',label:'Ping core switch',meta:'Reveal the core office network'};if(!unlocked.has('secure'))return{command:'ping 10.20.7.1',label:'Ping secure gateway',meta:'Reveal the protected server path'};if(!unlocked.has('target'))return{command:'ping fileserver',label:'Ping FILESERV',meta:'Confirm the target and unlock the egg'};return{command:'ping fileserver',label:'Ping FILESERV again',meta:'Replay the final confirmation'}}
  function commandOptions(){const next=nextPingOption();const options=[{command:'ipconfig',label:'Check current node IP',meta:'Shows where Patch is standing now',kind:'support'},{...next,kind:'primary'}];if(next.command==='ping fileserver')options.push({command:'ping 10.20.7.15',label:'Ping FILESERV IP',meta:'Same target using the IP address',kind:'support'});return options}
  function injectMobileStyles(){
    if(q('#pprMobileSheetStyles'))return;
    const style=document.createElement('style');
    style.id='pprMobileSheetStyles';
    style.textContent='.ppr-mobile-action,.ppr-mobile-result,.ppr-sheet-overlay,.ppr-command-sheet{display:none}@media(max-width:760px){body{padding-bottom:82px}.console{display:none!important}.ppr-mobile-action{position:fixed;left:14px;right:14px;bottom:14px;z-index:30;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;border-radius:18px;border:1px solid rgba(125,211,252,.35);background:rgba(15,23,42,.92);box-shadow:0 18px 60px rgba(0,0,0,.45);backdrop-filter:blur(12px)}.ppr-mobile-action span{display:grid;gap:2px;color:#dbeafe;font-weight:900}.ppr-mobile-action small{color:#94a3b8;font-weight:700}.ppr-mobile-action button{min-height:46px;border:0;border-radius:14px;background:linear-gradient(180deg,#22c55e,#15803d);color:#fff;font-weight:1000;padding:0 16px}.ppr-mobile-result{position:fixed;left:14px;right:14px;bottom:82px;z-index:32;display:block;padding:12px 14px;border-radius:16px;border:1px solid rgba(103,232,249,.35);background:rgba(2,6,23,.94);color:#bfdbfe;font-family:Consolas,monospace;line-height:1.35;box-shadow:0 18px 55px rgba(0,0,0,.45)}.ppr-mobile-result[hidden]{display:none}.ppr-sheet-overlay{position:fixed;inset:0;z-index:40;background:rgba(2,6,23,.58);opacity:0;pointer-events:none;transition:opacity .18s ease}.ppr-command-sheet{position:fixed;left:0;right:0;bottom:0;z-index:41;display:grid;gap:12px;padding:14px 14px 18px;border-radius:24px 24px 0 0;border:1px solid rgba(125,211,252,.28);background:rgba(15,23,42,.98);box-shadow:0 -22px 70px rgba(0,0,0,.56);transform:translateY(105%);transition:transform .22s ease;max-height:72vh;overflow:auto}.ppr-sheet-open .ppr-sheet-overlay{opacity:1;pointer-events:auto}.ppr-sheet-open .ppr-command-sheet{transform:translateY(0)}.ppr-sheet-grab{width:46px;height:5px;border-radius:999px;background:rgba(148,163,184,.5);justify-self:center}.ppr-sheet-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.ppr-sheet-head h2{margin:0;color:#f8fafc;font-size:18px}.ppr-sheet-head p{margin:3px 0 0;color:#b6c7d9;font-size:13px}.ppr-sheet-close{min-width:42px;min-height:42px;border-radius:14px;border:1px solid rgba(148,163,184,.3);background:#020617;color:#dbeafe;font-weight:1000}.ppr-command-preview{padding:10px;border-radius:14px;background:#020617;border:1px solid rgba(148,163,184,.26);color:#67e8f9;font-family:Consolas,monospace;overflow:auto}.ppr-command-grid{display:grid;grid-template-columns:1fr;gap:9px}.ppr-command-option{min-height:68px;border-radius:16px;border:1px solid rgba(125,211,252,.28);background:#0f172a;color:#dbeafe;text-align:left;padding:11px;display:grid;gap:4px;cursor:pointer;touch-action:manipulation}.ppr-command-option strong{font-size:14px;color:#f8fafc}.ppr-command-option code{color:#67e8f9;font-family:Consolas,monospace;font-weight:900}.ppr-command-option span{color:#94a3b8;font-size:12px}.ppr-command-option.primary{border-color:rgba(34,197,94,.58);background:linear-gradient(180deg,rgba(22,101,52,.94),rgba(15,23,42,.96));box-shadow:0 0 18px rgba(34,197,94,.14)}.ppr-sheet-note{margin:0;color:#93c5fd;font-size:12px}}@media(min-width:761px){.ppr-mobile-action,.ppr-mobile-result,.ppr-sheet-overlay,.ppr-command-sheet{display:none!important}}';
    document.head.appendChild(style);
  }
  function addMobileControls(){
    if(q('#pprMobileAction'))return;
    injectMobileStyles();
    const dock=document.createElement('section');
    dock.id='pprMobileAction';
    dock.className='ppr-mobile-action';
    dock.innerHTML='<span>Next step<small id="pprNextLabel">Choose a command</small></span><button id="pprOpenSheet" type="button">Next Command</button>';
    const result=document.createElement('div');
    result.id='pprMobileResult';
    result.className='ppr-mobile-result';
    result.hidden=true;
    const overlay=document.createElement('div');
    overlay.id='pprSheetOverlay';
    overlay.className='ppr-sheet-overlay';
    const sheet=document.createElement('section');
    sheet.id='pprCommandSheet';
    sheet.className='ppr-command-sheet';
    sheet.setAttribute('aria-label','Command options');
    sheet.innerHTML='<div class="ppr-sheet-grab"></div><div class="ppr-sheet-head"><div><h2>Build the next command</h2><p>Pick the command Patch should run next.</p></div><button id="pprCloseSheet" class="ppr-sheet-close" type="button">×</button></div><div id="pprCommandPreview" class="ppr-command-preview">C:\\Lab&gt; choose a command</div><div id="pprCommandOptions" class="ppr-command-grid"></div><p class="ppr-sheet-note">Pattern: check IP, then ping the next gateway or target.</p>';
    document.body.appendChild(dock);document.body.appendChild(result);document.body.appendChild(overlay);document.body.appendChild(sheet);
    q('#pprOpenSheet').onclick=openSheet;
    q('#pprCloseSheet').onclick=closeSheet;
    overlay.onclick=closeSheet;
  }
  function openSheet(){document.body.classList.add('ppr-sheet-open')}
  function closeSheet(){document.body.classList.remove('ppr-sheet-open')}
  function renderCommandOptions(){const holder=q('#pprCommandOptions'),label=q('#pprNextLabel');const next=nextPingOption();if(label)label.textContent=next.label;if(!holder)return;holder.innerHTML='';commandOptions().forEach(option=>{const button=document.createElement('button');button.type='button';button.className='ppr-command-option '+(option.kind||'support');button.innerHTML='<strong>'+option.label+'</strong><code>C:\\Lab&gt; '+option.command+'</code><span>'+option.meta+'</span>';button.addEventListener('click',()=>runBuiltCommand(option.command));holder.appendChild(button)})}
  function runBuiltCommand(command){const input=q('#cmd'),preview=q('#pprCommandPreview');if(input)input.value=command;if(preview)preview.textContent='C:\\Lab> '+command;closeSheet();if(handleCommand(command)){if(input)input.value='';setTimeout(()=>{classify();renderCommandOptions()},140);setTimeout(renderCommandOptions,850)}}
  function handleCommand(raw){const cmd=String(raw||'').trim().toLowerCase().replace(/\s+/g,' ');let out='';if(!cmd)return false;if(cmd==='ipconfig'){out=ipconfigText(current);setLog(out);showMobileResult(out);return true}if(cmd==='ping 10.10.5.1'){unlockZone('lan');out=pingReply('10.10.5.1','ACCESS-SW.office.local','LAN access layer','ping 10.10.5.254 to test the router/gateway.');setLog(out);showMobileResult(out);animateTo('ACCESS-SW');return true}if(cmd==='ping 10.10.5.254'){if(!unlocked.has('lan')){out='C:\\Lab> '+raw+'\n\nRequest timed out.\nPatch: You have not mapped the local LAN yet. Try ping 10.10.5.1 first.';setLog(out);showMobileResult(out);return true}unlockZone('gateway');out=pingReply('10.10.5.254','ROUTER-A.office.local','gateway/router layer','ping 10.20.0.1 to test the core switch.');setLog(out);showMobileResult(out);animateTo('ROUTER-A');return true}if(cmd==='ping 10.20.0.1'){if(!unlocked.has('gateway')){out='C:\\Lab> '+raw+'\n\nDestination host unreachable.\nPatch: Find the router/gateway first: ping 10.10.5.254.';setLog(out);showMobileResult(out);return true}unlockZone('core');out=pingReply('10.20.0.1','CORE-SW.office.local','core office network','ping 10.20.7.1 to test the secure server gateway.');setLog(out);showMobileResult(out);animateTo('CORE-SW');return true}if(cmd==='ping 10.20.7.1'){if(!unlocked.has('core')){out='C:\\Lab> '+raw+'\n\nRequest timed out.\nPatch: The secure server network is hidden behind the core. Try ping 10.20.0.1 first.';setLog(out);showMobileResult(out);return true}unlockZone('secure');out=pingReply('10.20.7.1','VAULT-GATE.office.local','secure server gateway','ping 10.20.7.15 or ping fileserver to confirm the target.');setLog(out);showMobileResult(out);animateTo('VAULT-GATE');return true}if(cmd==='ping 10.20.7.15'||cmd==='ping fileserver'){if(!unlocked.has('secure')){out='C:\\Lab> '+raw+'\n\nPing request could not reach the target network.\nPatch: FILESERV is behind the secure gateway. Try ping 10.20.7.1 first.';setLog(out);showMobileResult(out);return true}unlockZone('target');out=pingReply('10.20.7.15','FILESERV.office.local','FILESERV target','Golden Egg route confirmed.');setLog(out);showMobileResult(out);animateTo('FILESERV');setTimeout(()=>{const r=q('#reward');if(r)r.hidden=false},2600);return true}return false}
  function visibleEdges(){const set=new Set();edgeList.forEach(([a,b])=>{if(discovered.has(a)&&discovered.has(b))set.add(edgeKey(a,b))});return set}
  function classify(){const map=q('#map');if(!map)return;map.classList.toggle('fog-active',active);if(!active){qa('.node').forEach(n=>n.classList.remove('fog-hidden','fog-visible','fog-frontier'));qa('.line').forEach(l=>l.classList.remove('fog-hidden-line','fog-visible-line'));return}discovered.add(current);const frontier=new Set((graph[current]||[]).filter(id=>discovered.has(id)));qa('.node').forEach(n=>{const id=n.dataset.id;n.classList.remove('fog-hidden','fog-visible','fog-frontier');if(id===current)n.classList.add('fog-visible');else if(discovered.has(id))n.classList.add(frontier.has(id)?'fog-frontier':'fog-visible');else n.classList.add('fog-hidden')});const ve=visibleEdges();qa('.line').forEach((l,i)=>{l.classList.remove('fog-hidden-line','fog-visible-line');const p=edgeList[i];if(p&&ve.has(edgeKey(p[0],p[1])))l.classList.add('fog-visible-line');else l.classList.add('fog-hidden-line')})}
  function addToggle(){if(q('#fogToggle'))return;const top=q('.top');if(!top)return;const wrap=document.createElement('div');wrap.innerHTML='<button id="fogToggle" class="fog-toggle" type="button">Fog: On</button><div class="fog-note">Ping each gateway IP to reveal the next section.</div>';top.appendChild(wrap);q('#fogToggle').onclick=()=>{active=!active;q('#fogToggle').textContent='Fog: '+(active?'On':'Off');classify();renderCommandOptions()}}
  function interceptTerminal(){const form=q('#terminal'),input=q('#cmd');if(!form||!input)return;form.addEventListener('submit',e=>{const raw=input.value;if(handleCommand(raw)){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();input.value=''}setTimeout(()=>{classify();renderCommandOptions()},100)},true)}
  function interceptClicks(){document.addEventListener('click',e=>{const n=e.target.closest&&e.target.closest('.node');if(!n)return;if(!(graph[current]||[]).includes(n.dataset.id))return;current=n.dataset.id;setTimeout(()=>setCurrent(n.dataset.id),20)},true)}
  function init(){addToggle();addMobileControls();current='YOUR-PC';setTimeout(()=>setCurrent('YOUR-PC'),120);interceptTerminal();interceptClicks();setInterval(()=>{classify();renderCommandOptions()},800);setLog('Patch: Fog is active. Start with ipconfig, then ping 10.10.5.1 to reveal and move to the LAN gateway.');renderCommandOptions()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();