(function(){
  const route = ['START','SWITCH-01','ROUTER-A','CORE-02','FILESERV'];
  const links = {
    'START':['SWITCH-01'],
    'SWITCH-01':['START','ROUTER-A','PRINTER','GUEST-PC'],
    'ROUTER-A':['SWITCH-01','CORE-02','WEB-DMZ','ARCHIVE'],
    'CORE-02':['ROUTER-A','FILESERV','PACKET-LOSS','FIREWALL'],
    'FILESERV':['CORE-02','BACKUP-NAS','VAULT-GATE'],
    'PRINTER':['SWITCH-01'],
    'GUEST-PC':['SWITCH-01'],
    'WEB-DMZ':['ROUTER-A'],
    'ARCHIVE':['ROUTER-A'],
    'PACKET-LOSS':['CORE-02'],
    'FIREWALL':['CORE-02'],
    'BACKUP-NAS':['FILESERV'],
    'VAULT-GATE':['FILESERV']
  };
  const messages = {
    'PRINTER':'Patch: That route reached the printer. It replies with paper jam energy. Try another branch.',
    'GUEST-PC':'Patch: Guest network. Wrong side of the building. Backtrack to SWITCH-01.',
    'WEB-DMZ':'Patch: DMZ web host. Interesting, but not the file server.',
    'ARCHIVE':'Patch: Archive route found. Old tickets live there, not this target.',
    'PACKET-LOSS':'Patch: Packet loss cloud. The worm looks dizzy. Try the cleaner route.',
    'FIREWALL':'Patch: Blocked by firewall policy. Good check, wrong path.',
    'BACKUP-NAS':'Patch: Backup storage is close, but the target is FILESERV.',
    'VAULT-GATE':'Patch: Secret branch detected. Save that idea for a later egg.'
  };
  let current = 'START';
  let hops = 0;

  function q(sel){ return document.querySelector(sel); }
  function qa(sel){ return Array.from(document.querySelectorAll(sel)); }

  function nodeEl(id){ return document.querySelector('[data-node="'+id+'"]'); }

  function moveWormTo(id){
    const map = q('#pprMap');
    const worm = q('#pprWorm');
    const node = nodeEl(id);
    if(!map || !worm || !node) return;
    const mapRect = map.getBoundingClientRect();
    const nodeRect = node.getBoundingClientRect();
    const left = nodeRect.left - mapRect.left + (nodeRect.width / 2) - (worm.offsetWidth / 2);
    const top = nodeRect.top - mapRect.top - 44;
    worm.style.left = Math.max(8, left) + 'px';
    worm.style.top = Math.max(8, top) + 'px';
  }

  function setConsole(text){ q('#pprConsole').textContent = text; }

  function update(){
    q('#pprStatusPill').textContent = 'Hops: ' + hops;
    qa('.ppr-node').forEach(btn => {
      btn.classList.remove('ppr-node-current','ppr-node-available','ppr-node-hit');
      if(btn.dataset.node === current) btn.classList.add('ppr-node-current');
      if((links[current] || []).includes(btn.dataset.node)) btn.classList.add('ppr-node-available');
      if(route.includes(btn.dataset.node)) btn.classList.add('ppr-node-hit');
    });
    moveWormTo(current);
  }

  function choose(id){
    if(id === current) return;
    const available = links[current] || [];
    if(!available.includes(id)){
      setConsole('Patch: The packet cannot jump there directly. Follow a connected route.');
      return;
    }
    current = id;
    hops += 1;
    if(id === 'FILESERV'){
      update();
      setConsole('Patch: Target reached. Packet delivered to FILESERV. Golden Egg unlocked.');
      setTimeout(() => { q('#pprReward').hidden = false; }, 400);
      return;
    }
    setConsole(messages[id] || 'Patch: Keep going. Find the cleanest route to FILESERV.');
    update();
  }

  function restart(){
    current = 'START';
    hops = 0;
    q('#pprReward').hidden = true;
    setConsole('Patch: Tap SWITCH-01 to start the run.');
    update();
  }

  function hint(){
    const next = route[route.indexOf(current)+1];
    if(next) setConsole('Patch hint: From ' + current + ', try ' + next + '.');
    else setConsole('Patch hint: You are at the target. Claim the Golden Egg.');
  }

  function init(){
    qa('.ppr-node').forEach(btn => btn.addEventListener('click', () => choose(btn.dataset.node)));
    q('#pprRestartBtn').addEventListener('click', restart);
    q('#pprHintBtn').addEventListener('click', hint);
    q('#pprPlayAgainBtn').addEventListener('click', restart);
    window.addEventListener('resize', () => moveWormTo(current));
    setTimeout(update, 100);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
