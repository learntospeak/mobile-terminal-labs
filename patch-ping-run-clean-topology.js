(function(){
  const positions = {
    'SALES-PC01':[5,10],'SALES-PC02':[5,20],'SALES-LAPTOP':[5,30],'RECEPTION-PC':[5,40],'GUEST-PC':[5,50],'SALES-PRN':[5,60],'FRONT-PRN':[5,70],
    'START':[5,82],
    'SWITCH-01':[23,44],
    'ROUTER-A':[36,44],
    'WEB-DMZ':[50,20],'DNS01':[50,34],'CORE-02':[50,44],'DHCP01':[50,54],'ARCHIVE':[50,68],
    'PACKET-LOSS':[64,20],'FIREWALL':[64,34],'VAULT-GATE':[64,54],'BACKUP-NAS':[64,68],
    'FILESERV':[82,44],
    'ACC-PC01':[92,18],'NAS-ACCOUNTS':[92,30],'PATCH-SRV':[92,42],'WAREHOUSE-PC':[92,54],'MONITOR01':[92,66],'DOOR-CTRL':[92,78],
    'ACC-PC02':[78,12],'PAYROLL-PC':[78,24],'ACC-PRN':[78,72],'SCANNER-01':[78,84],
    'LABEL-PRN':[70,84],'PICKER-TAB':[70,74],'AP-STAFF':[70,64],'CAM-01':[70,14],'CAM-02':[70,24],'OLD-NAS':[70,34],'LOBBY-AP':[16,88],'KIOSK-01':[16,76],
    'PRINTER':[23,62],'THERMO-01':[92,88]
  };
  const cleanEdges = [
    ['SALES-PC01','SWITCH-01'],['SALES-PC02','SWITCH-01'],['SALES-LAPTOP','SWITCH-01'],['RECEPTION-PC','SWITCH-01'],['GUEST-PC','SWITCH-01'],['SALES-PRN','SWITCH-01'],['FRONT-PRN','SWITCH-01'],['START','SWITCH-01'],['LOBBY-AP','SWITCH-01'],['KIOSK-01','SWITCH-01'],['PRINTER','SWITCH-01'],
    ['SWITCH-01','ROUTER-A'],['ROUTER-A','WEB-DMZ'],['ROUTER-A','DNS01'],['ROUTER-A','CORE-02'],['ROUTER-A','DHCP01'],['ROUTER-A','ARCHIVE'],
    ['WEB-DMZ','PACKET-LOSS'],['DNS01','FIREWALL'],['CORE-02','FILESERV'],['DHCP01','VAULT-GATE'],['ARCHIVE','BACKUP-NAS'],
    ['PACKET-LOSS','ACC-PC01'],['FIREWALL','NAS-ACCOUNTS'],['FILESERV','PATCH-SRV'],['FILESERV','WAREHOUSE-PC'],['BACKUP-NAS','MONITOR01'],['VAULT-GATE','DOOR-CTRL'],
    ['ACC-PC01','ACC-PC02'],['NAS-ACCOUNTS','PAYROLL-PC'],['MONITOR01','ACC-PRN'],['WAREHOUSE-PC','SCANNER-01'],['SCANNER-01','LABEL-PRN'],['PICKER-TAB','AP-STAFF'],['CAM-01','CAM-02'],['OLD-NAS','ARCHIVE'],['DOOR-CTRL','THERMO-01']
  ];
  function q(s){return document.querySelector(s)}
  function node(id){return document.querySelector('[data-node="'+id+'"]')}
  function applyPositions(){
    Object.keys(positions).forEach(function(id){
      const el=node(id); if(!el) return;
      el.style.left=positions[id][0]+'%';
      el.style.top=positions[id][1]+'%';
    });
  }
  function center(id){
    const map=q('#pprMap'), el=node(id); if(!map||!el) return null;
    const mr=map.getBoundingClientRect(), er=el.getBoundingClientRect();
    return {x:er.left-mr.left+er.width/2,y:er.top-mr.top+er.height/2};
  }
  function draw(){
    const map=q('#pprMap'); if(!map) return;
    const old=q('#pprOfficeLines'); if(old) old.remove();
    let svg=q('#pprCleanLines');
    if(!svg){
      svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
      svg.id='pprCleanLines';
      svg.setAttribute('class','ppr-clean-lines');
      map.insertBefore(svg,map.firstChild);
    }
    const mr=map.getBoundingClientRect();
    svg.setAttribute('viewBox','0 0 '+mr.width+' '+mr.height);
    svg.innerHTML='';
    cleanEdges.forEach(function(pair){
      const a=center(pair[0]), b=center(pair[1]); if(!a||!b) return;
      const path=document.createElementNS('http://www.w3.org/2000/svg','path');
      const mid=(a.x+b.x)/2;
      const d='M '+a.x+' '+a.y+' L '+mid+' '+a.y+' L '+mid+' '+b.y+' L '+b.x+' '+b.y;
      path.setAttribute('d',d);
      const main = ['START|SWITCH-01','SWITCH-01|ROUTER-A','ROUTER-A|CORE-02','CORE-02|FILESERV'].includes(pair.join('|'));
      path.setAttribute('class', main ? 'ppr-clean-line ppr-clean-line-main' : 'ppr-clean-line');
      svg.appendChild(path);
    });
  }
  function installStyle(){
    if(q('#pprCleanTopologyStyle')) return;
    const style=document.createElement('style');
    style.id='pprCleanTopologyStyle';
    style.textContent='.ppr-map{min-height:980px!important}.ppr-clean-lines{position:absolute;inset:0;width:100%;height:100%;z-index:1;pointer-events:none}.ppr-clean-line{fill:none;stroke:rgba(248,113,113,.72);stroke-width:2;stroke-linecap:round;stroke-linejoin:round;filter:drop-shadow(0 0 4px rgba(248,113,113,.22))}.ppr-clean-line-main{stroke:rgba(103,232,249,.88);stroke-width:3;filter:drop-shadow(0 0 8px rgba(34,211,238,.44))}.ppr-office-line{display:none!important}.ppr-node,.ppr-worm{z-index:3}.ppr-node{width:92px!important;min-height:62px!important;font-size:9px!important}.ppr-node-icon{font-size:30px!important}.ppr-node-target .ppr-node-icon{font-size:34px!important}.ppr-zone{display:none!important}@media(max-width:850px){.ppr-map{min-height:1040px!important;min-width:980px!important}.ppr-node{width:76px!important;font-size:7px!important}.ppr-node-icon{font-size:22px!important}.ppr-node-target .ppr-node-icon{font-size:25px!important}}';
    document.head.appendChild(style);
  }
  function run(){installStyle();applyPositions();setTimeout(draw,80);setTimeout(draw,500)}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run,{once:true}); else run();
  window.addEventListener('resize',function(){applyPositions();draw()});
})();