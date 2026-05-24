(function(){
  function ready(fn){
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
    else fn();
  }

  function escapeHtml(value){
    return String(value || '').replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]; });
  }

  const ROUTE = ['START','SWITCH-01','ROUTER-A','CORE-01','FILESERVERS','FILESERVER'];
  const DISTRACTORS = ['PRINTER','OLD-SERVER','GUEST-PC','DEAD-END'];
  const ALL_NODES = ROUTE.concat(DISTRACTORS);
  const EDGES = [
    ['START','SWITCH-01'],
    ['SWITCH-01','ROUTER-A'],
    ['SWITCH-01','PRINTER'],
    ['ROUTER-A','CORE-01'],
    ['ROUTER-A','OLD-SERVER'],
    ['CORE-01','FILESERVERS'],
    ['CORE-01','GUEST-PC'],
    ['FILESERVERS','FILESERVER'],
    ['FILESERVERS','DEAD-END']
  ];

  function createGameShell(){
    let game = document.getElementById('patchPingRunGame');
    if(game) return game;

    const mount = document.getElementById('investigationPanel') || document.body;
    game = document.createElement('section');
    game.id = 'patchPingRunGame';
    game.className = 'evidence-question patch-ping-run-game';
    game.setAttribute('data-mini-game','patch-ping-run');
    game.setAttribute('data-correct-route', ROUTE.join('>'));
    game.innerHTML = [
      '<p class="investigation-kicker">Patch Ping Run</p>',
      '<h3 class="investigation-subtitle">Guide the packet worm to the correct host</h3>',
      '<p class="investigation-copy">Objective: ping <strong data-ping-target="FILESERVER">FILESERVER</strong>. Choose the next hop through the network. This first version creates the game shell and route map.</p>',
      '<div class="patch-ping-map" data-network-map>',
      '  <div class="packet-worm" data-packet-worm title="Packet worm">&gt;_•</div>',
      '  <div class="patch-ping-nodes" data-network-nodes></div>',
      '  <div class="patch-ping-edges" data-network-edges></div>',
      '</div>',
      '<div class="patch-ping-controls" data-next-hop-controls></div>',
      '<div class="evidence-explanation" data-ping-status>Patch: Mini-game shell ready. Route the packet from START to FILESERVER.</div>'
    ].join('');

    mount.appendChild(game);
    renderMap(game);
    renderControls(game, 'START');
    return game;
  }

  function renderMap(game){
    const nodes = game.querySelector('[data-network-nodes]');
    const edges = game.querySelector('[data-network-edges]');
    nodes.innerHTML = ALL_NODES.map(function(node){
      const type = node === 'FILESERVER' ? 'target' : ROUTE.includes(node) ? 'route' : 'decoy';
      return '<span class="patch-ping-node" data-network-node="'+escapeHtml(node)+'" data-node-type="'+type+'">'+escapeHtml(node)+'</span>';
    }).join('');
    edges.innerHTML = EDGES.map(function(edge){
      return '<span class="patch-ping-edge" data-network-edge="'+escapeHtml(edge[0]+'>'+edge[1])+'">'+escapeHtml(edge[0]+' → '+edge[1])+'</span>';
    }).join('');
  }

  function neighbours(node){
    return EDGES.filter(function(edge){ return edge[0] === node; }).map(function(edge){ return edge[1]; });
  }

  function renderControls(game, current){
    const controls = game.querySelector('[data-next-hop-controls]');
    const next = neighbours(current);
    game.setAttribute('data-current-node', current);
    controls.innerHTML = '<p class="investigation-copy">Current node: <span class="code">'+escapeHtml(current)+'</span></p>' + next.map(function(node){
      return '<button class="evidence-choice" type="button" data-next-hop="'+escapeHtml(node)+'">Next hop: <span class="code">'+escapeHtml(node)+'</span></button>';
    }).join('');
  }

  function bindTriggers(){
    document.addEventListener('click', function(event){
      const trigger = event.target.closest('[data-easter-egg-trigger]');
      if(!trigger) return;
      const game = createGameShell();
      game.removeAttribute('hidden');
      game.scrollIntoView({ block: 'start', behavior: 'smooth' });
    });
  }

  ready(bindTriggers);
  window.PatchPingRun = { createGameShell: createGameShell };
})();