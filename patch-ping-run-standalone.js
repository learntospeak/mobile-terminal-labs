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
  const iconMap = {
    'START':'💻','SWITCH-01':'▤','ROUTER-A':'◉','CORE-02':'◎','FILESERV':'🗄️','PRINTER':'🖨️','GUEST-PC':'💻','WEB-DMZ':'🌐','ARCHIVE':'▣','PACKET-LOSS':'☁️','FIREWALL':'🛡️','BACKUP-NAS':'▦','VAULT-GATE':'◆'
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
  let busy = false;

  function q(sel){ return document.querySelector(sel); }
  function qa(sel){ return Array.from(document.querySelectorAll(sel)); }
  function nodeEl(id){ return document.querySelector('[data-node="'+id+'"]'); }
  function sleep(ms){ return new Promise(resolve => setTimeout(resolve, ms)); }

  function decorateNodes(){
    qa('.ppr-node').forEach(btn => {
      if(btn.querySelector('.ppr-node-icon')) return;
      const id = btn.dataset.node;
      const icon = document.createElement('strong');
      icon.className = 'ppr-node-icon';
      icon.textContent = iconMap[id] || '□';
      btn.prepend(icon);
    });
  }

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
  function appendTerminal(text){
    const out = q('#pprTerminalOut');
    if(!out) return;
    out.textContent += (out.textContent ? '\n' : '') + text;
    out.scrollTop = out.scrollHeight;
  }

  function update(){
    q('#pprStatusPill').textContent = 'Hops: ' + hops;
    qa('.ppr-node').forEach(btn => {
      btn.classList.remove('ppr-node-current','ppr-node-available','ppr-node-hit');
      if(btn.dataset.node === current) btn.classList.add('ppr-node-current');
      if((links[current] || []).includes(btn.dataset.node)) btn.classList.add('ppr-node-available');
    });
    moveWormTo(current);
  }

  function arrive(id){
    current = id;
    hops += 1;
    update();
  }

  async function travel(path, terminalLines){
    if(busy) return;
    busy = true;
    for(const id of path.slice(1)){
      arrive(id);
      appendTerminal(terminalLines.shift() || ('  hop -> ' + id));
      await sleep(420);
    }
    busy = false;
    if(current === 'FILESERV'){
      setConsole('Patch: Target reached. Packet delivered to FILESERV. Golden Egg unlocked.');
      setTimeout(() => { q('#pprReward').hidden = false; }, 350);
    }
  }

  function choose(id){
    if(busy || id === current) return;
    const available = links[current] || [];
    if(!available.includes(id)){
      setConsole('Patch: The packet cannot jump there directly. Follow a connected route.');
      return;
    }
    arrive(id);
    if(id === 'FILESERV'){
      setConsole('Patch: Target reached. Packet delivered to FILESERV. Golden Egg unlocked.');
      setTimeout(() => { q('#pprReward').hidden = false; }, 400);
      return;
    }
    setConsole(messages[id] || 'Patch: Keep going. Find the cleanest route to FILESERV.');
  }

  function restart(){
    current = 'START';
    hops = 0;
    busy = false;
    q('#pprReward').hidden = true;
    const out = q('#pprTerminalOut');
    if(out) out.textContent = 'Mini terminal ready. Try: ipconfig, arp -a, route print, tracert fileserver, ping fileserver';
    setConsole('Patch: Tap SWITCH-01, or type a command below.');
    update();
  }

  function hint(){
    const next = route[route.indexOf(current)+1];
    if(next) setConsole('Patch hint: From ' + current + ', try ' + next + ', or type tracert fileserver.');
    else setConsole('Patch hint: You are at the target. Claim the Golden Egg.');
  }

  function ensureMiniTerminal(){
    if(q('#pprMiniTerminal')) return;
    const consoleBox = q('#pprConsole');
    const box = document.createElement('section');
    box.id = 'pprMiniTerminal';
    box.className = 'ppr-mini-terminal';
    box.innerHTML = '<p class="ppr-kicker">Terminal Mode</p><pre id="pprTerminalOut">Mini terminal ready. Try: ipconfig, arp -a, route print, tracert fileserver, ping fileserver</pre><form id="pprTerminalForm"><label for="pprTerminalInput">C:\\Lab&gt;</label><input id="pprTerminalInput" autocomplete="off" spellcheck="false"><button type="submit">Run</button></form>';
    consoleBox.insertAdjacentElement('afterend', box);
    q('#pprTerminalForm').addEventListener('submit', event => {
      event.preventDefault();
      runCommand(q('#pprTerminalInput').value);
      q('#pprTerminalInput').value = '';
    });
  }

  function normalizeCommand(raw){ return String(raw || '').trim().toLowerCase().replace(/\s+/g,' '); }

  async function runCommand(raw){
    const cmd = normalizeCommand(raw);
    if(!cmd) return;
    appendTerminal('C:\\Lab> ' + raw);
    if(cmd === 'ipconfig'){
      current = 'START'; hops += 1; update();
      appendTerminal('IPv4 Address . . . . . . . . . : 10.10.5.23\nDefault Gateway . . . . . . . : 10.10.5.1\nPatch: You are at START on the LAN.');
      setConsole('Patch: START is your workstation. Next useful clue: arp -a or tracert fileserver.');
      return;
    }
    if(cmd === 'arp -a' || cmd === 'arp /a'){
      current = 'SWITCH-01'; hops += 1; update();
      appendTerminal('10.10.5.1        SWITCH-01\n10.10.5.44       PRINTER\n10.10.5.88       GUEST-PC');
      setConsole('Patch: ARP shows local neighbours. SWITCH-01 is the useful first hop.');
      return;
    }
    if(cmd === 'route print'){
      await travel(['START','SWITCH-01','ROUTER-A'], ['Route table lookup...', '0.0.0.0/0 -> ROUTER-A']);
      appendTerminal('Best route to server subnet points through ROUTER-A, then CORE-02.');
      setConsole('Patch: Route print gives the direction, but you still need to prove the target.');
      return;
    }
    if(cmd === 'tracert fileserver' || cmd === 'tracert fileserv'){
      await travel(route, ['1  SWITCH-01  <1 ms','2  ROUTER-A   2 ms','3  CORE-02    4 ms','4  FILESERV   5 ms']);
      return;
    }
    if(cmd === 'ping fileserver' || cmd === 'ping fileserv'){
      await travel(route, ['Pinging FILESERV [10.20.7.15]...','Reply from 10.20.7.15: bytes=32 time=5ms TTL=61','Reply from 10.20.7.15: bytes=32 time=5ms TTL=61','Ping statistics: 0% loss']);
      return;
    }
    const pingMatch = cmd.match(/^ping\s+(.+)$/);
    if(pingMatch){
      const target = pingMatch[1].replace(/\s+/g,'-').toUpperCase();
      const known = {'PRINTER':'PRINTER','GUEST-PC':'GUEST-PC','WEB-DMZ':'WEB-DMZ','ARCHIVE':'ARCHIVE','BACKUP-NAS':'BACKUP-NAS','FIREWALL':'FIREWALL'}[target];
      if(known){
        const path = known === 'PRINTER' || known === 'GUEST-PC' ? ['START','SWITCH-01',known] : known === 'WEB-DMZ' || known === 'ARCHIVE' ? ['START','SWITCH-01','ROUTER-A',known] : ['START','SWITCH-01','ROUTER-A','CORE-02','FILESERV',known];
        await travel(path, path.slice(1).map(n => 'hop -> ' + n));
        appendTerminal('Ping result: reached ' + known + ', but that is not the objective.');
        setConsole(messages[known] || 'Patch: That target is not FILESERV.');
        return;
      }
    }
    appendTerminal('Unknown mini-game command. Try: ipconfig, arp -a, route print, tracert fileserver, ping fileserver');
    setConsole('Patch: Try a network diagnostic command.');
  }

  function init(){
    decorateNodes();
    ensureMiniTerminal();
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