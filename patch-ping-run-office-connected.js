(function(){
  const graph = {
    'START':['SWITCH-01','RECEPTION-PC','LOBBY-AP'],
    'RECEPTION-PC':['START','FRONT-PRN','KIOSK-01','SWITCH-01'],
    'FRONT-PRN':['RECEPTION-PC'],
    'KIOSK-01':['RECEPTION-PC','LOBBY-AP'],
    'LOBBY-AP':['START','KIOSK-01','GUEST-PC'],
    'SWITCH-01':['START','SALES-PC01','SALES-PC02','SALES-PRN','GUEST-PC','ROUTER-A'],
    'SALES-PC01':['SWITCH-01','SALES-LAPTOP'],
    'SALES-PC02':['SWITCH-01','SALES-PRN'],
    'SALES-LAPTOP':['SALES-PC01','SALES-PHONE'],
    'SALES-PRN':['SALES-PC02','SWITCH-01'],
    'SALES-PHONE':['SALES-LAPTOP'],
    'GUEST-PC':['SWITCH-01','LOBBY-AP'],
    'ROUTER-A':['SWITCH-01','CORE-02','WEB-DMZ','ARCHIVE','DNS01','DHCP01'],
    'DNS01':['ROUTER-A','PATCH-SRV'],
    'DHCP01':['ROUTER-A','PATCH-SRV'],
    'PATCH-SRV':['DNS01','DHCP01','MONITOR01'],
    'WEB-DMZ':['ROUTER-A','CAM-02'],
    'ARCHIVE':['ROUTER-A','OLD-NAS'],
    'CAM-01':['CORE-02'],
    'CAM-02':['WEB-DMZ','CORE-02'],
    'OLD-NAS':['ARCHIVE'],
    'CORE-02':['ROUTER-A','FILESERV','PACKET-LOSS','FIREWALL','ACC-PC01','WAREHOUSE-PC','MONITOR01','CAM-01','CAM-02'],
    'MONITOR01':['CORE-02','PATCH-SRV','AP-STAFF'],
    'AP-STAFF':['MONITOR01','PICKER-TAB'],
    'ACC-PC01':['CORE-02','ACC-PC02','PAYROLL-PC','ACC-PRN'],
    'ACC-PC02':['ACC-PC01','NAS-ACCOUNTS'],
    'PAYROLL-PC':['ACC-PC01','NAS-ACCOUNTS'],
    'ACC-PRN':['ACC-PC01'],
    'NAS-ACCOUNTS':['ACC-PC02','PAYROLL-PC','BACKUP-NAS'],
    'WAREHOUSE-PC':['CORE-02','SCANNER-01','LABEL-PRN'],
    'SCANNER-01':['WAREHOUSE-PC','PICKER-TAB'],
    'LABEL-PRN':['WAREHOUSE-PC'],
    'PICKER-TAB':['SCANNER-01','AP-STAFF'],
    'PACKET-LOSS':['CORE-02','FIREWALL'],
    'FIREWALL':['CORE-02','PACKET-LOSS','VAULT-GATE'],
    'FILESERV':['CORE-02','BACKUP-NAS','VAULT-GATE'],
    'BACKUP-NAS':['FILESERV','NAS-ACCOUNTS'],
    'VAULT-GATE':['FILESERV','FIREWALL','DOOR-CTRL'],
    'DOOR-CTRL':['VAULT-GATE','THERMO-01'],
    'THERMO-01':['DOOR-CTRL'],
    'PRINTER':['SWITCH-01']
  };
  const office = [
    ['SALES-PC01','PC','sales',11,15],['SALES-PC02','PC','sales',15,24],['SALES-LAPTOP','LT','sales',8,33],['SALES-PRN','PRN','sales',18,40],['SALES-PHONE','PH','sales',6,23],
    ['ACC-PC01','PC','accounts',72,15],['ACC-PC02','PC','accounts',78,24],['PAYROLL-PC','PAY','accounts',82,34],['NAS-ACCOUNTS','NAS','accounts',74,40],['ACC-PRN','PRN','accounts',88,18],
    ['RECEPTION-PC','PC','reception',7,62],['FRONT-PRN','PRN','reception',16,66],['LOBBY-AP','AP','reception',11,76],['KIOSK-01','KSK','reception',22,76],
    ['WAREHOUSE-PC','PC','warehouse',76,63],['SCANNER-01','SCAN','warehouse',84,70],['LABEL-PRN','PRN','warehouse',70,77],['PICKER-TAB','TAB','warehouse',88,80],
    ['DNS01','DNS','infra',44,22],['DHCP01','DHCP','infra',52,22],['MONITOR01','MON','infra',48,76],['AP-STAFF','AP','infra',56,76],['PATCH-SRV','SRV','infra',47,13],
    ['CAM-01','CAM','iot',27,10],['CAM-02','CAM','iot',64,10],['DOOR-CTRL','DOOR','iot',31,84],['OLD-NAS','NAS','iot',61,84],['THERMO-01','SEN','iot',36,9]
  ];
  let current = 'START';
  let hops = 0;
  let busy = false;
  function q(s){ return document.querySelector(s); }
  function qa(s){ return Array.from(document.querySelectorAll(s)); }
  function nodeEl(id){ return document.querySelector('[data-node="'+id+'"]'); }
  function addOfficeNodes(){
    const map = q('#pprMap');
    if(!map || map.querySelector('[data-office-connected="1"]')) return;
    office.forEach(function(item){
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
    drawConnectionLines();
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
        line.setAttribute('class', key.indexOf('FILESERV')>=0 || key.indexOf('CORE-02')>=0 ? 'ppr-office-line ppr-office-line-core' : 'ppr-office-line');
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
    if(!(graph[current]||[]).includes(id)){ setConsole('Patch: That device is on the office map, but it is not a direct hop from here.'); return; }
    current = id; hops += 1; update();
    if(id === 'FILESERV') { setConsole('Patch: FILESERV reached. Golden Egg unlocked.'); setTimeout(function(){ q('#pprReward').hidden=false; },350); return; }
    const degree = (graph[id]||[]).length;
    setConsole('Patch: Reached '+id+'. '+degree+' connected path'+(degree===1?'':'s')+' available. Find the route to FILESERV.');
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
    addOfficeNodes();
    addConnectionLines();
    interceptClicks();
    update();
    setConsole('Patch: Office network expanded. Every visible device is now connected. Hop carefully to FILESERV.');
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init, {once:true}); else init();
})();