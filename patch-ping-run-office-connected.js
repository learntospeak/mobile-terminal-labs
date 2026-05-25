(function(){
  const graph = {
    'START':['SWITCH-01'],
    'SWITCH-01':['START','RECEPTION-PC','SALES-PC01','GUEST-PC','ROUTER-A'],
    'RECEPTION-PC':['SWITCH-01','FRONT-PRN','LOBBY-AP','KIOSK-01'],
    'FRONT-PRN':['RECEPTION-PC'],
    'LOBBY-AP':['RECEPTION-PC'],
    'KIOSK-01':['RECEPTION-PC'],
    'SALES-PC01':['SWITCH-01','SALES-PC02','SALES-LAPTOP','SALES-PRN'],
    'SALES-PC02':['SALES-PC01'],
    'SALES-LAPTOP':['SALES-PC01','SALES-PHONE'],
    'SALES-PHONE':['SALES-LAPTOP'],
    'SALES-PRN':['SALES-PC01'],
    'GUEST-PC':['SWITCH-01'],
    'ROUTER-A':['SWITCH-01','DNS01','DHCP01','WEB-DMZ','ARCHIVE','CORE-02'],
    'DNS01':['ROUTER-A','PATCH-SRV'],
    'DHCP01':['ROUTER-A'],
    'PATCH-SRV':['DNS01'],
    'WEB-DMZ':['ROUTER-A','CAM-02'],
    'CAM-02':['WEB-DMZ'],
    'ARCHIVE':['ROUTER-A','OLD-NAS'],
    'OLD-NAS':['ARCHIVE'],
    'CORE-02':['ROUTER-A','ACC-PC01','WAREHOUSE-PC','MONITOR01','FIREWALL'],
    'ACC-PC01':['CORE-02','ACC-PC02','PAYROLL-PC','ACC-PRN'],
    'ACC-PC02':['ACC-PC01','NAS-ACCOUNTS'],
    'PAYROLL-PC':['ACC-PC01'],
    'ACC-PRN':['ACC-PC01'],
    'NAS-ACCOUNTS':['ACC-PC02','BACKUP-NAS'],
    'WAREHOUSE-PC':['CORE-02','SCANNER-01','LABEL-PRN','PICKER-TAB'],
    'SCANNER-01':['WAREHOUSE-PC'],
    'LABEL-PRN':['WAREHOUSE-PC'],
    'PICKER-TAB':['WAREHOUSE-PC','AP-STAFF'],
    'AP-STAFF':['PICKER-TAB'],
    'MONITOR01':['CORE-02','CAM-01'],
    'CAM-01':['MONITOR01'],
    'FIREWALL':['CORE-02','PACKET-LOSS','VAULT-GATE'],
    'PACKET-LOSS':['FIREWALL'],
    'VAULT-GATE':['FIREWALL','DOOR-CTRL','FILESERV'],
    'DOOR-CTRL':['VAULT-GATE','THERMO-01'],
    'THERMO-01':['DOOR-CTRL'],
    'FILESERV':['VAULT-GATE','BACKUP-NAS'],
    'BACKUP-NAS':['FILESERV','NAS-ACCOUNTS'],
    'PRINTER':['SWITCH-01']
  };
  const office = [
    ['RECEPTION-PC','PC','reception',8,28],['FRONT-PRN','PRN','reception',3,14],['LOBBY-AP','AP','reception',10,14],['KIOSK-01','KSK','reception',17,14],
    ['SALES-PC01','PC','sales',18,40],['SALES-PC02','PC','sales',9,52],['SALES-LAPTOP','LT','sales',18,56],['SALES-PHONE','PH','sales',16,70],['SALES-PRN','PRN','sales',27,52],
    ['DNS01','DNS','infra',38,23],['DHCP01','DHCP','infra',47,23],['PATCH-SRV','SRV','infra',37,10],['WEB-DMZ','WEB','infra',55,23],['CAM-02','CAM','iot',59,10],['ARCHIVE','ARC','infra',63,23],['OLD-NAS','NAS','iot',68,10],
    ['ACC-PC01','PC','accounts',63,44],['ACC-PC02','PC','accounts',55,57],['PAYROLL-PC','PAY','accounts',64,61],['ACC-PRN','PRN','accounts',72,57],['NAS-ACCOUNTS','NAS','accounts',55,73],
    ['WAREHOUSE-PC','PC','warehouse',75,44],['SCANNER-01','SCAN','warehouse',70,57],['LABEL-PRN','PRN','warehouse',80,57],['PICKER-TAB','TAB','warehouse',88,57],['AP-STAFF','AP','infra',88,72],
    ['MONITOR01','MON','infra',44,56],['CAM-01','CAM','iot',40,70],['FIREWALL','FW','infra',48,75],['PACKET-LOSS','LOSS','infra',40,88],['VAULT-GATE','GATE','iot',64,82],['DOOR-CTRL','DOOR','iot',74,88],['THERMO-01','SEN','iot',84,88],
    ['BACKUP-NAS','NAS','accounts',83,73]
  ];
  let current = 'START';
  let hops = 0;
  let busy = false;
  function q(s){ return document.querySelector(s); }
  function qa(s){ return Array.from(document.querySelectorAll(s)); }
  function nodeEl(id){ return document.querySelector('[data-node="'+id+'"]'); }
  function setPos(id,left,top){ const n=nodeEl(id); if(n){ n.style.left=left+'%'; n.style.top=top+'%'; } }
  function layoutMainNodes(){ setPos('START',4,44); setPos('SWITCH-01',19,44); setPos('ROUTER-A',34,44); setPos('CORE-02',49,44); setPos('FILESERV',88,44); setPos('PRINTER',25,58); setPos('GUEST-PC',24,28); }
  function addOfficeNodes(){
    const map = q('#pprMap');
    if(!map || map.querySelector('[data-office-connected="1"]')) return;
    office.forEach(function(item){
      const existing = nodeEl(item[0]);
      if(existing){ existing.style.left=item[3]+'%'; existing.style.top=item[4]+'%'; existing.classList.add('ppr-office-node','ppr-office-node-'+item[2]); return; }
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'ppr-node ppr-office-node ppr-office-node-' + item[2];
      b.dataset.node = item[0];
      b.dataset.officeConnected = '1';
      b.style.left = item[3] + '%';
      b.style.top = item[4] + '%';
      b.innerHTML = '<strong class="ppr-node-icon">'+item[1]+'</strong>' + item[0] + '<span>office device</span>';
      map.appendChild(b);
    });
  }
  function addConnectionLines(){
    const map = q('#pprMap');
    if(!map || q('#pprOfficeLines')) return;
    const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.id = 'pprOfficeLines';
    svg.setAttribute('class','ppr-office-lines');
    map.insertBefore(svg, map.firstChild);
    setTimeout(drawConnectionLines, 60);
    window.addEventListener('resize', drawConnectionLines);
  }
  function centerOf(id){
    const map = q('#pprMap');
    const node = nodeEl(id);
    if(!map || !node) return null;
    const mr = map.getBoundingClientRect();
    const nr = node.getBoundingClientRect();
    return {x:nr.left-mr.left+nr.width/2,y:nr.top-mr.top+nr.height/2};
  }
  function drawConnectionLines(){
    const svg = q('#pprOfficeLines');
    const map = q('#pprMap');
    if(!svg || !map) return;
    const mr = map.getBoundingClientRect();
    svg.setAttribute('viewBox','0 0 '+mr.width+' '+mr.height);
    svg.innerHTML = '';
    const seen = new Set();
    Object.keys(graph).forEach(function(a){
      graph[a].forEach(function(b){
        const key = [a,b].sort().join('|');
        if(seen.has(key)) return;
        seen.add(key);
        const pa = centerOf(a), pb = centerOf(b);
        if(!pa || !pb) return;
        const line = document.createElementNS('http://www.w3.org/2000/svg','line');
        line.setAttribute('x1',pa.x); line.setAttribute('y1',pa.y); line.setAttribute('x2',pb.x); line.setAttribute('y2',pb.y);
        line.setAttribute('class','ppr-office-line');
        svg.appendChild(line);
      });
    });
  }
  function moveWormTo(id){
    const map = q('#pprMap'), worm = q('#pprWorm'), node = nodeEl(id);
    if(!map || !worm || !node) return;
    const mr = map.getBoundingClientRect(), nr = node.getBoundingClientRect();
    worm.style.left = Math.max(8, nr.left-mr.left+nr.width/2-worm.offsetWidth/2) + 'px';
    worm.style.top = Math.max(8, nr.top-mr.top-44) + 'px';
  }
  function setConsole(t){ const c=q('#pprConsole'); if(c)c.textContent=t; }
  function update(){
    const pill=q('#pprStatusPill'); if(pill)pill.textContent='Hops: '+hops;
    qa('.ppr-node').forEach(function(n){
      n.classList.remove('ppr-node-current','ppr-node-available');
      if(n.dataset.node===current) n.classList.add('ppr-node-current');
      if((graph[current]||[]).includes(n.dataset.node)) n.classList.add('ppr-node-available');
    });
    moveWormTo(current);
  }
  function choose(id){
    if(busy || id===current) return;
    if(!(graph[current]||[]).includes(id)){ setConsole('Patch: That device is visible, but it is not a direct hop from here. Follow the tree branches.'); return; }
    current = id; hops += 1; update();
    if(id === 'FILESERV') { setConsole('Patch: FILESERV reached through the secure vault path. Golden Egg unlocked.'); setTimeout(function(){ q('#pprReward').hidden=false; },350); return; }
    const degree = (graph[id]||[]).length;
    setConsole('Patch: Reached '+id+'. '+degree+' connected branch'+(degree===1?'':'es')+' available. Find the secure route to FILESERV.');
  }
  function interceptClicks(){
    document.addEventListener('click', function(e){
      const btn = e.target.closest && e.target.closest('.ppr-node');
      if(!btn) return;
      e.preventDefault(); e.stopPropagation(); if(e.stopImmediatePropagation)e.stopImmediatePropagation();
      choose(btn.dataset.node);
    }, true);
  }
  function init(){
    layoutMainNodes();
    addOfficeNodes();
    addConnectionLines();
    interceptClicks();
    update();
    setConsole('Patch: FILESERV is behind the secure branch now. No direct hop from CORE-02.');
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init, {once:true}); else init();
})();