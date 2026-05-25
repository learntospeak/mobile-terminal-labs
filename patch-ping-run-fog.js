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
  const discovered=new Set(['YOUR-PC']);
  let active=true;
  function q(s){return document.querySelector(s)}
  function qa(s){return Array.from(document.querySelectorAll(s))}
  function currentId(){const n=q('.node.current');return n?n.dataset.id:'YOUR-PC'}
  function revealAround(id){discovered.add(id);(graph[id]||[]).forEach(n=>discovered.add(n))}
  function edgeKey(a,b){return [a,b].sort().join('|')}
  function allVisibleEdges(){const set=new Set();Object.keys(graph).forEach(a=>(graph[a]||[]).forEach(b=>{if(discovered.has(a)&&discovered.has(b))set.add(edgeKey(a,b))}));return set}
  function classify(){
    const map=q('#map'); if(!map)return;
    map.classList.toggle('fog-active',active);
    if(!active){qa('.node').forEach(n=>n.classList.remove('fog-hidden','fog-visible','fog-frontier'));qa('.line').forEach(l=>l.classList.remove('fog-hidden-line','fog-visible-line','fog-frontier-line'));return;}
    const cur=currentId();revealAround(cur);
    const frontier=new Set(graph[cur]||[]);
    qa('.node').forEach(n=>{
      const id=n.dataset.id;
      n.classList.remove('fog-hidden','fog-visible','fog-frontier');
      if(id===cur||discovered.has(id))n.classList.add(frontier.has(id)&&id!==cur?'fog-frontier':'fog-visible');
      else n.classList.add('fog-hidden');
    });
    const visibleEdges=allVisibleEdges();
    const lines=qa('.line');
    const edges=[['YOUR-PC','ACCESS-SW'],['ACCESS-SW','ROUTER-A'],['ROUTER-A','CORE-SW'],['CORE-SW','FIREWALL'],['FIREWALL','VAULT-GATE'],['VAULT-GATE','FILESERV'],['ACCESS-SW','SALES-01'],['ACCESS-SW','SALES-02'],['ACCESS-SW','SALES-PRN'],['ACCESS-SW','RECEPTION'],['ACCESS-SW','LOBBY-AP'],['LOBBY-AP','KIOSK'],['ROUTER-A','DNS01'],['ROUTER-A','DHCP01'],['ROUTER-A','WEB-DMZ'],['ROUTER-A','ARCHIVE'],['CORE-SW','ACCOUNTS-PC'],['ACCOUNTS-PC','NAS-ACCOUNTS'],['NAS-ACCOUNTS','PAYROLL'],['NAS-ACCOUNTS','BACKUP-NAS'],['CORE-SW','WAREHOUSE-PC'],['WAREHOUSE-PC','SCANNER'],['SCANNER','LABEL-PRN'],['CORE-SW','PACKET-LOSS'],['PACKET-LOSS','MONITOR01'],['VAULT-GATE','DOOR-CTRL']];
    lines.forEach((l,i)=>{l.classList.remove('fog-hidden-line','fog-visible-line','fog-frontier-line');const pair=edges[i];if(!pair){l.classList.add('fog-hidden-line');return}const key=edgeKey(pair[0],pair[1]);if(visibleEdges.has(key))l.classList.add('fog-visible-line');else l.classList.add('fog-hidden-line')});
  }
  function addToggle(){
    if(q('#fogToggle'))return;
    const top=q('.top'); if(!top)return;
    const wrap=document.createElement('div');
    wrap.innerHTML='<button id="fogToggle" class="fog-toggle" type="button">Fog: On</button><div class="fog-note">Nearby branches reveal as the worm moves.</div>';
    top.appendChild(wrap);
    q('#fogToggle').onclick=()=>{active=!active;q('#fogToggle').textContent='Fog: '+(active?'On':'Off');classify()};
  }
  function init(){addToggle();revealAround('YOUR-PC');classify();document.addEventListener('click',()=>setTimeout(classify,80),true);document.addEventListener('submit',()=>setTimeout(classify,500),true);setInterval(classify,800)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();