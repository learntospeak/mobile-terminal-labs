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
    return String(value || '').replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]; });
  }

  function render(){
    var s = scenario();
    if(!s || s.id !== 'win-dir-incident-triage') return false;
    var panel = document.getElementById('investigationPanel');
    if(!panel) return false;
    if(document.getElementById('investigationReview')) return true;

    var review = s.investigationReview || (s.investigation && s.investigation.completionReview) || {};
    var box = document.createElement('section');
    box.id = 'investigationReview';
    box.className = 'evidence-question investigation-review';
    box.setAttribute('data-investigation-review', 'true');
    box.innerHTML = [
      '<p class="investigation-kicker">Investigation review</p>',
      '<h3 class="investigation-subtitle">' + escapeHtml(review.title || 'Investigation Complete') + '</h3>',
      '<div class="evidence-explanation" data-review-intention-summary="true"><strong>Intention:</strong> ' + escapeHtml(review.intentionSummary || 'You chose an investigation path before running commands.') + '</div>',
      '<div class="evidence-explanation" data-review-evidence-summary="true"><strong>Evidence:</strong> ' + escapeHtml(review.evidenceSummary || 'You used command output to decide what mattered.') + '</div>',
      '<div class="evidence-explanation" data-review-real-world-meaning="true"><strong>Real-world meaning:</strong> ' + escapeHtml(review.realWorldMeaning || 'Good support work follows evidence instead of guessing.') + '</div>'
    ].join('');

    panel.appendChild(box);
    return true;
  }

  ready(function(){
    var tries = 0;
    var timer = setInterval(function(){
      tries += 1;
      if(render() || tries > 60) clearInterval(timer);
    }, 150);
  });
})();