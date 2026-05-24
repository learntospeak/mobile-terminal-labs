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

  function commandFeedback(s, cmd){
    var command = String(cmd.command || '').toLowerCase();
    var match = (s.investigation.plausibleWrongOptions || []).find(function(item){ return String(item.command || '').toLowerCase() === command; });
    if(match) return match.feedback || s.investigation.patchFeedback.wrongButPlausible;
    if(cmd.best) return s.investigation.patchFeedback.correctIntention || cmd.reason || 'Good choice.';
    return cmd.reason || s.investigation.patchFeedback.wrongButPlausible || 'That command is plausible, but check whether it answers the ticket.';
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
      '<div id="commandCategoryPanel" class="command-category-panel" data-command-category-panel hidden>',
      '  <p class="investigation-kicker">Command purpose</p>',
      '  <h3 class="investigation-subtitle">Now choose the type of command that fits that intention</h3>',
      '  <div class="command-category-grid" data-command-category-grid></div>',
      '  <div class="command-options is-locked" data-command-options-hidden-until-category="true" data-command-options></div>',
      '</div>',
      '<div id="evidenceQuestion" class="evidence-question" data-evidence-question hidden>',
      '  <p class="investigation-kicker">Evidence check</p>',
      '  <h3 class="investigation-subtitle" data-evidence-question-prompt></h3>',
      '  <div class="evidence-choice-grid" data-evidence-choice-grid></div>',
      '  <div class="evidence-explanation" data-evidence-explanation data-correct-answer hidden></div>',
      '</div>',
      '<div id="patchFeedback" class="investigation-feedback patch-feedback" data-patch-feedback>Patch: Pick the investigation path that best matches the ticket.</div>'
    ].join('');

    var grid = panel.querySelector('[data-intention-grid]');
    var categoryPanel = panel.querySelector('[data-command-category-panel]');
    var categoryGrid = panel.querySelector('[data-command-category-grid]');
    var commandOptions = panel.querySelector('[data-command-options]');
    var evidencePanel = panel.querySelector('[data-evidence-question]');
    var evidencePrompt = panel.querySelector('[data-evidence-question-prompt]');
    var evidenceGrid = panel.querySelector('[data-evidence-choice-grid]');
    var evidenceExplanation = panel.querySelector('[data-evidence-explanation]');

    function categoryById(id){
      return (s.investigation.commandCategories || []).find(function(cat){ return cat && cat.id === id; });
    }

    function firstEvidenceQuestion(){
      return (s.investigation.evidenceQuestions || [])[0];
    }

    function shouldShowEvidenceQuestion(cmd){
      var command = String(cmd.command || '').toLowerCase();
      return cmd.best && (/summary\.txt|type summary|dir/.test(command));
    }

    function renderEvidenceQuestion(sourceCommand){
      var q = firstEvidenceQuestion();
      if(!q) return;
      evidencePanel.hidden = false;
      evidencePanel.setAttribute('data-evidence-source', /summary/i.test(String(sourceCommand || '')) ? 'summary.txt' : 'folder-listing');
      evidencePrompt.textContent = q.prompt || 'What evidence did you find?';
      evidenceGrid.innerHTML = '';
      evidenceExplanation.hidden = true;
      evidenceExplanation.textContent = '';
      (q.choices || []).forEach(function(choice){
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'evidence-choice';
        btn.setAttribute('data-evidence-choice', choice);
        if(choice === q.answer) btn.setAttribute('data-correct-answer', 'true');
        btn.textContent = choice;
        btn.addEventListener('click', function(){
          panel.querySelectorAll('[data-evidence-choice-selected]').forEach(function(el){ el.removeAttribute('data-evidence-choice-selected'); });
          btn.setAttribute('data-evidence-choice-selected', 'true');
          var correct = choice === q.answer;
          evidenceExplanation.hidden = false;
          evidenceExplanation.setAttribute('data-evidence-result', correct ? 'correct' : 'wrong');
          evidenceExplanation.textContent = (correct ? 'Correct. ' : 'Not quite. ') + (q.explanation || 'Use the command output to choose the strongest evidence.');
          var feedback = document.getElementById('patchFeedback');
          if(feedback){
            feedback.setAttribute('data-patch-feedback-kind', correct ? 'correct-evidence' : 'wrong-evidence');
            feedback.textContent = 'Patch: ' + (correct ? (s.investigation.patchFeedback.evidenceRead || 'Good evidence reading.') : 'Close, but read the output again and choose the evidence that matches the ticket.');
          }
        });
        evidenceGrid.appendChild(btn);
      });
    }

    function renderCategories(intent){
      categoryPanel.hidden = false;
      categoryGrid.innerHTML = '';
      commandOptions.innerHTML = '<p class="investigation-copy">Choose a command category to reveal command options.</p>';
      commandOptions.classList.add('is-locked');
      commandOptions.setAttribute('data-command-options-hidden-until-category', 'true');
      if(evidencePanel) evidencePanel.hidden = true;
      (intent.commandCategories || []).map(categoryById).filter(Boolean).forEach(function(cat){
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'command-category-btn';
        btn.setAttribute('data-command-category', cat.id || cat.label || 'category');
        btn.innerHTML = '<span class="investigation-intention-label">' + escapeHtml(cat.label || 'Command category') + '</span><span class="investigation-intention-note">' + escapeHtml(cat.purpose || 'Choose this command purpose.') + '</span>';
        btn.addEventListener('click', function(){
          panel.querySelectorAll('[data-command-category-active]').forEach(function(el){ el.removeAttribute('data-command-category-active'); });
          btn.setAttribute('data-command-category-active', 'true');
          panel.setAttribute('data-active-command-category', cat.id || cat.label || 'category');
          renderCommands(cat);
        });
        categoryGrid.appendChild(btn);
      });
    }

    function renderCommands(cat){
      commandOptions.classList.remove('is-locked');
      commandOptions.removeAttribute('data-command-options-hidden-until-category');
      commandOptions.innerHTML = '';
      (cat.commands || []).forEach(function(cmd){
        var chip = document.createElement('button');
        var wrong = !cmd.best;
        chip.type = 'button';
        chip.className = 'investigation-command-option' + (wrong ? ' plausible-wrong-option' : '');
        chip.setAttribute('data-command-option', cmd.command || 'command');
        chip.setAttribute('data-command-best', cmd.best ? 'true' : 'false');
        if(wrong){
          chip.setAttribute('data-wrong-option', 'true');
          chip.setAttribute('data-plausible-wrong', 'true');
        }
        chip.innerHTML = '<span class="code">' + escapeHtml(cmd.command || '') + '</span><span>' + escapeHtml(cmd.reason || '') + '</span>';
        chip.addEventListener('click', function(){
          panel.querySelectorAll('[data-wrong-option-selected],[data-plausible-wrong-selected]').forEach(function(el){
            el.removeAttribute('data-wrong-option-selected');
            el.removeAttribute('data-plausible-wrong-selected');
          });
          if(wrong){
            chip.setAttribute('data-wrong-option-selected', 'true');
            chip.setAttribute('data-plausible-wrong-selected', 'true');
          }
          var feedback = document.getElementById('patchFeedback');
          if(feedback){
            feedback.setAttribute('data-patch-feedback-kind', wrong ? 'wrong' : 'correct');
            feedback.setAttribute('data-feedback-for', wrong ? 'wrong' : 'correct');
            feedback.textContent = 'Patch: ' + commandFeedback(s, cmd);
          }
          if(shouldShowEvidenceQuestion(cmd)) renderEvidenceQuestion(cmd.command);
        });
        commandOptions.appendChild(chip);
      });
    }

    (s.investigation.intentions || []).forEach(function(intent){
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'investigation-intention-btn intention-choice' + (!intent.best ? ' plausible-wrong-option' : '');
      btn.setAttribute('data-intention-choice', intent.id || intent.label || 'choice');
      btn.setAttribute('data-intention-kind', intent.best ? 'best' : 'distractor');
      btn.setAttribute('data-intention-best', intent.best ? 'true' : 'false');
      if(!intent.best){
        btn.setAttribute('data-wrong-option', 'true');
        btn.setAttribute('data-plausible-wrong', 'true');
      }
      btn.innerHTML = '<span class="investigation-intention-label">' + escapeHtml(intent.label || 'Choose path') + '</span><span class="investigation-intention-note">' + escapeHtml(intent.best ? 'Best fit for this ticket' : 'Plausible, but probably not first') + '</span>';
      btn.addEventListener('click', function(){
        panel.setAttribute('data-selected-intention', intent.id || intent.label || 'choice');
        panel.querySelectorAll('[data-intention-active]').forEach(function(el){ el.removeAttribute('data-intention-active'); });
        panel.querySelectorAll('[data-wrong-option-selected],[data-plausible-wrong-selected]').forEach(function(el){
          el.removeAttribute('data-wrong-option-selected');
          el.removeAttribute('data-plausible-wrong-selected');
        });
        btn.setAttribute('data-intention-active', 'true');
        if(!intent.best){
          btn.setAttribute('data-wrong-option-selected', 'true');
          btn.setAttribute('data-plausible-wrong-selected', 'true');
        }
        var feedback = document.getElementById('patchFeedback');
        if(feedback){
          feedback.setAttribute('data-patch-feedback-kind', intent.best ? 'correct' : 'wrong');
          feedback.setAttribute('data-feedback-for', intent.best ? 'correct' : 'wrong');
          feedback.textContent = 'Patch: ' + (intent.explanation || (intent.best ? s.investigation.patchFeedback.correctIntention : s.investigation.patchFeedback.wrongButPlausible));
        }
        renderCategories(intent);
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