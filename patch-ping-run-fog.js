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
  let active=true;
  let current='YOUR-PC';
  let moving=false;
  function q(s){return document.querySelector(s)}
  function qa(s){return Array.from(document.querySelectorAll(s))}
  function node(id){return document.querySelector('[data-id="'+id+'"]')}
  function edgeKey(a,b){return [a,b].sort().join('|')}
  function reveal(list){list.forEach(id=>discovered.add(id))}
  function setLog(text){const log=q('#log');if(log)log.textContent=text}
  function pingReply(ip,name,zone,nextHint){return 'C:\\Lab> ping '+ip+'\n\nPinging '+name+' ['+ip+'] with 32 bytes of data:\nReply from '+ip+': bytes=32 time=2ms TTL=64\nReply from '+ip+': bytes=32 time=2ms TTL=64\n\nPing statistics for '+ip+':\n    Packets: Sent = 2, Received = 2, Lost = 0 (0% loss)\n\nPatch: Reply received. '+zone+' revealed.'+(nextHint?'\nNext clue: '+nextHint:'')}
  function ipconfigText(id){const d=ipData[id]||['0.0.0.0','255.255.255.0','0.0.0.0','Unknown device'];return 'C:\\Lab> ipconfig\n\nNode . . . . . . . . . . . . : '+id+'\nDescription . . . . . . . . : '+d[3]+'\nIPv4 Address . . . . . . . . : '+d[0]+'\nSubnet Mask . . . . . . . . : '+d[1]+'\nDefault Gateway . . . . . . : '+d[2]+'\n\nPatch: In the real world, ipconfig shows the machine you are on. Here it shows the node where the packet worm currently is.'}
  function center(id){const map=q('#map'),el=node(id);if(!map||!el)return null;const mr=map.getBoundingClientRect(),er=el.getBoundingClientRect();return{x:er.left-mr.left+er.width/2,y:er.top-mr.top+er.height/2}}
  function setCurrent(id){
    const c=center(id), w=q('#worm');
    if(!c||!w)return;
    current=id;
    qa('.node').forEach(n=>n.classList.toggle('current',n.dataset.id===id));
    w.style.left=(c.x-w.offsetWidth/2)+'px';
    w.style.top=(c.y-45)+'px';
    classify();
    renderCommandBuilder();
  }
  function unlockZone(name){if(zones[name])reveal(zones[name]);unlocked.add(name);classify();renderCommandBuilder()}
  function shortestPath(start,target){
    if(start===target)return[start];
    const queue=[[start]],seen=new Set([start]);
    while(queue.length){const p=queue.shift(),last=p[p.length-1];for(const next of graph[last]||[]){if(seen.has(next))continue;const c=p.concat(next);if(next===target)return c;seen.add(next);queue.push(c)}}
    return null;
  }
  function animateTo(target){
    if(moving)return;
    const path=shortestPath(current,target);
    if(!path||path.length<2)return;
    moving=true;
    let i=1;
    const step=()=>{setCurrent(path[i]);i++;if(i<path.length)setTimeout(step,390);else{moving=false;renderCommandBuilder()}};
    setTimeout(step,160);
  }
  function nextPingOption(){
    if(!unlocked.has('lan'))return{command:'ping 10.10.5.1',label:'Ping LAN gateway',meta:'Reveal ACCESS-SW and nearby office devices'};
    if(!unlocked.has('gateway'))return{command:'ping 10.10.5.254',label:'Ping router',meta:'Reveal ROUTER-A and the next network layer'};
    if(!unlocked.has('core'))return{command:'ping 10.20.0.1',label:'Ping core switch',meta:'Reveal the core office network'};
    if(!unlocked.has('secure'))return{command:'ping 10.20.7.1',label:'Ping secure gateway',meta:'Reveal the protected server path'};
    if(!unlocked.has('target'))return{command:'ping fileserver',label:'Ping FILESERV',meta:'Confirm the target and unlock the egg'};
    return{command:'ping fileserver',label:'Ping FILESERV again',meta:'Replay the final confirmation'};
  }
  function commandOptions(){
    const next=nextPingOption();
    const options=[
      {command:'ipconfig',label:'Check current node IP',meta:'Shows where Patch is standing now',kind:'support'},
      {...next,kind:'primary'}
    ];
    if(next.command==='ping fileserver'){
      options.push({command:'ping 10.20.7.15',label:'Ping FILESERV IP',meta:'Same target using the IP address',kind:'support'});
    }
    return options;
  }
  function injectCommandBuilderStyles(){
    if(q('#pprCommandBuilderStyles'))return;
    const style=document.createElement('style');
    style.id='pprCommandBuilderStyles';
    style.textContent='.ppr-command-builder{margin-top:12px;padding:12px;border:1px solid rgba(125,211,252,.24);border-radius:18px;background:rgba(15,23,42,.76);display:grid;gap:10px}.ppr-command-builder h2{margin:0;color:#f8fafc;font-size:16px}.ppr-command-builder p{margin:0;color:#b6c7d9}.ppr-command-builder-preview{padding:10px;border-radius:12px;background:#020617;border:1px solid rgba(148,163,184,.26);color:#67e8f9;font-family:Consolas,monospace;overflow:auto}.ppr-command-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px}.ppr-command-option{min-height:68px;border-radius:14px;border:1px solid rgba(125,211,252,.28);background:#0f172a;color:#dbeafe;text-align:left;padding:10px;display:grid;gap:3px;cursor:pointer;touch-action:manipulation}.ppr-command-option strong{font-size:13px;color:#f8fafc}.ppr-command-option code{color:#67e8f9;font-family:Consolas,monospace;font-weight:900}.ppr-command-option span{color:#94a3b8;font-size:11px}.ppr-command-option.primary{border-color:rgba(34,197,94,.55);background:linear-gradient(180deg,rgba(22,101,52,.92),rgba(15,23,42,.95));box-shadow:0 0 18px rgba(34,197,94,.12)}.ppr-command-note{font-size:12px;color:#93c5fd}@media(max-width:760px){.ppr-command-builder{position:sticky;bottom:8px;z-index:10;box-shadow:0 18px 60px rgba(0,0,0,.45)}.ppr-command-grid{grid-template-columns:1fr}.ppr-command-option{min-height:64px}.console{padding-bottom:10px}.terminal input{font-size:16px}}';
    document.head.appendChild(style);
  }
  function addCommandBuilder(){
    if(q('#pprCommandBuilder'))return;
    injectCommandBuilderStyles();
    const form=q('#terminal');
    const consoleCard=form&&form.closest('.console');
    if(!form||!consoleCard)return;
    const panel=document.createElement('section');
    panel.id='pprCommandBuilder';
    panel.className='ppr-command-builder';
    panel.setAttribute('aria-label','Mobile command builder');
    panel.innerHTML='<div><h2>Build the next command</h2><p>Tap a command card to fill and run it. Desktop typing still works.</p></div><div id="pprCommandPreview" class="ppr-command-builder-preview">C:\\Lab&gt; choose a command</div><div id="pprCommandOptions" class="ppr-command-grid"></div><p class="ppr-command-note">Learn the pattern: check your IP, then ping the next gateway or target.</p>';
    consoleCard.appendChild(panel);
  }
  function renderCommandBuilder(){
    const holder=q('#pprCommandOptions');
    if(!holder)return;
    holder.innerHTML='';
    commandOptions().forEach(option=>{
      const button=document.createElement('button');
      button.type='button';
      button.className='ppr-command-option '+(option.kind||'support');
      button.innerHTML='<strong>'+option.label+'</strong><code>C:\\Lab&gt; '+option.command+'</code><span>'+option.meta+'</span>';
      button.addEventListener('click',()=>runBuiltCommand(option.command));
      holder.appendChild(button);
    });
  }
  function runBuiltCommand(command){
    const input=q('#cmd'),preview=q('#pprCommandPreview');
    if(input)input.value=command;
    if(preview)preview.textContent='C:\\Lab> '+command;
    if(handleCommand(command)){
      if(input)input.value='';
      setTimeout(()=>{classify();renderCommandBuilder()},140);
      setTimeout(renderCommandBuilder,700);
    }
  }
  function handleCommand(raw){
    const cmd=String(raw||'').trim().toLowerCase().replace(/\s+/g,' ');
    if(!cmd)return false;
    if(cmd==='ipconfig'){setLog(ipconfigText(current));return true}
    if(cmd==='ping 10.10.5.1'){unlockZone('lan');setLog(pingReply('10.10.5.1','ACCESS-SW.office.local','LAN access layer','ping 10.10.5.254 to test the router/gateway.'));animateTo('ACCESS-SW');return true}
    if(cmd==='ping 10.10.5.254'){if(!unlocked.has('lan')){setLog('C:\\Lab> '+raw+'\n\nRequest timed out.\nPatch: You have not mapped the local LAN yet. Try ping 10.10.5.1 first.');return true}unlockZone('gateway');setLog(pingReply('10.10.5.254','ROUTER-A.office.local','gateway/router layer','ping 10.20.0.1 to test the core switch.'));animateTo('ROUTER-A');return true}
    if(cmd==='ping 10.20.0.1'){if(!unlocked.has('gateway')){setLog('C:\\Lab> '+raw+'\n\nDestination host unreachable.\nPatch: Find the router/gateway first: ping 10.10.5.254.');return true}unlockZone('core');setLog(pingReply('10.20.0.1','CORE-SW.office.local','core office network','ping 10.20.7.1 to test the secure server gateway.'));animateTo('CORE-SW');return true}
    if(cmd==='ping 10.20.7.1'){if(!unlocked.has('core')){setLog('C:\\Lab> '+raw+'\n\nRequest timed out.\nPatch: The secure server network is hidden behind the core. Try ping 10.20.0.1 first.');return true}unlockZone('secure');setLog(pingReply('10.20.7.1','VAULT-GATE.office.local','secure server gateway','ping 10.20.7.15 or ping fileserver to confirm the target.'));animateTo('VAULT-GATE');return true}
    if(cmd==='ping 10.20.7.15'||cmd==='ping fileserver'){if(!unlocked.has('secure')){setLog('C:\\Lab> '+raw+'\n\nPing request could not reach the target network.\nPatch: FILESERV is behind the secure gateway. Try ping 10.20.7.1 first.');return true}unlockZone('target');setLog(pingReply('10.20.7.15','FILESERV.office.local','FILESERV target','Golden Egg route confirmed.'));animateTo('FILESERV');setTimeout(()=>{const r=q('#reward');if(r)r.hidden=false},2600);return true}
    return false;
  }
  function visibleEdges(){const set=new Set();edgeList.forEach(([a,b])=>{if(discovered.has(a)&&discovered.has(b))set.add(edgeKey(a,b))});return set}
  function classify(){const map=q('#map');if(!map)return;map.classList.toggle('fog-active',active);if(!active){qa('.node').forEach(n=>n.classList.remove('fog-hidden','fog-visible','fog-frontier'));qa('.line').forEach(l=>l.classList.remove('fog-hidden-line','fog-visible-line'));return}discovered.add(current);const frontier=new Set((graph[current]||[]).filter(id=>discovered.has(id)));qa('.node').forEach(n=>{const id=n.dataset.id;n.classList.remove('fog-hidden','fog-visible','fog-frontier');if(id===current)n.classList.add('fog-visible');else if(discovered.has(id))n.classList.add(frontier.has(id)?'fog-frontier':'fog-visible');else n.classList.add('fog-hidden')});const ve=visibleEdges();qa('.line').forEach((l,i)=>{l.classList.remove('fog-hidden-line','fog-visible-line');const p=edgeList[i];if(p&&ve.has(edgeKey(p[0],p[1])))l.classList.add('fog-visible-line');else l.classList.add('fog-hidden-line')})}
  function addToggle(){if(q('#fogToggle'))return;const top=q('.top');if(!top)return;const wrap=document.createElement('div');wrap.innerHTML='<button id="fogToggle" class="fog-toggle" type="button">Fog: On</button><div class="fog-note">Ping each gateway IP to reveal the next section.</div>';top.appendChild(wrap);q('#fogToggle').onclick=()=>{active=!active;q('#fogToggle').textContent='Fog: '+(active?'On':'Off');classify();renderCommandBuilder()}}
  function interceptTerminal(){const form=q('#terminal'),input=q('#cmd');if(!form||!input)return;form.addEventListener('submit',e=>{const raw=input.value;if(handleCommand(raw)){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();input.value=''}setTimeout(()=>{classify();renderCommandBuilder()},100)},true)}
  function interceptClicks(){document.addEventListener('click',e=>{const n=e.target.closest&&e.target.closest('.node');if(!n)return;if(!(graph[current]||[]).includes(n.dataset.id))return;current=n.dataset.id;setTimeout(()=>setCurrent(n.dataset.id),20)},true)}
  function init(){addToggle();addCommandBuilder();current='YOUR-PC';setTimeout(()=>setCurrent('YOUR-PC'),120);interceptTerminal();interceptClicks();setInterval(()=>{classify();renderCommandBuilder()},800);setLog('Patch: Fog is active. Start with ipconfig, then ping 10.10.5.1 to reveal and move to the LAN gateway.');renderCommandBuilder()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();