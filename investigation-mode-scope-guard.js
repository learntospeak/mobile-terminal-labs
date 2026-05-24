(function(){
  const PILOT = 'win-dir-incident-triage';

  function currentScenarioId(){
    const params = new URLSearchParams(location.search);
    const direct = params.get('scenario') || params.get('scenarioId') || params.get('lesson') || window.__NETLAB_DIRECT_SCENARIO_ID || '';
    return direct === 'incident-folder-triage' ? PILOT : direct;
  }

  function isInvestigationSmokePage(){
    return /investigation-mode-smoke-test\.html/i.test(location.pathname);
  }

  function shouldAllowPilotUi(){
    if (isInvestigationSmokePage()) return true;
    return currentScenarioId() === PILOT;
  }

  function shouldAllowEggSmokeUi(){
    return isInvestigationSmokePage();
  }

  function removeOutOfScopeUi(){
    if (!shouldAllowPilotUi()) {
      document.querySelectorAll('#investigationPanel,#investigationCuriosityPanel,#patchPingRunGame,#investigationReview').forEach(function(el){ el.remove(); });
      document.body.removeAttribute('data-investigation-mode-active');
    }

    if (!shouldAllowEggSmokeUi()) {
      document.querySelectorAll('#eggSmokeCard,#eggSmokeSummary,#eggSmokeResults').forEach(function(el){ el.remove(); });
    }
  }

  function install(){
    removeOutOfScopeUi();
    let tries = 0;
    const timer = setInterval(function(){
      tries += 1;
      removeOutOfScopeUi();
      if (tries > 100) clearInterval(timer);
    }, 120);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();
})();