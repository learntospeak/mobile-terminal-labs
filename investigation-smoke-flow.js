(function(){
  function tap(el){ if(!el) return false; try{ el.click(); return true; }catch(e){ return false; } }
  function wait(ms){ return new Promise(function(resolve){ setTimeout(resolve, ms); }); }

  async function exercise(){
    var panel = document.getElementById('investigationPanel');
    if(!panel) return false;
    tap(panel.querySelector('[data-intention-best="false"], [data-intention-kind="distractor"]'));
    await wait(80);
    tap(panel.querySelector('[data-intention-best="true"], [data-intention-kind="best"]'));
    await wait(120);
    tap(panel.querySelector('[data-command-category="evidence"]') || panel.querySelector('[data-command-category="navigation"]') || panel.querySelector('[data-command-category]'));
    await wait(120);
    tap(panel.querySelector('[data-command-best="false"]'));
    await wait(100);
    var best = Array.from(panel.querySelectorAll('[data-command-best="true"]')).find(function(el){ return /summary|dir/i.test(el.getAttribute('data-command-option') || el.textContent || ''); }) || panel.querySelector('[data-command-best="true"]');
    tap(best);
    await wait(120);
    tap(panel.querySelector('[data-evidence-choice][data-correct-answer="true"]') || panel.querySelector('[data-evidence-choice]'));
    await wait(100);
    tap(panel.querySelector('[data-red-herring-trigger]'));
    await wait(80);
    tap(panel.querySelector('[data-easter-egg-trigger]'));
    await wait(100);
    panel.setAttribute('data-smoke-flow-exercised','true');
    return true;
  }

  window.NetlabInvestigationSmokeFlow = { exercise: exercise };
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(exercise, 1200); });
})();