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
  const edgeList=[['YOUR-PC','ACCESS-SW'],['ACCESS-SW','ROUTER-A'],['ROUTER-A','CORE-SW'],['CORE-SW','FIREWALL'],['FIREWALL','VAULT-GATE'],['VAULT-GATE','FILESERV'],['ACCESS-SW','SALES-01'],['ACCESS-SW','SALES-02'],['ACCESS-SW','SALES-PRN'],['ACCESS-SW','RECEPTION'],['ACCESS-SW','LOBBY-AP'],['LOBBY-AP','KIOSK'],['ROUTER-A','DNS01'],['ROUTER-A','DHCP01'],['ROUTER-A','WEB-DMZ'],['ROUTER-A','ARCHIVE'],['CORE-SW','ACCOUNTS-PC'],['ACCOUNTS-PC','NAS-ACCOUNTS'],['NAS-ACCOUNTS','PAYROLL'],['NAS-ACCOUNTS','BACKUP-NAS'],['CORE-SW','WAREHOUSE-PC'],['WAREHOUSE-PC','SCANNER'],['SCANNER','LABEL-PRN'],['CORE-SW','PACKET-LOSS'],['PACKET-LOSS','MONITOR01'],['VAULT-GATE','DOOR-CTRL']];
  const zones={
    lan:['ACCESS-SW','SALES-01','SALES-02','SALES-PRN','RECEPTION','LOBBY-AP','KIOSK'],
    gateway:['ROUTER-A','DNS01','DHCP01','WEB-DMZ','ARCHIVE'],
    core:['CORE-SW','ACCOUNTS-PC','NAS-ACCOUNTS','PAYROLL','BACKUP-NAS','WAREHOUSE-PC','SCANNER','LABEL-PRN','PACKET-LOSS','MONITOR01'],
    secure:['FIREWALL','VAULT-GATE','DOOR-CTRL'],
    target:['FILESERV']
  };
  const discovered=new Set(['YOUR-PC']);
  const unlocked=new Set();
  let active=true;
  function q(s){return document.querySelector(s)}
  function qa(s){return Array.from(document.querySelectorAll(s))}
  function currentId(){const n=q('.node.current');return n?n.dataset.id:'YOUR-PC'}
  function edgeKey(a,b){return [a,b].sort().join('|')}
  function reveal(list){list.forEach(id=>discovered.add(id))}
  function setLog(text){const log=q('#log');if(log)log.textContent=text}
  function pingReply(ip,name,zone,nextHint){
    return 'C:\\Lab> ping '+ip+'\n\nPinging '+name+' ['+ip+'] with 32 bytes of data:\nReply from '+ip+': bytes=32 time=2ms TTL=64\nReply from '+ip+': bytes=32 time=2ms TTL=64\n\nPing statistics for '+ip+':\n    Packets: Sent = 2, Received = 2, Lost = 0 (0% loss)\n\nPatch: Reply received. '+zone+' revealed.'+(nextHint?'\nNext clue: '+nextHint:'');
  }
  function unlockZone(name){
    if(zones[name]) reveal(zones[name]);
    unlocked.add(name);
    classify();
  }
  function handleCommand(raw){
    const cmd=String(raw||'').trim().toLowerCase().replace(/\s+/g,' ');
    if(!cmd) return false;
    if(cmd==='ping 10.10.5.1'){
      unlockZone('lan');
      setLog(pingReply('10.10.5.1','ACCESS-SW.office.local','LAN access layer','ping 10.10.5.254 to test the router/gateway.'));
      return true;
    }
    if(cmd==='ping 10.10.5.254'){
      if(!unlocked.has('lan')){setLog('C:\\Lab> '+raw+'\n\nRequest timed out.\nPatch: You have not mapped the local LAN yet. Try ping 10.10.5.1 first.');return true;}
      unlockZone('gateway');
      setLog(pingReply('10.10.5.254','ROUTER-A.office.local','gateway/router layer','ping 10.20.0.1 to test the core switch.'));
      return true;
    }
    if(cmd==='ping 10.20.0.1'){
      if(!unlocked.has('gateway')){setLog('C:\\Lab> '+raw+'\n\nDestination host unreachable.\nPatch: Find the router/gateway first: ping 10.10.5.254.');return true;}
      unlockZone('core');
      setLog(pingReply('10.20.0.1','CORE-SW.office.local','core office network','ping 10.20.7.1 to test the secure server gateway.'));
      return true;
    }
    if(cmd==='ping 10.20.7.1'){
      if(!unlocked.has('core')){setLog('C:\\Lab> '+raw+'\n\nRequest timed out.\nPatch: The secure server network is hidden behind the core. Try ping 10.20.0.1 first.');return true;}
      unlockZone('secure');
      setLog(pingReply('10.20.7.1','VAULT-GATE.office.local','secure server gateway','ping 10.20.7.15 or ping fileserver to confirm the target.'));
      return true;
    }
    if(cmd==='ping 10.20.7.15'||cmd==='ping fileserver'){
      if(!unlocked.has('secure')){setLog('C:\\Lab> '+raw+'\n\nPing request could not reach the target network.\nPatch: FILESERV is behind the secure gateway. Try ping 10.20.7.1 first.');return true;}
      unlockZone('target');
      setLog(pingReply('10.20.7.15','FILESERV.office.local','FILESERV target','follow the revealed secure path to deliver the packet.'));
      return true;
    }
    if(cmd==='ipconfig'){
      setLog('C:\\Lab> ipconfig\n\nIPv4 Address . . . . . . . . . : 10.10.5.23\nSubnet Mask . . . . . . . . . : 255.255.255.0\nDefault Gateway . . . . . . . : 10.10.5.1\n\nPatch: Your first reachable network device should be the gateway. Try ping 10.10.5.1.');
      return true;
    }
    return false;
  }
  function allVisibleEdges(){const set=new Set();edgeList.forEach(([a,b])=>{if(discovered.has(a)&&discovered.has(b))set.add(edgeKey(a,b))});return set}
  function classify(){
    const map=q('#map'); if(!map)return;
    map.classList.toggle('fog-active',active);
    if(!active){qa('.node').forEach(n=>n.classList.remove('fog-hidden','fog-visible','fog-frontier'));qa('.line').forEach(l=>l.classList.remove('fog-hidden-line','fog-visible-line','fog-frontier-line'));return;}
    const cur=currentId();
    discovered.add(cur);
    const frontier=new Set((graph[cur]||[]).filter(id=>discovered.has(id)));
    qa('.node').forEach(n=>{
      const id=n.dataset.id;
      n.classList.remove('fog-hidden','fog-visible','fog-frontier');
      if(id===cur)n.classList.add('fog-visible');
      else if(discovered.has(id))n.classList.add(frontier.has(id)?'fog-frontier':'fog-visible');
      else n.classList.add('fog-hidden');
    });
    const visibleEdges=allVisibleEdges();
    qa('.line').forEach((l,i)=>{l.classList.remove('fog-hidden-line','fog-visible-line','fog-frontier-line');const pair=edgeList[i];if(pair&&visibleEdges.has(edgeKey(pair[0],pair[1])))l.classList.add('fog-visible-line');else l.classList.add('fog-hidden-line')});
  }
  function addToggle(){
    if(q('#fogToggle'))return;
    const top=q('.top'); if(!top)return;
    const wrap=document.createElement('div');
    wrap.innerHTML='<button id="fogToggle" class="fog-toggle" type="button">Fog: On</button><div class="fog-note">Ping each gateway IP to reveal the next section.</div>';
    top.appendChild(wrap);
    q('#fogToggle').onclick=()=>{active=!active;q('#fogToggle').textContent='Fog: '+(active?'On':'Off');classify()};
  }
  function interceptTerminal(){
    const form=q('#terminal'), input=q('#cmd'); if(!form||!input)return;
    form.addEventListener('submit',function(e){
      const raw=input.value;
      if(handleCommand(raw)){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();input.value='';}
      setTimeout(classify,100);
    },true);
  }
  function init(){addToggle();classify();interceptTerminal();document.addEventListener('click',()=>setTimeout(classify,80),true);document.addEventListener('submit',()=>setTimeout(classify,500),true);setInterval(classify,800);setLog('Patch: Fog is active. Start with ipconfig, then ping 10.10.5.1 to reveal the LAN.');}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();