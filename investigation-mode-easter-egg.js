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

  function escapeHtml(value){
    return String(value || '').replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]; });
  }

  function revealWhenEvidenceVisible(){
    var box = document.getElementById('investigationCuriosityPanel');
    if(!box) return;
    var evidenceVisible = document.querySelector('#evidenceQuestion:not([hidden]), [data-evidence-question]:not([hidden])');
    var evidenceAnswered = document.querySelector('[data-evidence-choice-selected], [data-evidence-result]');
    if(evidenceVisible || evidenceAnswered){
      box.hidden = false;
      box.setAttribute('data-curiosity-revealed', 'true');
    }
  }

  function render(){
    var s = scenario();
    if(!s || s.id !== 'win-dir-incident-triage' || !s.investigation) return false;
    var panel = document.getElementById('investigationPanel');
    if(!panel) return false;
    if(document.getElementById('investigationCuriosityPanel')) return true;

    var red = (s.investigation.redHerrings || [])[0] || { file: 'printer-note.txt', message: 'This note is real, but it belongs to a different ticket.' };
    var egg = (s.investigation.easterEggs || [])[0] || { file: 'old-game-note.txt', message: 'You found a hidden Patch note.', reward: 'future-command-snake-mini-game' };

    var box = document.createElement('section');
    box.id = 'investigationCuriosityPanel';
    box.className = 'evidence-question investigation-curiosity-panel';
    box.setAttribute('data-red-herring', red.id || 'red-herring');
    box.setAttribute('data-easter-egg', egg.id || 'easter-egg');
    box.hidden = true;
    box.innerHTML = [
      '<p class="investigation-kicker">Optional curiosity</p>',
      '<h3 class="investigation-subtitle">Red herrings and hidden finds</h3>',
      '<p class="investigation-copy">Optional files can teach you to separate useful evidence from noise. Some may eventually unlock tiny hidden challenges.</p>',
      '<div class="evidence-choice-grid">',
      '  <button class="evidence-choice" type="button" data-red-herring-trigger="true" data-curiosity-file="' + escapeHtml(red.file || 'printer-note.txt') + '">Read red herring: <span class="code">' + escapeHtml(red.file || 'printer-note.txt') + '</span></button>',
      '  <button class="evidence-choice" type="button" data-easter-egg-trigger="true" data-curiosity-file="' + escapeHtml(egg.file || 'old-game-note.txt') + '">Open hidden note: <span class="code">' + escapeHtml(egg.file || 'old-game-note.txt') + '</span></button>',
      '</div>',
      '<div id="easterEggReward" class="evidence-explanation" data-easter-egg-reward="true" data-secret-challenge="future-command-snake" data-mini-game-hook="command-snake" hidden></div>'
    ].join('');

    panel.appendChild(box);

    var reward = box.querySelector('[data-easter-egg-reward]');
    box.querySelector('[data-red-herring-trigger]').addEventListener('click', function(){
      reward.hidden = false;
      reward.setAttribute('data-curiosity-result', 'red-herring');
      reward.textContent = 'Patch: ' + (red.message || 'This is a real clue, but not the evidence this ticket needs.');
      var feedback = document.getElementById('patchFeedback');
      if(feedback) feedback.textContent = reward.textContent;
    });

    box.querySelector('[data-easter-egg-trigger]').addEventListener('click', function(){
      reward.hidden = false;
      reward.setAttribute('data-curiosity-result', 'easter-egg');
      reward.textContent = 'Patch: ' + (egg.message || 'You found a hidden Patch note.') + ' Reward hook: ' + (egg.reward || 'future-command-snake-mini-game') + '.';
      var feedback = document.getElementById('patchFeedback');
      if(feedback) feedback.textContent = reward.textContent;
    });

    revealWhenEvidenceVisible();
    return true;
  }

  ready(function(){
    var tries = 0;
    var timer = setInterval(function(){
      tries += 1;
      if(render() || tries > 50) clearInterval(timer);
    }, 150);
    document.addEventListener('click', function(){ setTimeout(revealWhenEvidenceVisible, 80); }, true);
    setInterval(revealWhenEvidenceVisible, 500);
  });
})();