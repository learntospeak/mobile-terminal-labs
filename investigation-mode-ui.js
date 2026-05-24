(function(){
  function ready(fn){
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
    else fn();
  }

  function scenario(){
    var engine = window.ScenarioEngine;
    if(!engine || !Array.isArray(engine.scenarios)) return null;
    var direct = window.__NETLAB_DIRECT_SCENARIO_ID || new URLSearchParams(location.search).get('scenario') || '';
    return engine.scenarios.find(function(item){ return item && item.id === direct; }) || engine.scenarios.find(function(item){ return item && item.id === 'win-dir-incident-triage'; });
  }

  function findMount(){
    return document.querySelector('.terminal-panel') || document.querySelector('#terminalPanel') || document.querySelector('.terminal-layout') || document.body;
  }

  function render(){
    var s = scenario();
    if(!s || !s.investigation || !s.investigation.enabled) return false;
    if(s.id !== 'win-dir-incident-triage') return false;
    if(document.getElementById('investigationPanel')) return true;

    var panel = document.createElement('section');
    panel.id = 'investigationPanel';
    panel.className = 'investigation-panel';
    panel.setAttribute('data-investigation-panel', 'true');
    panel.setAttribute('data-investigation-surface', 'mobile desktop');
    panel.innerHTML = [
      '<p class="investigation-kicker">Investigation Mode</p>',
      '<h2 class="investigation-title">Choose your investigation intention first</h2>',
      '<p class="investigation-copy">Before running commands, decide what this ticket is asking you to prove.</p>',
      '<div class="investigation-intention-grid" data-intention-grid></div>',
      '<div id="patchFeedback" class="investigation-feedback patch-feedback" data-patch-feedback>Patch: Pick the investigation path that best matches the ticket.</div>'
    ].join('');

    var grid = panel.querySelector('[data-intention-grid]');
    (s.investigation.intentions || []).forEach(function(intent){
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'investigation-intention-btn intention-choice';
      btn.setAttribute('data-intention-choice', intent.id || intent.label || 'choice');
      btn.setAttribute('data-intention-kind', intent.best ? 'best' : 'distractor');
      btn.setAttribute('data-intention-best', intent.best ? 'true' : 'false');
      btn.innerHTML = '<span class="investigation-intention-label">' + escapeHtml(intent.label || 'Choose path') + '</span><span class="investigation-intention-note">' + escapeHtml(intent.best ? 'Best fit for this ticket' : 'Plausible, but probably not first') + '</span>';
      btn.addEventListener('click', function(){
        panel.setAttribute('data-selected-intention', intent.id || intent.label || 'choice');
        panel.querySelectorAll('[data-intention-active]').forEach(function(el){ el.removeAttribute('data-intention-active'); });
        btn.setAttribute('data-intention-active', 'true');
        var feedback = document.getElementById('patchFeedback');
        if(feedback) feedback.textContent = 'Patch: ' + (intent.explanation || (intent.best ? s.investigation.patchFeedback.correctIntention : s.investigation.patchFeedback.wrongButPlausible));
      });
      grid.appendChild(btn);
    });

    var mount = findMount();
    mount.insertBefore(panel, mount.firstChild);
    document.body.setAttribute('data-investigation-mode-active', 'true');
    return true;
  }

  function escapeHtml(value){
    return String(value || '').replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]; });
  }

  ready(function(){
    var tries = 0;
    var timer = setInterval(function(){
      tries += 1;
      if(render() || tries > 40) clearInterval(timer);
    }, 150);
  });
})();