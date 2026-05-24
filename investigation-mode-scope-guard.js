(function(){
  const PILOT = 'win-dir-incident-triage';

  function currentScenarioId(){
    const params = new URLSearchParams(location.search);
    const direct = params.get('scenario') || params.get('scenarioId') || params.get('lesson') || window.__NETLAB_DIRECT_SCENARIO_ID || '';
    return direct === 'incident-folder-triage' ? PILOT : direct;
  }

  function isSmokePage(){
    return /investigation-mode-smoke-test\.html/i.test(location.pathname);
  }

  function shouldAllowInvestigationUi(){
    if (isSmokePage()) return true;
    return currentScenarioId() === PILOT;
  }

  function removePilotUi(){
    if (shouldAllowInvestigationUi()) return;
    document.querySelectorAll('#investigationPanel,#investigationCuriosityPanel,#patchPingRunGame,#investigationReview').forEach(function(el){ el.remove(); });
    document.body.removeAttribute('data-investigation-mode-active');
  }

  function install(){
    removePilotUi();
    let tries = 0;
    const timer = setInterval(function(){
      tries += 1;
      removePilotUi();
      if (tries > 80) clearInterval(timer);
    }, 150);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();
})();