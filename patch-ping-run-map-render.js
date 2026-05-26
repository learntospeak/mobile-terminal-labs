(function(){
  const nodes={
    'YOUR-PC':[5,48,'💻','client','start'],
    'ACCESS-SW':[19,48,'▤','core','switch'],
    'ROUTER-A':[33,48,'◉','core','router'],
    'CORE-SW':[47,48,'◎','core','core'],
    'FIREWALL':[61,48,'🛡','security','secure hop'],
    'VAULT-GATE':[75,48,'◆','security','secure branch'],
    'FILESERV':[90,48,'🗄','target','target'],
    'SALES-01':[5,14,'💻','client','sales'],
    'SALES-02':[5,24,'💻','client','sales'],
    'SALES-PRN':[5,34,'🖨','printer','sales printer'],
    'RECEPTION':[5,64,'💻','client','front desk'],
    'LOBBY-AP':[5,74,'📡','wireless','wifi'],
    'KIOSK':[5,84,'▣','decoy','kiosk'],
    'DNS01':[33,18,'🗄','server','dns'],
    'DHCP01':[33,30,'🗄','server','dhcp'],
    'WEB-DMZ':[47,18,'🌐','decoy','dmz'],
    'ARCHIVE':[47,30,'▣','decoy','archive'],
    'ACCOUNTS-PC':[61,18,'💻','client','accounts'],
    'NAS-ACCOUNTS':[75,18,'▦','storage','accounts nas'],
    'PAYROLL':[90,18,'💻','client','payroll'],
    'WAREHOUSE-PC':[61,78,'💻','client','warehouse'],
    'SCANNER':[75,78,'▤','decoy','scanner'],
    'LABEL-PRN':[90,78,'🖨','printer','label printer'],
    'BACKUP-NAS':[90,34,'▦','storage','wrong server'],
    'MONITOR01':[75,64,'▣','decoy','monitor'],
    'PACKET-LOSS':[61,64,'☁','decoy','unstable'],
    'DOOR-CTRL':[90,64,'▣','security','door']
  };

  const edges=[
    ['YOUR-PC','ACCESS-SW'],['ACCESS-SW','ROUTER-A'],['ROUTER-A','CORE-SW'],['CORE-SW','FIREWALL'],['FIREWALL','VAULT-GATE'],['VAULT-GATE','FILESERV'],
    ['ACCESS-SW','SALES-01'],['ACCESS-SW','SALES-02'],['ACCESS-SW','SALES-PRN'],['ACCESS-SW','RECEPTION'],['ACCESS-SW','LOBBY-AP'],['LOBBY-AP','KIOSK'],
    ['ROUTER-A','DNS01'],['ROUTER-A','DHCP01'],['ROUTER-A','WEB-DMZ'],['ROUTER-A','ARCHIVE'],
    ['CORE-SW','ACCOUNTS-PC'],['ACCOUNTS-PC','NAS-ACCOUNTS'],['NAS-ACCOUNTS','PAYROLL'],['NAS-ACCOUNTS','BACKUP-NAS'],
    ['CORE-SW','WAREHOUSE-PC'],['WAREHOUSE-PC','SCANNER'],['SCANNER','LABEL-PRN'],['CORE-SW','PACKET-LOSS'],['PACKET-LOSS','MONITOR01'],['VAULT-GATE','DOOR-CTRL']
  ];

  const graph={};
  edges.forEach(([a,b])=>{(graph[a]||(graph[a]=[])).push(b);(graph[b]||(graph[b]=[])).push(a)});

  let current='YOUR-PC';
  let hops=0;
  let busy=false;
  const $=selector=>document.querySelector(selector);

  function center(id){
    const map=$('#map');
    const el=document.querySelector('[data-id="'+id+'"]');
    if(!map||!el)return {x:0,y:0};
    const mr=map.getBoundingClientRect();
    const er=el.getBoundingClientRect();
    return {x:er.left-mr.left+er.width/2,y:er.top-mr.top+er.height/2};
  }

  function draw(){
    const svg=$('#lines');
    const map=$('#map');
    if(!svg||!map)return;
    const mr=map.getBoundingClientRect();
    svg.setAttribute('viewBox','0 0 '+mr.width+' '+mr.height);
    svg.innerHTML='';
    edges.forEach(([a,b])=>{
      const A=center(a);
      const B=center(b);
      const mid=(A.x+B.x)/2;
      const p=document.createElementNS('http://www.w3.org/2000/svg','path');
      p.setAttribute('d','M '+A.x+' '+A.y+' L '+mid+' '+A.y+' L '+mid+' '+B.y+' L '+B.x+' '+B.y);
      p.setAttribute('class','line');
      svg.appendChild(p);
    });
  }

  function update(){
    document.querySelectorAll('.node').forEach(n=>{
      n.classList.toggle('current',n.dataset.id===current);
      n.classList.toggle('available',(graph[current]||[]).includes(n.dataset.id));
    });
    const hopsEl=$('#hops');
    if(hopsEl)hopsEl.textContent=hops;
    const c=center(current);
    const w=$('#worm');
    if(w){
      w.style.left=(c.x-w.offsetWidth/2)+'px';
      w.style.top=(c.y-45)+'px';
    }
  }

  function log(text){
    const logEl=$('#log');
    if(logEl)logEl.textContent=text;
  }

  function move(id){
    if(busy||id===current)return;
    if(!(graph[current]||[]).includes(id)){
      log('Patch: No direct link to '+id+'. Follow the tree lines.');
      return;
    }
    current=id;
    hops++;
    update();
    if(id==='FILESERV'){
      log('Patch: FILESERV reached. Golden Egg unlocked.');
      setTimeout(()=>{const reward=$('#reward');if(reward)reward.hidden=false;},300);
    }else{
      log('Patch: Reached '+id+'. Choose the next connected hop.');
    }
  }

  function reset(){
    current='YOUR-PC';
    hops=0;
    const reward=$('#reward');
    if(reward)reward.hidden=true;
    log('Patch: Start at YOUR-PC. Follow the office tree to FILESERV.');
    update();
  }

  async function travel(path){
    busy=true;
    for(const id of path.slice(1)){
      current=id;
      hops++;
      update();
      log('Patch: hop -> '+id);
      await new Promise(resolve=>setTimeout(resolve,360));
    }
    busy=false;
    if(current==='FILESERV'){
      log('Patch: FILESERV reached. Golden Egg unlocked.');
      setTimeout(()=>{const reward=$('#reward');if(reward)reward.hidden=false;},300);
    }
  }

  function render(){
    const holder=$('#nodes');
    if(!holder)return;
    holder.innerHTML='';
    Object.entries(nodes).forEach(([id,n])=>{
      const button=document.createElement('button');
      button.type='button';
      button.className='node '+n[3];
      button.dataset.id=id;
      button.style.left=n[0]+'%';
      button.style.top=n[1]+'%';
      button.innerHTML='<strong>'+n[2]+'</strong>'+id+'<small>'+n[4]+'</small>';
      button.onclick=()=>move(id);
      holder.appendChild(button);
    });
    draw();
    update();
  }

  function wireTerminal(){
    const terminal=$('#terminal');
    const input=$('#cmd');
    if(!terminal||!input)return;
    terminal.onsubmit=event=>{
      event.preventDefault();
      const cmd=input.value.trim().toLowerCase();
      input.value='';
      if(cmd==='tracert fileserver'||cmd==='ping fileserver')travel(['YOUR-PC','ACCESS-SW','ROUTER-A','CORE-SW','FIREWALL','VAULT-GATE','FILESERV']);
      else if(cmd==='route print')travel(['YOUR-PC','ACCESS-SW','ROUTER-A','CORE-SW']);
      else if(cmd==='arp -a')travel(['YOUR-PC','ACCESS-SW']);
      else log('Try: arp -a, route print, tracert fileserver, ping fileserver');
    };
  }

  function init(){
    render();
    wireTerminal();
    const again=$('#again');
    if(again)again.onclick=reset;
    window.addEventListener('resize',()=>{draw();update();});
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',init,{once:true});
  }else{
    init();
  }
})();