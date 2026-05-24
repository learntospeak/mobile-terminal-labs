(function(){
  const CHECKS = [
    {
      id: 'egg-trigger',
      label: 'Easter egg trigger exists',
      detail: 'Hidden lab curiosity can launch the mini-game path.',
      test: () => Boolean(document.querySelector('[data-easter-egg-trigger]'))
    },
    {
      id: 'game-launcher',
      label: 'Patch Ping Run launcher exists',
      detail: 'Clicking the Easter egg should open a visible mini-game shell.',
      test: () => Boolean(document.querySelector('#patchPingRunGame,[data-mini-game="patch-ping-run"]'))
    },
    {
      id: 'one-round-objective',
      label: 'One-round objective exists',
      detail: 'Mini-game needs a clear target such as FILESERVER or an IP address.',
      test: () => Boolean(document.querySelector('[data-ping-target]'))
    },
    {
      id: 'multi-hop-route',
      label: 'Multi-hop route exists',
      detail: 'Game should not be one click. Target path should require at least 5 hops/nodes.',
      test: () => {
        const path = document.querySelector('[data-correct-route]')?.getAttribute('data-correct-route') || '';
        const nodes = document.querySelectorAll('[data-network-node]');
        return path.split('>').filter(Boolean).length >= 5 || nodes.length >= 6;
      }
    },
    {
      id: 'network-map',
      label: 'Network map renders',
      detail: 'Mini-game needs visible network nodes and connecting edges.',
      test: () => document.querySelectorAll('[data-network-node]').length >= 6 && document.querySelectorAll('[data-network-edge]').length >= 5
    },
    {
      id: 'next-hop-controls',
      label: 'Next-hop controls exist',
      detail: 'Player can move the packet/worm by tapping connected nodes.',
      test: () => document.querySelectorAll('[data-next-hop]').length >= 2
    },
    {
      id: 'packet-worm',
      label: 'Packet worm character exists',
      detail: 'Game should have a visible packet snake/worm avatar, not just static buttons.',
      test: () => Boolean(document.querySelector('[data-packet-worm],.packet-worm,.ping-worm'))
    },
    {
      id: 'correct-path-success',
      label: 'Correct path can succeed',
      detail: 'Smoke flow should be able to reach the correct target and mark ping success.',
      test: () => Boolean(document.querySelector('[data-ping-result="success"],[data-ping-success="true"]'))
    },
    {
      id: 'golden-egg-award',
      label: 'Golden Egg is awarded',
      detail: 'Successful run awards one Golden Egg.',
      test: () => Boolean(document.querySelector('[data-golden-egg-awarded="true"]')) || goldenEggCount() > 0
    },
    {
      id: 'no-duplicate-award',
      label: 'Duplicate award prevention exists',
      detail: 'Same Easter egg should not award unlimited eggs on replay.',
      test: () => Boolean(window.GoldenEggRewards?.awardOnce || window.NetlabGoldenEggRewards?.awardOnce || document.querySelector('[data-egg-award-once="true"]'))
    },
    {
      id: 'homepage-counter',
      label: 'Homepage egg counter exists',
      detail: 'Dashboard/homepage needs an egg counter or Golden Egg Vault stat.',
      test: () => Boolean(document.querySelector('[data-golden-egg-count],#goldenEggCounter,[data-egg-vault]'))
    },
    {
      id: 'premium-threshold',
      label: 'Premium theme threshold exists',
      detail: '10 Golden Eggs should unlock the premium theme.',
      test: () => Boolean(document.querySelector('[data-premium-theme-threshold="10"]')) || Number(window.GoldenEggRewards?.unlockAt || window.NetlabGoldenEggRewards?.unlockAt || 0) === 10
    },
    {
      id: 'premium-theme-unlock',
      label: 'Premium theme can activate at 10 eggs',
      detail: 'When 10 eggs are reached, the page can switch to the gold premium theme.',
      test: () => document.documentElement.getAttribute('data-theme') === 'gold-premium' || document.body.classList.contains('premium-theme-unlocked') || Boolean(document.querySelector('[data-premium-theme-unlocked="true"]'))
    }
  ];

  function goldenEggCount(){
    try {
      const raw = localStorage.getItem('netlab:golden-eggs');
      if (!raw) return 0;
      const parsed = JSON.parse(raw);
      return Number(parsed.total || (Array.isArray(parsed.earned) ? parsed.earned.length : 0) || 0);
    } catch(e) { return 0; }
  }

  function result(check){
    let ok = false;
    try { ok = Boolean(check.test()); } catch(e) { ok = false; }
    return { id: check.id, label: check.label, detail: check.detail, ok };
  }

  function render(){
    if (document.getElementById('eggSmokeCard')) return;
    const after = document.querySelector('#results')?.closest('.card') || document.querySelector('main');
    if (!after) return;

    const card = document.createElement('section');
    card.id = 'eggSmokeCard';
    card.className = 'card';
    card.innerHTML = [
      '<h2>Golden Egg / Patch Ping Run Smoke Test</h2>',
      '<p class="copy">Separate checklist for the hidden mini-game reward loop: trigger, multi-hop network map, packet worm, Golden Egg storage, homepage counter, and 10-egg premium theme unlock.</p>',
      '<div id="eggSmokeSummary" class="summary"><span class="pill">Ready</span></div>',
      '<div id="eggSmokeResults" class="grid"></div>'
    ].join('');
    after.insertAdjacentElement('afterend', card);
    run();
  }

  function run(){
    const rows = CHECKS.map(result);
    window.__NetlabEggSmokeRows = rows;
    const pass = rows.filter(r => r.ok).length;
    const fail = rows.length - pass;
    const summary = document.getElementById('eggSmokeSummary');
    const results = document.getElementById('eggSmokeResults');
    if (summary) summary.innerHTML = '<span class="pill ok">Complete: '+pass+'</span><span class="pill bad">Remaining: '+fail+'</span><span class="pill">Total: '+rows.length+'</span>';
    if (results) results.innerHTML = rows.map(r => '<div class="check '+(r.ok?'pass':'fail')+'"><div class="status">'+(r.ok?'PASS':'MISSING')+'</div><div><h3 class="stage-title">'+escapeHtml(r.label)+'</h3><div class="detail">'+escapeHtml(r.detail)+'</div></div></div>').join('');
    return rows;
  }

  function escapeHtml(value){
    return String(value || '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  window.NetlabEggSmoke = { run, checks: CHECKS };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(render, 900));
  else setTimeout(render, 900);
})();